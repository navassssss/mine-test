// sessionStore.js
// Shared runtime session store manager to handle credentials and single-flight lock concurrency.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './src/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionPath = path.resolve(__dirname, 'session.json');

let refreshPromise = null;
let lastRefreshTime = 0;
const COOLDOWN_PERIOD = 300000; // 5-minute cooling off period on failure

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
    try {
      if (fs.existsSync(sessionPath)) {
        return JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
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
    console.warn("[SessionStore] Session refresh is disabled (puppeteer removed). Please update credentials manually.");
    this.writeSession({ status: 'FAILED', lastError: 'Session expired. Manual update required.' });
    throw new Error("Session expired. Please update credentials manually in .env or Settings.");
  }
};
