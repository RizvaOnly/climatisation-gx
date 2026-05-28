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
function updateCalc() {
  // Simple estimate logic (illustrative):
  // Hydro-Québec LogisVert + Énergir biénergie incentives vary by heating source and income.
  let amount = 0;
  if (calcState.heating === 'electric') {
    amount = calcState.income === 'low' ? 6700 : calcState.income === 'mid' ? 5200 : 4000;
  } else if (calcState.heating === 'oil') {
    amount = calcState.income === 'low' ? 8500 : calcState.income === 'mid' ? 7000 : 5500;
  } else if (calcState.heating === 'gas') {
    amount = calcState.income === 'low' ? 9800 : calcState.income === 'mid' ? 8300 : 7300;
  }
  document.getElementById('calc-amount').textContent = amount.toLocaleString('fr-CA') + ' $';
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

// ========== Year ==========
document.getElementById('year').textContent = new Date().getFullYear();
