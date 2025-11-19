document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initAnimations();
});

function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-link');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Highlight active link based on current page
    const currentPath = window.location.pathname;
    links.forEach(link => {
        if (link.getAttribute('href') === currentPath.split('/').pop() || (currentPath.endsWith('/') && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function initAnimations() {
    if (typeof gsap !== 'undefined') {
        gsap.from('.navbar', { duration: 1.2, y: -100, opacity: 0, ease: 'power4.out' });
        gsap.from('.hero-content', { duration: 1.2, y: 30, opacity: 0, delay: 0.5, ease: 'power4.out' });
        gsap.from('.section-title', {
            duration: 1,
            x: -30,
            opacity: 0,
            scrollTrigger: {
                trigger: '.section-title',
                start: 'top 80%'
            }
        });
    }
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}
