// Preserve previously shared post.html?slug=... links.
document.addEventListener('DOMContentLoaded', async () => {
  const slug = new URLSearchParams(location.search).get('slug');
  const container = document.querySelector('#post-content');
  try {
    const response = await fetch('data/log-index.json');
    if (!response.ok) throw new Error('Unable to load the Log index.');
    const posts = await response.json();
    if (slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && posts.some(post => post.slug === slug)) {
      location.replace(`log/${encodeURIComponent(slug)}.html${location.hash}`);
      return;
    }
    container.innerHTML = '<h1>Post not found</h1><p>This article may have moved. <a href="log.html">Browse all posts</a>.</p>';
  } catch {
    container.innerHTML = '<h1>Unable to open this post</h1><p>Please reload the page or <a href="log.html">browse all posts</a>.</p>';
  }
});
