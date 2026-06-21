// supabase_auth/public/js/auth-guard.js
// Client-side authentication middleware guard for route protection

async function checkAuth(requireAuth = true) {
  try {
    const client = await getSupabaseClient();
    const { data: { session }, error } = await client.auth.getSession();

    if (error) {
      console.error('Session retrieval error:', error);
      if (requireAuth) {
        window.location.href = '/login?error=auth_error';
      }
      return null;
    }

    if (requireAuth) {
      // Route is protected, user must be logged in and email verified
      if (!session) {
        window.location.href = '/login?error=unauthorized';
        return null;
      }

      const user = session.user;
      
      // Enforce email verification status check
      if (!user.email_confirmed_at) {
        console.warn('Access denied: Email is not verified.');
        // Sign out to clean up local storage session and redirect
        await client.auth.signOut();
        window.location.href = '/login?error=unverified';
        return null;
      }

      return session;
    } else {
      // Public route (login/register): redirect verified logged-in users to dashboard
      if (session && session.user && session.user.email_confirmed_at) {
        window.location.href = '/dashboard';
      }
      return session;
    }
  } catch (err) {
    console.error('Guard routing failure:', err);
    if (requireAuth) {
      window.location.href = '/login?error=system_error';
    }
    return null;
  }
}
