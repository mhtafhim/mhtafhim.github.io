/**
 * Blog JavaScript - Handles blog listing page
 */

let blogPosts = [];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  loadBlogPosts();
  initAnimations();
});

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
      <div class="blog-card fade-in" onclick="openBlogPost('${post.slug}')">
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
 * Open a blog post
 */
function openBlogPost(slug) {
  window.location.href = `post.html?slug=${slug}`;
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
 * Initialize animations
 */
function initAnimations() {
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.utils.toArray('.blog-card').forEach((card, index) => {
      gsap.from(card, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: index * 0.1,
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    });
  }
}

