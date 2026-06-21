// js/navbar.js
// Handles dynamic single unified navbar rendering based on active Supabase developer session

async function handleNavbarLogout(e) {
  if (e) e.preventDefault();
  try {
    const client = await getSupabaseClient();
    await client.auth.signOut();
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    window.location.href = '/login';
  }
}

async function updateNavbarAuthButton() {
  try {
    const client = await getSupabaseClient();
    const { data: { session } } = await client.auth.getSession();
    
    const nav = document.querySelector('header nav');
    if (nav) {
      // Determine current active page path to highlight correct link
      const path = window.location.pathname;
      
      if (session) {
        // Logged In: Consolidate Dashboard, Profile, and Sign Out into a single unified navbar
        nav.innerHTML = `
          <a href="/" class="${path === '/' || path === '/index.html' ? 'active' : ''}">Home</a>
          <a href="/docs" class="${path === '/docs' || path === '/docs.html' ? 'active' : ''}">Documentation</a>
          <a href="/models" class="${path === '/models' || path === '/models.html' ? 'active' : ''}">Models</a>
          <a href="/about" class="${path === '/about' || path === '/about.html' ? 'active' : ''}">About</a>
          <a href="/dashboard" class="${path === '/dashboard' || path === '/dashboard.html' ? 'active' : ''}">Dashboard</a>
          <a href="/profile" class="${path === '/profile' || path === '/profile.html' ? 'active' : ''}">Profile</a>
          <a href="#" onclick="handleNavbarLogout(event)" class="btn-primary">Sign Out</a>
        `;
      } else {
        // Logged Out
        nav.innerHTML = `
          <a href="/" class="${path === '/' || path === '/index.html' ? 'active' : ''}">Home</a>
          <a href="/docs" class="${path === '/docs' || path === '/docs.html' ? 'active' : ''}">Documentation</a>
          <a href="/models" class="${path === '/models' || path === '/models.html' ? 'active' : ''}">Models</a>
          <a href="/about" class="${path === '/about' || path === '/about.html' ? 'active' : ''}">About</a>
          <a href="/login" class="btn-primary">Login</a>
        `;
      }
    }
    
    // Set up hamburger menu toggle for mobile
    setupMobileMenu();
  } catch (err) {
    console.warn('Navbar session load failed, using default values:', err.message);
  }
}

function setupMobileMenu() {
  const container = document.querySelector('.nav-container');
  const nav = document.querySelector('header nav');
  if (!container || !nav) return;

  // Check if hamburger already exists
  if (document.getElementById('mobile-menu-toggle')) return;

  // Create hamburger button
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'mobile-menu-toggle';
  toggleBtn.className = 'mobile-menu-toggle';
  toggleBtn.setAttribute('aria-label', 'Toggle Navigation Menu');
  toggleBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" class="line-1" d="M4 6h16" />
      <path stroke-linecap="round" stroke-linejoin="round" class="line-2" d="M4 12h16" />
      <path stroke-linecap="round" stroke-linejoin="round" class="line-3" d="M4 18h16" />
    </svg>
  `;

  // Toggle nav and hamburger state on click
  toggleBtn.addEventListener('click', () => {
    nav.classList.toggle('mobile-open');
    toggleBtn.classList.toggle('open');
  });

  // Close nav on click outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggleBtn.contains(e.target)) {
      nav.classList.remove('mobile-open');
      toggleBtn.classList.remove('open');
    }
  });

  container.appendChild(toggleBtn);
}

document.addEventListener('DOMContentLoaded', updateNavbarAuthButton);
window.addEventListener('load', updateNavbarAuthButton);
