/**
 * Blog Post JavaScript - Handles individual blog post page
 */

let blogPosts = [];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  loadBlogPost();
});

/**
 * Load and display blog post
 */
async function loadBlogPost() {
  try {
    // Get slug from URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
      showError('No blog post specified.');
      return;
    }
    
    // Load posts JSON
    const response = await fetch('data/posts.json');
    blogPosts = await response.json();
    
    // Find the post
    const post = blogPosts.find(p => p.slug === slug);
    
    if (!post) {
      showError('Blog post not found.');
      return;
    }
    
    // Render the post
    renderBlogPost(post);
    
    // Initialize animations
    initAnimations();
  } catch (error) {
    console.error('Error loading blog post:', error);
    showError('Error loading blog post. Please try again later.');
  }
}

/**
 * Render blog post content
 */
function renderBlogPost(post) {
  const header = document.getElementById('blog-post-header');
  const content = document.getElementById('blog-post-content');
  
  if (!header || !content) return;
  
  // Render header
  header.innerHTML = `
    <h1>${post.title}</h1>
    <div class="date">${formatDate(post.date)}</div>
    ${post.cover ? `<img src="${post.cover}" alt="${post.title}" style="max-width: 100%; border-radius: 12px; margin-top: 2rem;" onerror="this.style.display='none'">` : ''}
  `;
  
  // Render content - convert \n to <br>
  let contentHtml = post.content || '';
  contentHtml = contentHtml.replace(/\n/g, '<br>');
  
  // Wrap content in paragraphs if it's plain text
  if (!contentHtml.includes('<p>') && !contentHtml.includes('<h')) {
    contentHtml = contentHtml.split('<br><br>').map(para => {
      if (para.trim()) {
        return `<p>${para.replace(/<br>/g, ' ')}</p>`;
      }
      return '';
    }).join('');
  }
  
  content.innerHTML = contentHtml;
  
  // Update page title
  document.title = `${post.title} | Blog`;
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
 * Show error message
 */
function showError(message) {
  const container = document.querySelector('.blog-post') || document.body;
  container.innerHTML = `
    <div style="text-align: center; padding: 4rem 2rem;">
      <h2 style="color: var(--accent); margin-bottom: 1rem;">Oops!</h2>
      <p style="color: var(--text-secondary); margin-bottom: 2rem;">${message}</p>
      <a href="blog.html" class="btn btn-primary">Back to Blog</a>
    </div>
  `;
}

/**
 * Initialize animations
 */
function initAnimations() {
  if (typeof gsap !== 'undefined') {
    gsap.from('#blog-post-header', {
      opacity: 0,
      y: 30,
      duration: 0.8
    });
    
    gsap.from('#blog-post-content', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: 0.2
    });
  }
}

