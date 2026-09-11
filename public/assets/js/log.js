// Articles and navigation are pre-rendered; JS adds search and reading helpers.
(() => {
  const form = document.querySelector('.log-filters');
  if (form) {
    const search = document.querySelector('#log-search');
    const category = document.querySelector('#log-category');
    const format = document.querySelector('#log-type');
    const entries = [...document.querySelectorAll('.log-entry')];
    const empty = document.querySelector('.search-empty');
    const count = document.querySelector('#post-count');
    const normalize = text => text.normalize('NFKC').toLocaleLowerCase();
    function filter() {
      const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
      let visible = 0;
      for (const entry of entries) {
        const haystack = normalize(entry.dataset.search);
        entry.hidden = !(words.every(word => haystack.includes(word)) &&
          (!category.value || entry.dataset.category === category.value) &&
          (!format.value || entry.dataset.type === format.value));
        if (!entry.hidden) visible++;
      }
      count.textContent = `${visible} ${visible === 1 ? 'entry' : 'entries'}`;
      empty.hidden = visible > 0 || entries.length === 0;
    }
    form.hidden = false;
    form.addEventListener('submit', event => event.preventDefault());
    search.addEventListener('input', filter);
    category.addEventListener('change', filter);
    format.addEventListener('change', filter);
    document.querySelector('#reset-search').addEventListener('click', () => {
      form.reset();
      filter();
      search.focus();
    });
  }

  const toc = document.querySelector('.toc-panel');
  if (toc) {
    const mobile = matchMedia('(max-width: 800px)');
    const links = [...toc.querySelectorAll('.toc-link')];
    const headings = links.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1))));
    const setOutline = () => { toc.open = !mobile.matches; };
    setOutline();
    mobile.addEventListener('change', setOutline);
    let pending = false;
    function updateOutline() {
      let active = 0;
      headings.forEach((heading, index) => {
        if (heading && heading.getBoundingClientRect().top <= 180) active = index;
      });
      links.forEach((link, index) => {
        if (index === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      pending = false;
    }
    window.addEventListener('scroll', () => {
      if (!pending) { pending = true; requestAnimationFrame(updateOutline); }
    }, { passive: true });
    window.addEventListener('resize', updateOutline);
    toc.addEventListener('click', event => {
      const link = event.target.closest('.toc-link');
      if (!link) return;
      const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
      if (mobile.matches) toc.open = false;
    });
    updateOutline();
  }

  if (navigator.clipboard && window.isSecureContext) {
    document.querySelectorAll('.post-body pre').forEach(pre => {
      const code = pre.querySelector('code');
      if (!code) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block';
      pre.before(wrapper);
      wrapper.append(pre);
      const button = document.createElement('button');
      button.className = 'copy-code';
      button.type = 'button';
      button.textContent = 'Copy code';
      button.setAttribute('aria-live', 'polite');
      wrapper.prepend(button);
      let timer;
      button.addEventListener('click', async () => {
        clearTimeout(timer);
        try {
          await navigator.clipboard.writeText(code.textContent);
          button.textContent = 'Copied';
        } catch { button.textContent = 'Select code to copy'; }
        timer = setTimeout(() => { button.textContent = 'Copy code'; }, 2000);
      });
    });
  }
})();
