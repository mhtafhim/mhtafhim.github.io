// Native scrolling stays intact. Animate content, never the scroll position.
(() => {
  const main = document.querySelector('main');
  if (!main || !window.IntersectionObserver || !Element.prototype.animate) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px)');
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  const selectors = [
    '.hero-main > *', '.hero-facts > div', '.section-heading',
    '.section-content > p', '.about-note', '.experience-row',
    '.project-row', '.subsection-heading', '.web-project',
    '.project-archive', '.research-details', '.core-skills > div',
    '.toolkit-details', '.education', '.languages',
    '.achievement-grid > article', '.recognition-details',
    '.contact > div', '.log-card', '.post-body > *', '.sidebar'
  ].join(',');
  const items = [...main.querySelectorAll(selectors)];
  const headings = [...main.querySelectorAll('.section-heading h2')];
  const liveHeadings = new Set();
  const animations = new Map();
  const revealed = new Set();
  const positions = new Map();
  const itemIndex = new Map(items.map((item, index) => [item, index]));
  let revealObserver;
  let headingObserver;
  let resizeObserver;
  let frame = 0;
  let enabled = false;
  let pageHeight = 1;
  let currentProgress = 0;

  function schedule() {
    if (enabled && !frame && !document.hidden) frame = requestAnimationFrame(render);
  }

  function render() {
    frame = 0;
    const targetProgress = Math.min(1, Math.max(0, scrollY / pageHeight));
    currentProgress += (targetProgress - currentProgress) * .18;
    if (Math.abs(targetProgress - currentProgress) < .0001) currentProgress = targetProgress;
    progress.style.transform = `scaleX(${currentProgress})`;
    document.querySelector('.site-header')?.classList.toggle('is-scrolled', scrollY > 32);

    // Read all positions before writing transforms. Only nearby headings move.
    const updates = [...liveHeadings].map(heading => {
      const bounds = heading.parentElement.getBoundingClientRect();
      const phase = Math.max(-1, Math.min(1, (bounds.top - innerHeight * .45) / (innerHeight * .6)));
      const target = phase * (compact.matches ? 8 : 20);
      const current = positions.get(heading) ?? target;
      const next = current + (target - current) * .12;
      return { heading, target, next };
    });
    let unsettled = currentProgress !== targetProgress;
    for (const { heading, target, next } of updates) {
      positions.set(heading, next);
      heading.style.setProperty('--scroll-depth', `${next.toFixed(2)}px`);
      if (Math.abs(target - next) > .05) unsettled = true;
    }
    if (unsettled) schedule();
  }

  function reveal(item, delay = 0) {
    animations.get(item)?.cancel();
    item.classList.add('has-entered');
    if (item.contains(document.activeElement)) return;
    const isHeading = item.classList.contains('section-heading');
    const distance = compact.matches ? 30 : 64;
    const animation = item.animate([
      { opacity: .12, transform: `translate3d(${isHeading && !compact.matches ? '-18px' : '0'}, ${distance}px, 0) scale(.975)` },
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }
    ], {
      duration: compact.matches ? 700 : 1050,
      delay,
      easing: 'cubic-bezier(.16, 1, .3, 1)',
      fill: 'backwards'
    });
    animations.set(item, animation);
    animation.onfinish = () => {
      if (animations.get(item) === animation) animations.delete(item);
      const bounds = item.getBoundingClientRect();
      if (bounds.bottom < -80 || bounds.top > innerHeight + 80) {
        revealed.delete(item);
        item.classList.remove('has-entered');
      }
    };
  }

  function measure() {
    pageHeight = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    schedule();
  }

  function start() {
    if (enabled || reducedMotion.matches) return;
    enabled = true;
    document.documentElement.classList.add('motion-enabled');
    items.forEach(item => item.classList.add('motion-item'));
    headings.forEach(heading => heading.classList.add('motion-depth'));
    revealObserver = new IntersectionObserver(entries => {
      const incoming = entries.filter(entry => entry.isIntersecting && !revealed.has(entry.target))
        .sort((a, b) => itemIndex.get(a.target) - itemIndex.get(b.target));
      incoming.forEach((entry, index) => {
        revealed.add(entry.target);
        reveal(entry.target, Math.min(index, 4) * (compact.matches ? 45 : 80));
      });
      for (const entry of entries) {
        // Re-arm only after the item has fully left the viewport; no flicker at its edge.
        if (!entry.isIntersecting && !animations.has(entry.target)) {
          revealed.delete(entry.target);
          entry.target.classList.remove('has-entered');
        }
      }
      schedule();
    }, { rootMargin: '80px 0px', threshold: 0 });
    items.forEach(item => revealObserver.observe(item));
    headingObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) liveHeadings.add(entry.target);
        else liveHeadings.delete(entry.target);
      }
      schedule();
    }, { rootMargin: '100px' });
    headings.forEach(heading => headingObserver.observe(heading));
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(document.body);
    }
    measure();
  }

  function stop() {
    enabled = false;
    cancelAnimationFrame(frame);
    frame = 0;
    revealObserver?.disconnect();
    headingObserver?.disconnect();
    resizeObserver?.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
    revealed.clear();
    liveHeadings.clear();
    positions.clear();
    items.forEach(item => item.classList.remove('has-entered'));
    headings.forEach(heading => heading.style.removeProperty('--scroll-depth'));
    document.documentElement.classList.remove('motion-enabled');
    document.querySelector('.site-header')?.classList.remove('is-scrolled');
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  });
  // Keyboard navigation immediately settles the focused content.
  main.addEventListener('focusin', event => {
    const item = event.target.closest('.motion-item');
    animations.get(item)?.cancel();
    animations.delete(item);
  });
  reducedMotion.addEventListener('change', () => reducedMotion.matches ? stop() : start());
  window.addEventListener('beforeprint', stop);
  window.addEventListener('afterprint', start);
  start();
})();
