// Essential content and disclosures work without JavaScript.
document.documentElement.classList.add('js');
const navigation = document.querySelector('.nav');
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-navigation');

function closeMenu(returnFocus = false) {
  navigation?.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  if (menuToggle) menuToggle.querySelector('span').textContent = '+';
  if (returnFocus) menuToggle?.focus();
}
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('span').textContent = open ? '−' : '+';
});
menu?.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  closeMenu();
  const href = link.getAttribute('href');
  if (href.startsWith('#')) {
    const target = document.getElementById(href.slice(1));
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation?.classList.contains('is-open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (navigation && !navigation.contains(event.target)) closeMenu();
});
const desktopNavigation = window.matchMedia(document.body.classList.contains('portfolio-page') ? '(min-width: 1101px)' : '(min-width: 761px)');
desktopNavigation.addEventListener('change', () => closeMenu());

const sectionLinks = [...document.querySelectorAll('#main-navigation a[href^="#"]')];
const sections = sectionLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
let scrollPending = false;
function updateActiveSection() {
  let active = null;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= 180) active = section.id;
  }
  for (const link of sectionLinks) {
    if (link.getAttribute('href') === `#${active}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) {
    scrollPending = true;
    window.requestAnimationFrame(updateActiveSection);
  }
}, { passive: true });
updateActiveSection();
