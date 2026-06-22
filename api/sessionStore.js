// sessionStore.js
// Shared runtime session store manager to handle credentials and single-flight lock concurrency.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionPath = path.resolve(__dirname, 'session.json');

let refreshPromise = null;
let lastRefreshTime = 0;
const COOLDOWN_PERIOD = 300000; // 5-minute cooling off period on failure

let sessionCache = null;
let sessionCacheTime = 0;
const SESSION_CACHE_TTL = 5000; // 5 seconds cache TTL

let localRefreshHandler = null;

export const sessionStore = {
  /**
   * Registers the local Puppeteer refresh handler if running in the Web App process.
   */
  registerRefreshHandler(handler) {
    localRefreshHandler = handler;
  },

  /**
   * Reads session credentials from session.json, falling back to configuration environment values.
   */
  readSession() {
    // Return cached session if it's fresh enough (prevents synchronous disk I/O bottleneck)
    if (sessionCache && (Date.now() - sessionCacheTime < SESSION_CACHE_TTL)) {
      return sessionCache;
    }

    try {
      if (fs.existsSync(sessionPath)) {
        sessionCache = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        sessionCacheTime = Date.now();
        return sessionCache;
      }
    } catch (e) {
      console.error("[SessionStore] Error reading session.json:", e.message);
    }

    // Default credentials fallback from configuration
    const defaults = {
      status: 'ACTIVE',
      cookies: {
        'kimi-auth': config.MINE_TEST_AUTH_COOKIE || '',
        '__cf_bm': config.CF_BM || ''
      },
      headers: {
        'x-msh-shield-data': config.X_MSH_SHIELD_DATA || ''
      },
      updatedAt: Date.now()
    };

    try {
      fs.writeFileSync(sessionPath, JSON.stringify(defaults, null, 2), 'utf8');
      sessionCache = defaults;
      sessionCacheTime = Date.now();
      console.log("[SessionStore] Initialized session.json seed file.");
    } catch (err) {
      console.error("[SessionStore] Error writing initial session.json:", err.message);
    }

    return defaults;
  },

  /**
   * Merges updates into session.json.
   */
  writeSession(updates) {
    const current = this.readSession();
    
    if (updates.status) current.status = updates.status;
    if (updates.cookies) current.cookies = { ...current.cookies, ...updates.cookies };
    if (updates.headers) current.headers = { ...current.headers, ...updates.headers };
    if (updates.lastError !== undefined) current.lastError = updates.lastError;
    current.updatedAt = Date.now();

    try {
      fs.writeFileSync(sessionPath, JSON.stringify(current, null, 2), 'utf8');
      sessionCache = current;
      sessionCacheTime = Date.now();
      console.log("[SessionStore] session.json updated successfully.");
    } catch (e) {
      console.error("[SessionStore] Error writing session.json:", e.message);
    }
    return current;
  },

  /**
   * Single-flight concurrency controller to acquire a fresh authenticated session.
   * If a refresh is already in progress, concurrent callers await the active promise.
   */
  async acquireFreshSession() {
    if (refreshPromise) {
      console.log("[SessionStore Lock] Waiting for active session refresh to complete...");
      return refreshPromise;
    }

    const current = this.readSession();
    if (current.status === 'FAILED' && (Date.now() - lastRefreshTime < COOLDOWN_PERIOD)) {
      throw new Error(`Session refresh is in cooldown. Please wait 5 minutes before retrying.`);
    }

    console.log("[SessionStore Lock] Initiating single-flight session refresh...");
    this.writeSession({ status: 'REFRESHING' });

    refreshPromise = (async () => {
      try {
        let result;
        if (localRefreshHandler) {
          console.log("[SessionStore] Executing local refresh handler (Web App context)...");
          result = await localRefreshHandler();
        } else if (process.env.NODE_ENV === 'production') {
          // In production, no Puppeteer handler. Re-read from env vars in case they were updated.
          console.warn("[SessionStore] No refresh handler in production. Re-seeding session from environment variables...");
          const envSession = {
            status: 'ACTIVE',
            cookies: {
              'kimi-auth': config.MINE_TEST_AUTH_COOKIE || '',
              '__cf_bm': config.CF_BM || ''
            },
            headers: {
              'x-msh-shield-data': config.X_MSH_SHIELD_DATA || ''
            },
            updatedAt: Date.now()
          };
          this.writeSession(envSession);
          throw new Error('Session tokens expired. Please update BEARER_TOKEN, MINE_TEST_AUTH_COOKIE, CF_BM, and X_MSH_SHIELD_DATA in Render environment variables.');
        } else {
          console.log("[SessionStore] Requesting Web App to refresh session via HTTP endpoint...");
          const webAppPort = process.env.PORT || '3000';
          const webAppUrl = `http://localhost:${webAppPort}/api/internal/refresh-session`;
          const res = await fetch(webAppUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${config.BEARER_TOKEN}`
            }
          });

          if (!res.ok) {
            throw new Error(`Web App returned HTTP ${res.status}`);
          }
          result = await res.json();
        }

        if (!result || !result.success) {
          throw new Error(result?.reason || result?.error || "Refresh operation returned failure");
        }

        // Store new tokens
        this.writeSession({
          status: 'ACTIVE',
          cookies: {
            '__cf_bm': result.CF_BM || ''
          },
          headers: {
            'x-msh-shield-data': result.X_MSH_SHIELD_DATA || ''
          },
          lastError: null
        });

        console.log("[SessionStore] Session refreshed and activated successfully.");
        return true;
      } catch (err) {
        console.error("[SessionStore] Session refresh failed:", err.message);
        this.writeSession({
          status: 'FAILED',
          lastError: err.message
        });
        lastRefreshTime = Date.now();
        throw err;
      }
    })();

    try {
      return await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  }
};
