/**
 * Main JavaScript for Portfolio Website
 * Loads JSON data and populates pages dynamically
 */

// Global data storage
let portfolioData = null;
let blogPostsData = [];
const BLOG_PREVIEW_COUNT = 3; // Number of blog posts to show initially

// Initialize when DOM is ready
function initialize() {
  console.log('Initializing portfolio...');
  applySystemTheme(); // Apply theme based on system settings


  loadAllData();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

async function loadAllData() {
  console.log('loadAllData: Starting data loading...');
  try {
    const portfolioResponse = await fetchJsonWithRetry('data/my_information.json');
    portfolioData = portfolioResponse;
    console.log('loadAllData: Portfolio data loaded successfully', portfolioData);
    
    const blogResponse = await fetchJsonWithRetry('data/posts.json');
    blogPostsData = blogResponse;
    console.log('loadAllData: Blog posts data loaded successfully', blogPostsData);

    populateAllSections();

  } catch (error) {
    console.error('loadAllData: Error loading essential data:', error);
    showError('Error loading website data.', error.message);
  }

  console.log('loadAllData: Data loading completed');

}

// The fetchJsonWithRetry and showError functions will be moved/copied to blog.js and post.js as well.
// Keeping them here for completeness in main.js context for now.
async function fetchJsonWithRetry(url) {
  console.log(`fetchJsonWithRetry: Attempting to fetch from: ${url}`);
  // GitHub Pages might require absolute paths or paths relative to the base URL
  const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
  
  const possiblePaths = [
    url, // Original path
    `./${url}`, // Relative to current directory
    `/${url}`, // Relative to root
    `${baseUrl}${url}`, // Absolute path using base URL
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

function populateAllSections() {
  console.log('populateAllSections: Checking portfolioData status.', 'Is portfolioData null?', portfolioData === null);
  if (!portfolioData) {
    console.warn('populateAllSections: Portfolio data not loaded yet, retrying...');
    setTimeout(populateAllSections, 100);
    return;
  }
  console.log('populateAllSections: Populating all sections with data...');
  populateHero();
  populateAbout();
  populateEducation();
  populateResearch();
  populateOtherExperiences();
  populateSkills();
  populateProblemSolving();
  populateExperience();
  populateProjects();
  populateAchievements();
  populateBlogPreviews(); // Populate blog previews for homepage
  populateContact();
  console.log('populateAllSections: All sections populated successfully');

  // Initialize DOM-dependent functions after all content has been populated
  // Use a setTimeout to ensure the DOM has fully rendered after innerHTML updates
  setTimeout(() => {
    console.log('populateAllSections: Initializing navigation and other DOM-dependent features.');
    initNavigation();
    initScrollHide();
    initMobileMenuToggle(); // Initialize mobile menu toggle
    console.log('populateAllSections: Navigation and other DOM-dependent features initialized successfully');
  }, 0);
}

function populateHero() {
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  const heroName = heroSection.querySelector('.name');
  const heroTagline = heroSection.querySelector('.tagline');
  const heroSocialLinksContainer = heroSection.querySelector('.hero-social-links');

  if (portfolioData.personalInfo) {
    if (heroName) heroName.textContent = portfolioData.personalInfo.name;
    if (heroTagline) heroTagline.textContent = `Software Engineer & Problem Solver | ${portfolioData.personalInfo.location}`;

    if (heroSocialLinksContainer) {
      let socialLinksHtml = '';

      // Add Email link
      if (portfolioData.personalInfo.contact && portfolioData.personalInfo.contact.email) {
        socialLinksHtml += `
          <a href="mailto:${portfolioData.personalInfo.contact.email}" class="social-icon">
            <i class="fas fa-envelope"></i>
          </a>
        `;
      }

      // Add other social links
      if (portfolioData.personalInfo.links) {
        portfolioData.personalInfo.links.forEach(link => {
          const platform = link.platform.toLowerCase();
          let url = '';
          let iconClass = '';

          if (platform === 'github') {
            url = `https://github.com/${link.username}`;
            iconClass = 'fab fa-github';
          } else if (platform === 'linkedin') {
            url = `https://linkedin.com/in/${link.username}`;
            iconClass = 'fab fa-linkedin-in';
          } else if (platform === 'portfolio') {
            url = `https://${link.username}.github.io`;
            iconClass = 'fas fa-globe';
          }

          if (url) {
            socialLinksHtml += `
              <a href="${url}" target="_blank" rel="noopener noreferrer" class="social-icon">
                <i class="${iconClass}"></i>
              </a>
            `;
          }
        });
      }
      heroSocialLinksContainer.innerHTML = socialLinksHtml;
    }
  }
}

function populateAbout() {
  const aboutBioTagline = document.getElementById('about-bio-tagline');
  if (aboutBioTagline) {
    aboutBioTagline.textContent = "I am a passionate Software Engineer with a strong foundation in data structures, algorithms, and object-oriented programming. I enjoy solving complex problems and building innovative solutions.";
  }
}

function populateEducation() {
  const educationContainer = document.getElementById('education-container');
  if (!educationContainer || !portfolioData.education) return;
  
  let html = '';
  portfolioData.education.forEach(edu => {
    html += `
      <div class="card">
        <h3>${edu.degree}</h3>
        <div class="company">${edu.institution}</div>
        <div class="meta">${edu.duration} • GPA: ${edu.gpa}</div>
        <div class="skills" style="margin-top: 1rem;">
          <strong>Key Coursework:</strong>
          <div class="skill-tags" style="margin-top: 0.5rem;">
            ${edu.coursework.map(course => `<span class="skill-tag">${course}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  });
  educationContainer.innerHTML = html;
}

function populateResearch() {
  const researchContainer = document.getElementById('research-container');
  if (!researchContainer || !portfolioData.researchAndThesis) return;
  
  const research = portfolioData.researchAndThesis;
  let html = `
    <div class="card">
      <h3>${research.title}</h3>
      <ul style="list-style: none; padding-left: 0;">
        ${research.points.map(point => `<li style="margin-bottom: 1rem; padding-left: 1.5rem; position: relative;">
          <span style="position: absolute; left: 0;">•</span>
          ${point}
        </li>`).join('')}
      </ul>
    </div>
  `;
  researchContainer.innerHTML = html;
}

function populateOtherExperiences() {
  const otherExpContainer = document.getElementById('other-experiences-container');
  if (!otherExpContainer || !portfolioData.otherExperiences) return;
  
  let html = '';
  portfolioData.otherExperiences.forEach(exp => {
    const title = exp.event || exp.organization || '';
    html += `
      <div class="card">
        <h3>${exp.role}</h3>
        <div class="company">${title}</div>
      </div>
    `;
  });
  otherExpContainer.innerHTML = html;
}

function populateSkills() {
  const skillsContainer = document.getElementById('skills-container');
  if (!skillsContainer || !portfolioData.technologiesAndSkills) return;
  
  const skills = portfolioData.technologiesAndSkills;
  let html = '';
  
  Object.keys(skills).forEach(category => {
    const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    html += `
      <div class="skill-category">
        <h3>${categoryName}</h3>
        <div class="skill-tags">
          ${skills[category].map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
      </div>
    `;
  });
  
  skillsContainer.innerHTML = html;
}

function populateExperience() {
  const experienceContainer = document.getElementById('experience-container');
  if (!experienceContainer || !portfolioData.experience) return;
  
  const experiences = portfolioData.experience;
  let html = '';
  
  experiences.forEach(exp => {
    const skillsHtml = exp.skills ? 
      `<div class="skills">
        ${exp.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>` : '';
    
    html += `
      <div class="timeline-item">
        <div class="timeline-content">
          <h3>${exp.title}</h3>
          <div class="company">${exp.company}</div>
          <div class="meta">
            ${exp.startDate} - ${exp.endDate} • ${exp.duration} • ${exp.location} • ${exp.workMode}
          </div>
          ${skillsHtml}
        </div>
      </div>
    `;
  });
  
  experienceContainer.innerHTML = html;
}

function populateProjects() {
  const projectsContainer = document.getElementById('projects-container');
  if (!projectsContainer || !portfolioData.projects) return;
  
  const projects = portfolioData.projects;
  let html = '';
  
  if (portfolioData.researchAndThesis) {
    const research = portfolioData.researchAndThesis;
    html += `
      <div class="project-card">
        <h3>${research.title}</h3>
        <div class="tech-stack">
          <span class="tech-tag">Deep Reinforcement Learning</span>
          <span class="tech-tag">PyTorch</span>
          <span class="tech-tag">SUMO</span>
          <span class="tech-tag">Python</span>
        </div>
        <div class="description">
          <ul style="list-style: none; padding-left: 0;">
            ${research.points.map(point => `<li style="margin-bottom: 0.5rem; padding-left: 1.5rem; position: relative;">
              <span style="position: absolute; left: 0;">•</span>
              ${point}
            </li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  projects.forEach(project => {
    const description = Array.isArray(project.description) 
      ? project.description.join(' <br> ') 
      : project.description;
    
    html += `
      <div class="project-card">
        <h3>${project.title}</h3>
        <div class="tech-stack">
          ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
        <p class="description">${description}</p>
        <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="btn">
          View Project →
        </a>
      </div>
    `;
  });
  
  projectsContainer.innerHTML = html;
}

function populateAchievements() {
  const achievementsContainer = document.getElementById('achievements-container');
  if (!achievementsContainer || !portfolioData.achievements) return;
  
  const achievements = portfolioData.achievements;
  let html = '';
  
  achievements.forEach(achievement => {
    html += `
      <div class="achievement-item">
        <div>${achievement}</div>
      </div>
    `;
  });
  
  achievementsContainer.innerHTML = html;
}

/**
 * Populate blog section with previews (for index.html)
 */
function populateBlogPreviews() {
  const container = document.getElementById('blog-container');
  if (!container || !blogPostsData) return;

  // Sort by date (newest first)
  const sortedPosts = [...blogPostsData].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  const postsToDisplay = sortedPosts.slice(0, BLOG_PREVIEW_COUNT);

  let html = '';
  if (postsToDisplay.length === 0) {
    html = '<p style="text-align: center; color: var(--text-muted);">No blog posts available yet. Check back soon!</p>';
  } else {
    postsToDisplay.forEach(post => {
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
  }
  container.innerHTML = html;
}

function populateContact() {
  const contactContainer = document.getElementById('contact-container');
  if (!contactContainer || !portfolioData.personalInfo || !portfolioData.personalInfo.contact || !portfolioData.personalInfo.links) return;
  
  const contact = portfolioData.personalInfo.contact;
  const links = portfolioData.personalInfo.links;
  let html = '';
  
  // Email
  html += `
    <a href="mailto:${contact.email}" class="contact-link">
      <span>📧</span>
      <span>${contact.email}</span>
    </a>
  `;
  
  // Phone
  html += `
    <a href="tel:${contact.phone.replace(/\s/g, '')}" class="contact-link">
      <span>📱</span>
      <span>${contact.phone}</span>
    </a>
  `;
  
  // Social Links
  links.forEach(link => {
    const platform = link.platform.toLowerCase();
    let url = '';
    let icon = '🔗';
    
    if (platform === 'github') {
      url = `https://github.com/${link.username}`;
      icon = '💻';
    } else if (platform === 'linkedin') {
      url = `https://linkedin.com/in/${link.username}`;
      icon = '💼';
    } else if (platform === 'portfolio') {
      url = `https://${link.username}.github.io`;
      icon = '🌐';
    }
    
    if (url) {
      html += `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="contact-link">
          <span>${icon}</span>
          <span>${link.platform}</span>
        </a>
      `;
    }
  });
  
  contactContainer.innerHTML = html;
}

function populateProblemSolving() {
  const problemSolvingContainer = document.getElementById('problem-solving-container');
  if (!problemSolvingContainer || !portfolioData.problemSolving) return;
  
  const platforms = portfolioData.problemSolving;
  let html = '';
  
  platforms.forEach(platform => {
    html += `
      <div class="problem-solving-card">
        <h3>${platform.platform}</h3>
        <p>${platform.details}</p>
        <a href="${platform.link}" target="_blank" rel="noopener noreferrer" class="btn">
          View Profile →
        </a>
      </div>
    `;
  });
  
  problemSolvingContainer.innerHTML = html;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

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

function initNavigation() {
  console.log('initNavigation: Initializing navigation...');
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('#sidebar-nav .nav-links a');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.7 
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentSectionId = entry.target.id;
        navLinks.forEach(link => {
          link.classList.remove('active');
          // Only set active if it's an internal link to a section on this page
          if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

  // Handle initial active link on load
  const currentHash = window.location.hash;
  const currentPath = window.location.pathname.split('/').pop();
  if (currentHash) {
    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentHash) {
        link.classList.add('active');
      }
    });
  } else if (currentPath === 'index.html' || currentPath === '') {
    // Default to hero (home) if no hash and on index.html
    const homeLink = document.querySelector('#sidebar-nav .nav-links a[href="#hero"]');
    if (homeLink) {
      homeLink.classList.add('active');
    }
  }
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

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      window.history.pushState(null, '', `#${targetId}`);
    }
  });
});
