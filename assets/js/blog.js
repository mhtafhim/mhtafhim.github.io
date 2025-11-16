/**
 * Blog JavaScript - Handles blog listing page
 */

let blogPosts = [];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  loadBlogPosts();
  initScrollHide();
  initNavigation();
  initThemeToggle();
});

/**
 * Initialize navigation menu
 */
function initNavigation() {
  const currentPath = window.location.pathname;
  const filename = currentPath.split('/').pop() || '';
  
  document.querySelectorAll('#sidebar-nav .nav-links a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (filename === linkPath || 
        (filename === '' && linkPath === 'index.html') ||
        (filename === 'blog.html' && linkPath === 'blog.html')) {
      link.classList.add('active');
    }
  });
}

/**
 * Initialize scroll hide behavior for navbar
 */
function initScrollHide() {
  const sidebar = document.getElementById('sidebar-nav');
  if (!sidebar) return;
  
  let lastScrollTop = 0;
  let scrollTimeout;
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    clearTimeout(scrollTimeout);
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      sidebar.classList.add('hidden');
    } 
    else if (scrollTop < lastScrollTop || scrollTop <= 100) {
      sidebar.classList.remove('hidden');
    }
    
    lastScrollTop = scrollTop;
    
    scrollTimeout = setTimeout(() => {
      sidebar.classList.remove('hidden');
    }, 1500);
  });
  
  document.addEventListener('mousemove', (e) => {
    if (e.clientX < 50) {
      sidebar.classList.remove('hidden');
    }
  });
}

/**
 * Load blog posts from JSON
 */
async function loadBlogPosts() {
  try {
    const response = await fetch('data/posts.json');
    blogPosts = await response.json();
    renderBlogPosts();
  } catch (error) {
    console.error('Error loading blog posts:', error);
    const container = document.getElementById('blog-container');
    if (container) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No blog posts available yet. Check back soon!</p>';
    }
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

/**
 * Initialize Dark/Light Theme Toggle
 */
function initThemeToggle() {
  const themeSwitch = document.getElementById('theme-switch');
  if (!themeSwitch) return;

  // Check for saved theme preference
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'light') {
      themeSwitch.checked = true;
    }
  }

  themeSwitch.addEventListener('change', function() {
    if (this.checked) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}
