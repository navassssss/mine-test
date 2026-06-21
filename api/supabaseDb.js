// live_api/supabaseDb.js
// Supabase Database client and operations wrapper for checking/consuming API key quotas

import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

let supabaseAdmin = null;
let warnedAboutKey = false;

function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;

  const url = config.SUPABASE_URL;
  const serviceKey = config.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey && serviceKey !== 'your-supabase-service-role-key' && serviceKey.trim() !== '') {
    supabaseAdmin = createClient(url, serviceKey, {
      auth: {
        persistSession: false
      }
    });
    console.log('[Supabase DB] Service client initialized successfully.');
  } else if (!warnedAboutKey) {
    console.warn('[Supabase DB Warning] SUPABASE_SERVICE_ROLE_KEY is missing or unconfigured. Falling back to local validation for development.');
    warnedAboutKey = true;
  }
  return supabaseAdmin;
}

// Validate key and decrement quota
export async function consumeRequest(apiKey) {
  const adminClient = getSupabaseAdmin();
  if (!adminClient) {
    // Development fallback if credentials aren't initialized yet
    return { valid: true, quotaExhausted: false, requestsRemaining: 30 };
  }

  try {
    // 1. Fetch user profile matching the API key
    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('id, requests_remaining')
      .eq('api_key', apiKey)
      .maybeSingle();

    if (error) {
      console.error('[Supabase DB] Key lookup error:', error.message);
      return { valid: false, error: 'Database lookup error.' };
    }

    if (!profile) {
      return { valid: false, error: 'Invalid API key.' };
    }

    // 2. Check if remaining requests are exhausted
    if (profile.requests_remaining <= 0) {
      return { valid: true, quotaExhausted: true, requestsRemaining: 0 };
    }

    // 3. Decrement quota in database
    const nextQuota = profile.requests_remaining - 1;
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ requests_remaining: nextQuota })
      .eq('id', profile.id);

    if (updateError) {
      console.error('[Supabase DB] Quota update error:', updateError.message);
      return { valid: false, error: 'Quota update failed.' };
    }

    return { valid: true, quotaExhausted: false, requestsRemaining: nextQuota };
  } catch (err) {
    console.error('[Supabase DB] Unexpected query failure:', err);
    return { valid: false, error: 'Internal database error.' };
  }
}
