/**
 * Main JavaScript for Portfolio Website
 * Loads JSON data and populates pages dynamically
 */

// Global data storage
let portfolioData = null;

// Initialize when DOM is ready
function initialize() {
  console.log('Initializing portfolio...');
  initNavigation();
  initAnimations();
  loadPortfolioData();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // DOM is already loaded
  initialize();
}

/**
 * Load portfolio data from JSON file
 */
async function loadPortfolioData() {
  try {
    // Try multiple path variations to handle different scenarios
    const possiblePaths = [
      'my information.json',
      './my information.json',
      encodeURI('my information.json'),
      encodeURI('./my information.json')
    ];
    
    let response = null;
    let lastError = null;
    
    // Try each path until one works
    for (const jsonPath of possiblePaths) {
      try {
        response = await fetch(jsonPath);
        if (response.ok) {
          console.log(`Successfully loaded JSON from: ${jsonPath}`);
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Failed to load from ${jsonPath}:`, err);
        continue;
      }
    }
    
    if (!response || !response.ok) {
      throw new Error(`Failed to load JSON file. Last error: ${lastError?.message || 'Unknown error'}`);
    }
    
    portfolioData = await response.json();
    console.log('Portfolio data loaded successfully', portfolioData);
    
    // Validate data structure
    if (!portfolioData.personalInfo) {
      throw new Error('Invalid JSON structure: personalInfo missing');
    }
    if (!portfolioData.technologiesAndSkills) {
      console.warn('technologiesAndSkills missing in JSON');
    }
    if (!portfolioData.experience) {
      console.warn('experience missing in JSON');
    }
    if (!portfolioData.projects) {
      console.warn('projects missing in JSON');
    }
    
    // Populate current page based on route
    const path = window.location.pathname;
    const currentPage = window.location.href;
    const filename = window.location.pathname.split('/').pop() || '';
    
    // Determine which page we're on
    if (filename === 'index.html' || filename === '' || path === '/' || path.endsWith('/') || currentPage.includes('index.html')) {
      populateHomePage();
    } else if (filename === 'about.html' || path.includes('about.html') || currentPage.includes('about.html')) {
      populateAboutPage();
    } else if (filename === 'projects.html' || path.includes('projects.html') || currentPage.includes('projects.html')) {
      populateProjectsPage();
    } else {
      // Default to home page
      populateHomePage();
    }
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    
    // Check if using file:// protocol (local file)
    const isFileProtocol = window.location.protocol === 'file:';
    let helpText = '';
    
    if (isFileProtocol) {
      helpText = `
        <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem;">
          <strong>Local File Detected:</strong> You're opening the file directly. 
          Use a local server instead:
        </p>
        <p style="color: var(--text-muted); font-size: 0.75rem; margin-bottom: 0.5rem;">
          • Python: <code style="background: var(--bg-glass); padding: 0.25rem 0.5rem; border-radius: 4px;">python -m http.server 8000</code>
        </p>
        <p style="color: var(--text-muted); font-size: 0.75rem; margin-bottom: 1rem;">
          • Node.js: <code style="background: var(--bg-glass); padding: 0.25rem 0.5rem; border-radius: 4px;">npx http-server</code>
        </p>
      `;
    } else {
      helpText = `
        <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem;">
          Make sure "my information.json" is in the root directory.
        </p>
      `;
    }
    
    // Show error message on page
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bg-card); padding: 2rem; border-radius: 12px; border: 1px solid var(--border); z-index: 9999; text-align: center; max-width: 600px; box-shadow: var(--shadow-lg);';
    errorMsg.innerHTML = `
      <h3 style="color: var(--accent); margin-bottom: 1rem;">Error Loading Data</h3>
      <p style="color: var(--text-secondary); margin-bottom: 1rem;">${error.message}</p>
      ${helpText}
      <p style="color: var(--text-muted); font-size: 0.75rem;">Please check the browser console (F12) for more details.</p>
      <button onclick="this.parentElement.remove()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: var(--accent); border: none; border-radius: 6px; color: white; cursor: pointer;">Close</button>
    `;
    document.body.appendChild(errorMsg);
  }
}

/**
 * Initialize navigation menu
 */
function initNavigation() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
  
  // Set active nav link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath.includes(linkPath) || 
        (currentPath === '/' && linkPath === 'index.html')) {
      link.classList.add('active');
    }
  });
  
  // Close mobile menu on link click
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        navLinks.classList.remove('active');
      }
    });
  });
}

/**
 * Initialize GSAP animations
 */
function initAnimations() {
  if (typeof gsap !== 'undefined') {
    // Fade in elements on scroll
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate fade-in elements
    gsap.utils.toArray('.fade-in').forEach((element) => {
      // Check if element is already in view
      const rect = element.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight * 0.8;
      
      if (isInView) {
        // Element is already visible, animate immediately
        gsap.fromTo(element, 
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 }
        );
      } else {
        // Element is below, animate on scroll
        gsap.set(element, { opacity: 0, y: 30 });
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      }
    });
    
    // Stagger animations for grids
    gsap.utils.toArray('.skills-grid, .projects-grid, .timeline-item').forEach((container) => {
      const items = container.querySelectorAll('.skill-category, .project-card, .timeline-content');
      if (items.length > 0) {
        const rect = container.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight * 0.8;
        
        if (isInView) {
          // Animate immediately
          gsap.fromTo(items,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }
          );
        } else {
          // Animate on scroll
          gsap.set(items, { opacity: 0, y: 30 });
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            scrollTrigger: {
              trigger: container,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          });
        }
      }
    });
  } else {
    // If GSAP doesn't load, ensure all elements are visible
    console.warn('GSAP not loaded, showing all elements without animation');
    document.querySelectorAll('.fade-in').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }
}

/**
 * Populate home page with data
 */
function populateHomePage() {
  if (!portfolioData) {
    console.warn('Portfolio data not loaded yet, retrying...');
    // Retry after a short delay
    setTimeout(() => {
      if (portfolioData) {
        populateHomePage();
      }
    }, 100);
    return;
  }
  
  console.log('Populating home page...');
  const data = portfolioData;
  
  // Hero Section
  const heroName = document.querySelector('.hero h1');
  const heroTagline = document.querySelector('.hero .tagline');
  if (heroName) heroName.textContent = data.personalInfo.name;
  if (heroTagline) {
    heroTagline.textContent = `Software Engineer & Problem Solver | ${data.personalInfo.location}`;
  }
  
  // Skills Section
  populateSkills();
  
  // Experience Section
  populateExperience();
  
  // Projects Section
  populateProjects();
  
  // Achievements Section
  populateAchievements();
  
  // Contact Section
  populateContact();
  
  // Problem Solving Section
  populateProblemSolving();
  
  console.log('Home page populated successfully');
}

/**
 * Populate skills section
 */
function populateSkills() {
  const skillsContainer = document.getElementById('skills-container');
  if (!skillsContainer) {
    console.warn('Skills container not found');
    return;
  }
  if (!portfolioData) {
    console.warn('Portfolio data not available for skills');
    return;
  }
  
  const skills = portfolioData.technologiesAndSkills;
  if (!skills) {
    console.warn('Skills data not found in portfolio data');
    return;
  }
  
  let html = '';
  
  Object.keys(skills).forEach(category => {
    const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    html += `
      <div class="skill-category fade-in">
        <h3>${categoryName}</h3>
        <div class="skill-tags">
          ${skills[category].map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
      </div>
    `;
  });
  
  skillsContainer.innerHTML = html;
  console.log('Skills populated');
}

/**
 * Populate experience timeline
 */
function populateExperience() {
  const experienceContainer = document.getElementById('experience-container');
  if (!experienceContainer || !portfolioData) return;
  
  const experiences = portfolioData.experience;
  let html = '';
  
  experiences.forEach(exp => {
    const skillsHtml = exp.skills ? 
      `<div class="skills">
        ${exp.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>` : '';
    
    html += `
      <div class="timeline-item fade-in">
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

/**
 * Populate projects section
 */
function populateProjects() {
  const projectsContainer = document.getElementById('projects-container');
  if (!projectsContainer || !portfolioData) return;
  
  const projects = portfolioData.projects;
  let html = '';
  
  projects.forEach(project => {
    const description = Array.isArray(project.description) 
      ? project.description.join(' ') 
      : project.description;
    
    html += `
      <div class="project-card fade-in">
        <h3>${project.title}</h3>
        <div class="tech-stack">
          ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
        <p class="description">${description}</p>
        <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-link">
          View Project →
        </a>
      </div>
    `;
  });
  
  projectsContainer.innerHTML = html;
}

/**
 * Populate achievements section
 */
function populateAchievements() {
  const achievementsContainer = document.getElementById('achievements-container');
  if (!achievementsContainer || !portfolioData) return;
  
  const achievements = portfolioData.achievements;
  let html = '';
  
  achievements.forEach(achievement => {
    html += `
      <div class="achievement-item fade-in">
        <div>${achievement}</div>
      </div>
    `;
  });
  
  achievementsContainer.innerHTML = html;
}

/**
 * Populate contact section
 */
function populateContact() {
  const contactContainer = document.getElementById('contact-container');
  if (!contactContainer || !portfolioData) return;
  
  const contact = portfolioData.personalInfo.contact;
  const links = portfolioData.personalInfo.links;
  let html = '';
  
  // Email
  html += `
    <a href="mailto:${contact.email}" class="contact-link fade-in">
      <span>📧</span>
      <span>${contact.email}</span>
    </a>
  `;
  
  // Phone
  html += `
    <a href="tel:${contact.phone.replace(/\s/g, '')}" class="contact-link fade-in">
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
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="contact-link fade-in">
          <span>${icon}</span>
          <span>${link.platform}</span>
        </a>
      `;
    }
  });
  
  contactContainer.innerHTML = html;
}

/**
 * Populate problem solving section
 */
function populateProblemSolving() {
  const problemSolvingContainer = document.getElementById('problem-solving-container');
  if (!problemSolvingContainer || !portfolioData) return;
  
  const platforms = portfolioData.problemSolving;
  let html = '';
  
  platforms.forEach(platform => {
    html += `
      <div class="problem-solving-card fade-in">
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

/**
 * Populate about page
 */
function populateAboutPage() {
  if (!portfolioData) return;
  
  const data = portfolioData;
  
  // Education
  const educationContainer = document.getElementById('education-container');
  if (educationContainer && data.education) {
    let html = '';
    data.education.forEach(edu => {
      html += `
        <div class="card fade-in">
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
  
  // Research & Thesis
  const researchContainer = document.getElementById('research-container');
  if (researchContainer && data.researchAndThesis) {
    const research = data.researchAndThesis;
    let html = `
      <div class="card fade-in">
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
  
  // Other Experiences
  const otherExpContainer = document.getElementById('other-experiences-container');
  if (otherExpContainer && data.otherExperiences) {
    let html = '';
    data.otherExperiences.forEach(exp => {
      const title = exp.event || exp.organization || '';
      html += `
        <div class="card fade-in">
          <h3>${exp.role}</h3>
          <div class="company">${title}</div>
        </div>
      `;
    });
    otherExpContainer.innerHTML = html;
  }
  
  // Populate skills and experience on about page too
  populateSkills();
  populateExperience();
}

/**
 * Populate projects page
 */
function populateProjectsPage() {
  populateProjects();
  
  // Also show research project
  const projectsContainer = document.getElementById('projects-container');
  if (projectsContainer && portfolioData && portfolioData.researchAndThesis) {
    const research = portfolioData.researchAndThesis;
    const html = `
      <div class="project-card fade-in">
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
    projectsContainer.insertAdjacentHTML('beforeend', html);
  }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

