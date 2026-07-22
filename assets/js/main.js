const fragmentMap = {
  'sidebar-slot': 'components/sidebar.html',
  'home-slot': 'components/home.html',
  'news-slot': 'components/news.html',
  'research-slot': 'components/research.html',
  'footer-slot': 'components/footer.html'
};

async function loadFragment(targetId, source) {
  const target = document.getElementById(targetId);
  if (!target) return;

  try {
    const response = await fetch(source, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    target.innerHTML = await response.text();
  } catch (error) {
    console.error(`Unable to load ${source}:`, error);
    target.innerHTML = '<p class="loading-state error-state">This section could not be loaded. Please refresh the page.</p>';
  }
}

function initYear() {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
}

function initMenu() {
  const header = document.querySelector('.site-header');
  const button = document.querySelector('.menu-button');
  const nav = document.getElementById('primary-nav');
  if (!header || !button || !nav) return;

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    header.classList.toggle('menu-open', !open);
  });

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    button.setAttribute('aria-expanded', 'false');
    header.classList.remove('menu-open');
  }));
}

function initActiveNavigation() {
  const links = [...document.querySelectorAll('#primary-nav a')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-30% 0px -62%', threshold: 0.01 });

  sections.forEach((section) => observer.observe(section));
}

function initReveal() {
  const elements = document.querySelectorAll(
    '.reveal, .sidebar-slot, .content-section > section, .news li, .area, .pub'
  );

  elements.forEach((element) => element.classList.add('reveal-item'));

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, revealObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -7%', threshold: 0.06 });

  elements.forEach((element) => observer.observe(element));
}

function initHeroMotion() {
  const visual = document.querySelector('.hero-visual');
  if (!visual || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  visual.addEventListener('pointermove', (event) => {
    const rect = visual.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    visual.style.setProperty('--motion-x', `${x}px`);
    visual.style.setProperty('--motion-y', `${y}px`);
  });

  visual.addEventListener('pointerleave', () => {
    visual.style.setProperty('--motion-x', '0px');
    visual.style.setProperty('--motion-y', '0px');
  });
}

async function init() {
  initMenu();
  initHeroMotion();

  await Promise.all(
    Object.entries(fragmentMap).map(([targetId, source]) => loadFragment(targetId, source))
  );

  initYear();
  initActiveNavigation();
  initReveal();
}

init();
