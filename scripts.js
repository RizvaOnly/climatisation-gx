// ========== Loader ==========
(function() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    loader.classList.add('fade-out');
    document.body.style.overflow = '';
    setTimeout(() => loader.remove(), 500);
  }, 1500);
})();

// ========== Language switching ==========
function setLang(lang) {
  document.documentElement.lang = lang;
  document.getElementById('lang-fr').classList.toggle('active', lang === 'fr');
  document.getElementById('lang-en').classList.toggle('active', lang === 'en');

  // Update placeholders
  document.querySelectorAll('[data-fr-placeholder]').forEach(el => {
    el.placeholder = lang === 'fr' ? el.dataset.frPlaceholder : el.dataset.enPlaceholder;
  });

  // Update select option text
  document.querySelectorAll('option[data-fr]').forEach(el => {
    el.textContent = lang === 'fr' ? el.dataset.fr : el.dataset.en;
  });

  const t = TRANSLATIONS[lang];
  document.title = t.pageTitle;
  document.getElementById('meta-desc').setAttribute('content', t.metaDesc);

  localStorage_safe_set('gx_lang', lang);
}
function localStorage_safe_set(k, v) { try { localStorage.setItem(k, v); } catch(e) {} }
function localStorage_safe_get(k) { try { return localStorage.getItem(k); } catch(e) { return null; } }

// Initialize lang from storage or browser
(function() {
  const stored = localStorage_safe_get('gx_lang');
  const browserLang = (navigator.language || 'fr').slice(0,2);
  const lang = stored || (browserLang === 'en' ? 'en' : 'fr');
  setLang(lang);
})();

// ========== Mobile nav ==========
function closeMobileNav() {
  const nav = document.querySelector('.main-nav');
  const btn = document.querySelector('.mobile-menu-btn');
  nav.style.display = '';
  btn.classList.remove('open');
}

function toggleMobileNav() {
  const nav = document.querySelector('.main-nav');
  const btn = document.querySelector('.mobile-menu-btn');
  if (btn.classList.contains('open')) {
    closeMobileNav();
  } else {
    nav.style.display = 'flex';
    nav.style.position = 'absolute';
    nav.style.top = '100%';
    nav.style.left = '0';
    nav.style.right = '0';
    nav.style.flexDirection = 'column';
    nav.style.background = 'var(--color-bg)';
    nav.style.padding = '20px';
    nav.style.gap = '16px';
    nav.style.borderBottom = '1px solid var(--color-border-soft)';
    nav.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.1)';
    btn.classList.add('open');
  }
}

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

window.addEventListener('scroll', () => {
  document.querySelector('.site-header').classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ========== FAQ accordion ==========
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  item.classList.toggle('open');
}

// ========== Calculator ==========
let calcState = { heating: 'electric', income: 'low' };
let calcCurrentVal = 6700;

function updateCalc() {
  let amount = 0;
  if (calcState.heating === 'electric') {
    amount = calcState.income === 'low' ? 6700 : calcState.income === 'mid' ? 5200 : 4000;
  } else if (calcState.heating === 'oil') {
    amount = calcState.income === 'low' ? 8500 : calcState.income === 'mid' ? 7000 : 5500;
  } else if (calcState.heating === 'gas') {
    amount = calcState.income === 'low' ? 9800 : calcState.income === 'mid' ? 8300 : 7300;
  }

  if (typeof anime !== 'undefined') {
    const obj = { val: calcCurrentVal };
    anime({
      targets: obj,
      val: amount,
      duration: 600,
      easing: 'easeOutExpo',
      update() {
        document.getElementById('calc-amount').textContent = Math.round(obj.val).toLocaleString('fr-CA') + ' $';
      },
      complete() { calcCurrentVal = amount; }
    });
  } else {
    document.getElementById('calc-amount').textContent = amount.toLocaleString('fr-CA') + ' $';
    calcCurrentVal = amount;
  }
}

document.querySelectorAll('#calc-heating .calc-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('#calc-heating .calc-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    calcState.heating = opt.dataset.value;
    updateCalc();
  });
});
document.querySelectorAll('#calc-income .calc-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('#calc-income .calc-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    calcState.income = opt.dataset.value;
    updateCalc();
  });
});

// ========== Form submit (demo) ==========
function handleQuote(e) {
  e.preventDefault();
  alert(TRANSLATIONS[document.documentElement.lang].quoteSuccess);
  e.target.reset();
}

// ========== Card stagger (anime.js) ==========
(function() {
  if (typeof anime === 'undefined') return;

  const gridConfigs = [
    { grid: '.services-grid', cards: '.service-card' },
    { grid: '.subsidy-list', cards: '.subsidy-card' },
    { grid: '.reviews-grid', cards: '.review-card' }
  ];

  gridConfigs.forEach(({ grid, cards }) => {
    const gridEl = document.querySelector(grid);
    if (!gridEl) return;
    const cardEls = Array.from(gridEl.querySelectorAll(cards));
    if (!cardEls.length) return;

    // Take over from CSS fade-up so cards start invisible
    cardEls.forEach(el => {
      el.classList.remove('fade-up');
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
    });

    let fired = false;
    const io = new IntersectionObserver((entries) => {
      if (fired || !entries[0].isIntersecting) return;
      fired = true;
      io.disconnect();
      anime({
        targets: cardEls,
        opacity: [0, 1],
        translateY: [28, 0],
        duration: 560,
        easing: 'easeOutCubic',
        delay: anime.stagger(90)
      });
    }, { threshold: 0.08 });

    io.observe(gridEl);
  });
})();

// ========== Stat counters (anime.js) ==========
(function() {
  const statSection = document.querySelector('.stats');
  if (!statSection || typeof anime === 'undefined') return;

  // Set initial display values to "from" so they don't flash final numbers
  document.querySelectorAll('.count-val').forEach(el => {
    const from = parseFloat(el.dataset.from || 0);
    const decimals = parseInt(el.dataset.decimals || 0);
    const suffix = el.dataset.suffix || '';
    const format = el.dataset.format;
    let num = from.toFixed(decimals);
    if (format === 'fr') num = parseFloat(num).toLocaleString('fr-CA');
    el.textContent = num + suffix;
  });

  let fired = false;
  const io = new IntersectionObserver((entries) => {
    if (fired || !entries[0].isIntersecting) return;
    fired = true;
    io.disconnect();

    document.querySelectorAll('.count-val').forEach(el => {
      const to = parseFloat(el.dataset.to);
      const from = parseFloat(el.dataset.from || 0);
      const decimals = parseInt(el.dataset.decimals || 0);
      const suffix = el.dataset.suffix || '';
      const format = el.dataset.format;

      const obj = { val: from };
      anime({
        targets: obj,
        val: to,
        duration: 1600,
        easing: 'easeOutExpo',
        update() {
          let num = obj.val.toFixed(decimals);
          if (format === 'fr') num = parseFloat(num).toLocaleString('fr-CA');
          el.textContent = num + suffix;
        }
      });
    });
  }, { threshold: 0.4 });

  io.observe(statSection);
})();

// ========== Scroll fade-in ==========
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ========== HVAC blueprint (scroll-synced line drawing) ==========
(function() {
  const section = document.querySelector('.blueprint');
  if (!section) return;
  const svg = section.querySelector('.blueprint-svg');
  const figure = section.querySelector('.blueprint-figure');
  if (!svg || !figure) return;

  const lines = Array.from(svg.querySelectorAll('.bp-line'));
  const softs = Array.from(svg.querySelectorAll('.bp-soft'));
  const fanGroup = svg.querySelector('.bp-fan');
  const airflow = Array.from(svg.querySelectorAll('.bp-air'));

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fallback: with no anime.js or reduced-motion preference, leave the
  // blueprint in its natural fully-drawn state.
  if (typeof anime === 'undefined' || reduceMotion) return;

  // Hide the fade-in elements up front (stroked lines are hidden on timeline init).
  softs.forEach(el => { el.style.opacity = '0'; });

  // A paused timeline we scrub by hand — anime.js v3 has no scroll observer.
  const tl = anime.timeline({ autoplay: false, easing: 'easeInOutSine' });
  tl.add({
    targets: lines,
    strokeDashoffset: [anime.setDashoffset, 0],
    duration: 700,
    delay: anime.stagger(34)
  }, 0);
  tl.add({
    targets: softs,
    opacity: [0, 1],
    duration: 360,
    delay: anime.stagger(28)
  }, 300);

  // Map the figure's position in the viewport to timeline progress.
  let ticking = false;
  function seekToScroll() {
    ticking = false;
    const rect = figure.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const startY = vh * 0.62; // start drawing only once the figure is well into view
    const endY = vh * 0.12;   // finish as it approaches the top
    let p = (startY - rect.top) / (startY - endY);
    p = Math.min(1, Math.max(0, p));
    tl.seek(tl.duration * p);
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(seekToScroll); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  seekToScroll();

  // Living details, independent of scroll: the fan spins, the airflow breathes.
  if (fanGroup) {
    anime({ targets: fanGroup, rotate: '1turn', duration: 4200, loop: true, easing: 'linear' });
  }
  if (airflow.length) {
    anime({
      targets: airflow,
      opacity: [1, 0.45],
      duration: 1300,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      delay: anime.stagger(180)
    });
  }
})();

// ========== Year ==========
document.getElementById('year').textContent = new Date().getFullYear();
