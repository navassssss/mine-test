// supabase_auth/public/js/supabase-client.js
// Supabase Client Initialization utilizing dynamic server-side configuration

let clientInstance = null;

async function getSupabaseClient() {
  if (clientInstance) return clientInstance;

  try {
    const res = await fetch('/config');
    if (!res.ok) {
      throw new Error(`Failed to fetch config: ${res.statusText}`);
    }
    const { supabaseUrl, supabaseAnonKey } = await res.json();
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing in server response.');
    }
    
    // The supabase object is loaded via the global CDN script
    clientInstance = supabase.createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return clientInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    throw err;
  }
}
