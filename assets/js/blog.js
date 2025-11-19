document.addEventListener('DOMContentLoaded', async () => {
    const postsContainer = document.getElementById('posts-container');
    const posts = await fetchData('data/posts.json');

    if (!posts) {
        postsContainer.innerHTML = '<p>Failed to load posts.</p>';
        return;
    }

    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'card blog-card';
        card.innerHTML = `
            <h3><a href="post.html?slug=${post.slug}">${post.title}</a></h3>
            <div class="blog-meta"><i class="far fa-calendar-alt"></i> ${post.date}</div>
            <p>${post.summary}</p>
            <a href="post.html?slug=${post.slug}" class="btn" style="margin-top: 1rem; font-size: 0.875rem;">Read More</a>
        `;
        postsContainer.appendChild(card);
    });

    if (typeof gsap !== 'undefined') {
        gsap.from('.blog-card', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            stagger: 0.15,
            ease: 'power2.out'
        });
    }
});
