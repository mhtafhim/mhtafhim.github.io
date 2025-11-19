document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    const posts = await fetchData('data/posts.json');
    if (!posts) return;

    const currentPost = posts.find(p => p.slug === slug);
    const container = document.getElementById('post-content');
    const sidebar = document.getElementById('sidebar-posts');

    if (currentPost) {
        document.title = `${currentPost.title} - Mahmudul Haque Tafhim`;
        container.innerHTML = `
            <h1>${currentPost.title}</h1>
            <div class="blog-meta" style="margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                <i class="far fa-calendar-alt"></i> ${currentPost.date}
            </div>
            <div class="post-body" style="font-size: 1.1rem; color: var(--text-secondary);">
                ${currentPost.content}
            </div>
        `;
    } else {
        container.innerHTML = '<h1>Post not found</h1><p>The requested article could not be found.</p>';
    }

    // Sidebar: Other posts
    posts.forEach(post => {
        if (post.slug !== slug) {
            const link = document.createElement('a');
            link.href = `post.html?slug=${post.slug}`;
            link.className = 'sidebar-link';
            link.textContent = post.title;
            sidebar.appendChild(link);
        }
    });

    if (typeof gsap !== 'undefined') {
        gsap.from('#post-content', { duration: 0.8, y: 30, opacity: 0, ease: 'power2.out' });
        gsap.from('.sidebar', { duration: 0.8, x: 30, opacity: 0, delay: 0.2, ease: 'power2.out' });
    }
});
