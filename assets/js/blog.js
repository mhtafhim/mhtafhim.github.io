/**
 * Blog JavaScript - Handles blog listing page
 */

let blogPosts = [];

// Utility function to ensure sidebar is shown on desktop initially
function showSidebarOnDesktop() {
  const sidebar = document.getElementById('sidebar-nav');
  if (sidebar && window.innerWidth > 768) {
    sidebar.classList.remove('hidden');
    sidebar.classList.remove('active'); // Ensure no mobile active class
    document.body.classList.remove('no-scroll'); // Ensure scroll is enabled
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  loadBlogPosts();
  showSidebarOnDesktop(); // Ensure sidebar is visible on desktop immediately
  initScrollHide();
  initNavigation();
  initMobileMenuToggle(); // Initialize mobile menu toggle
  applySystemTheme(); // Apply theme based on system settings
});

/**
 * Initialize navigation menu
 */
function initNavigation() {
  const currentPath = window.location.pathname;
  const filename = currentPath.split('/').pop() || '';
  
  document.querySelectorAll('#sidebar-nav .nav-links a').forEach(link => {
    const linkPath = link.getAttribute('href');
    const currentHash = window.location.hash;
    const isIndexHtml = filename === 'index.html' || filename === '';
    const isBlogHtml = filename === 'blog.html';

    if ((linkPath === 'blog.html' && isBlogHtml) ||
        (linkPath === 'index.html' && isIndexHtml && currentHash === '') ||
        (linkPath === 'index.html#hero' && isIndexHtml && currentHash === '#hero') ||
        (linkPath === `index.html${currentHash}` && currentHash !== '')) {
      link.classList.remove('active'); // Remove active class by default
      link.classList.add('active');
    }
  });

  // Handle initial active link on load for blog.html with a slight delay
  setTimeout(() => {
    const currentHash = window.location.hash;
    const homeLink = document.querySelector('#sidebar-nav .nav-links a[href="index.html#hero"]');
    if (homeLink && currentHash === '#hero') {
      homeLink.classList.add('active');
    } else if (filename === 'blog.html') {
      const blogLink = document.querySelector('#sidebar-nav .nav-links a[href="blog.html"]');
      if (blogLink) {
        blogLink.classList.add('active');
      }
    }
  }, 0);
}

/**
 * Initialize scroll hide behavior for navbar
 */
function initScrollHide() {
  const sidebar = document.getElementById('sidebar-nav');
  if (!sidebar) return;
  
  let lastScrollTop = 0;
  let scrollTimeout;
  
  // Removed: Show sidebar initially on desktop, now handled by showSidebarOnDesktop()

  window.addEventListener('scroll', () => {
    if (window.innerWidth <= 768) return; // Disable on mobile, mobile uses menu toggle

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    clearTimeout(scrollTimeout);
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      sidebar.classList.add('hidden');
    } 
    else if (scrollTop < lastScrollTop || scrollTop <= 100) {
      sidebar.classList.remove('hidden');
    }
    
    lastScrollTop = scrollTop;
    
    // Keep sidebar visible for a short period after scrolling stops
    scrollTimeout = setTimeout(() => {
      sidebar.classList.remove('hidden');
    }, 1500);
  });
  
  document.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768) return; // Disable on mobile
    if (e.clientX < 50) {
      sidebar.classList.remove('hidden');
    }
  });

  // Handle resize to show/hide sidebar based on desktop/mobile view
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('hidden');
      sidebar.classList.remove('active'); // Ensure mobile active class is removed
      document.body.classList.remove('no-scroll'); // Ensure scroll is enabled
    } else {
      sidebar.classList.add('hidden'); // Hide sidebar on mobile by default
    }
  });
}

/**
 * Load blog posts from JSON
 */
async function loadBlogPosts() {
  try {
    const response = await fetchJsonWithRetry('data/posts.json');
    blogPosts = response;
    renderBlogPosts();
  } catch (error) {
    console.error('Error loading blog posts:', error);
    showError('Error loading blog posts.', error.message);
  }
}

/**
 * Render blog posts to the page
 */
function renderBlogPosts() {
  const container = document.getElementById('blog-container');
  if (!container) return;
  
  if (blogPosts.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No blog posts available yet. Check back soon!</p>';
    return;
  }
  
  // Sort by date (newest first)
  const sortedPosts = [...blogPosts].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  let html = '';
  sortedPosts.forEach(post => {
    html += `
      <div class="blog-card" onclick="window.location.href='post.html?slug=${post.slug}'">
        ${post.cover ? `<img src="${post.cover}" alt="${post.title}" class="cover" onerror="this.style.display='none'">` : ''}
        <div class="content">
          <h3>${post.title}</h3>
          <div class="date">${formatDate(post.date)}</div>
          <p class="summary">${post.short || ''}</p>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

/**
 * Format date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function applySystemTheme() {
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (prefersLight) {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

function initMobileMenuToggle() {
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.getElementById('sidebar-nav');
  const navLinks = document.querySelectorAll('#sidebar-nav .nav-links a');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      document.body.classList.toggle('no-scroll'); // Toggle no-scroll class on body
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('active');
        document.body.classList.remove('no-scroll'); // Remove no-scroll class
      });
    });
  }
}

// Utility functions for fetching JSON with retry and showing errors
// These are copied from main.js to ensure they are available in this context
async function fetchJsonWithRetry(url) {
  const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
  const possiblePaths = [
    url,
    `./${url}`,
    `/${url}`,
    `${baseUrl}${url}`,
    encodeURI(url),
    encodeURI(`./${url}`),
    encodeURI(`/${url}`),
    encodeURI(`${baseUrl}${url}`)
  ];
  let lastError = null;
  for (const path of possiblePaths) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        console.log(`Successfully loaded from: ${path}`);
        return await res.json();
      } else {
        lastError = new Error(`HTTP error! status: ${res.status} from ${path}`);
      }
    } catch (err) {
      lastError = err;
      console.warn(`Failed to load from ${path}:`, err);
    }
  }
  throw new Error(`Failed to load JSON file (${url}). Last error: ${lastError?.message || 'Unknown error'}`);
}

function showError(title, message) {
  const container = document.querySelector('.main-content') || document.body;
  const errorMsg = document.createElement('div');
  errorMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bg-card); padding: 2rem; border-radius: 12px; border: 1px solid var(--border); z-index: 9999; text-align: center; max-width: 600px; box-shadow: var(--shadow-lg);';
  errorMsg.innerHTML = `
    <h3 style="color: var(--accent); margin-bottom: 1rem;">${title}</h3>
    <p style="color: var(--text-secondary); margin-bottom: 1rem;">${message}</p>
    <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem;">
      If you are viewing this on GitHub Pages, ensure your repository name is correctly configured as the base URL.
      Also, check your browser's console (F12) and network tab for specific errors related to loading JSON files.
    </p>
    <button onclick="this.parentElement.remove()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: var(--accent); border: none; border-radius: 6px; color: white; cursor: pointer;">Close</button>
  `;
  container.appendChild(errorMsg);
}
