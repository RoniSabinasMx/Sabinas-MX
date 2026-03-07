// Decision matrix: maps [q1modality][q2category][q3intensity][q4element][q5intention] to service IDs
// Each level narrows the 33-service catalog

const ELEMENT_MAP = {
  cuerpo: { a: 'agua', b: 'tierra', c: 'fuego' },
  espiritu: { a: 'fuego', b: 'agua', c: 'tierra' },
  mente: { a: 'eter', b: 'tierra', c: 'aire' }
};

const INTENTION_BOOST = {
  a: ['agua', 'tierra'],    // Enraizar → earth/water
  b: ['fuego', 'aire'],     // Soltar   → fire/air
  c: ['eter', 'aire'],      // Comprender → ether/air
  d: ['fuego', 'eter']      // Renacer   → fire/ether
};

export function initOracle() {
  const searchPath = document.getElementById('path-search');
  const quizPath = document.getElementById('path-quiz');
  const spotlight = document.getElementById('spotlight-overlay');
  const oracleOvl = document.getElementById('oracle-overlay');
  const closeSpot = document.getElementById('close-spotlight');
  const closeOrcl = document.getElementById('close-oracle');
  const searchInput = document.getElementById('spotlight-input');
  const resultsEl = document.getElementById('spotlight-results');

  // --- VIA A: Spotlight Search ---
  searchPath.addEventListener('click', () => {
    spotlight.classList.add('active');
    setTimeout(() => searchInput.focus(), 300);
  });

  closeSpot.addEventListener('click', () => spotlight.classList.remove('active'));

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    const services = window._services || [];
    const filtered = q === ''
      ? services
      : services.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    renderSpotlightResults(filtered.slice(0, 8), resultsEl);
  });

  // --- VIA B: Questionnaire ---
  quizPath.addEventListener('click', () => {
    oracleOvl.classList.add('active');
    startQuiz();
  });

  closeOrcl.addEventListener('click', () => oracleOvl.classList.remove('active'));

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      spotlight.classList.remove('active');
      oracleOvl.classList.remove('active');
    }
  });
}

function renderSpotlightResults(services, container) {
  const t = window._t;
  if (!services.length) {
    container.innerHTML = `<p style="color:var(--clr-text-muted);padding:1rem">${t('oracle.no_results')}</p>`;
    return;
  }
  container.innerHTML = services.map(s => `
    <div class="result-item" data-id="${s.id}">
      <span class="result-name">${s.name}</span>
      <span class="result-meta">${s.duration}</span>
    </div>
  `).join('');
  container.querySelectorAll('.result-item').forEach(el => {
    el.addEventListener('click', () => {
      const svc = services.find(s => s.id === el.dataset.id);
      if (svc && window.openServiceDetails) {
        window.openServiceDetails(svc.id);
      }
    });
  });
}

function startQuiz() {
  const container = document.getElementById('quiz-container');
  const answers = {};
  renderQ1(container, answers);
}

function renderQ1(container, answers) {
  const t = window._t;
  animateIn(container, `
    <p class="q-step">1 / 5</p>
    <h2 class="q-title">${t('oracle.q1')}</h2>
    <div class="q-options">
      <button class="q-opt" data-v="indiv">${t('oracle.q1_a')}</button>
      <button class="q-opt" data-v="pareja">${t('oracle.q1_b')}</button>
      <button class="q-opt" data-v="grupal">${t('oracle.q1_c')}</button>
    </div>
  `);
  container.querySelectorAll('.q-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      answers.q1 = btn.dataset.v;
      renderQ2(container, answers);
    });
  });
}

function renderQ2(container, answers) {
  const t = window._t;
  animateIn(container, `
    <p class="q-step">2 / 5</p>
    <h2 class="q-title">${t('oracle.q2')}</h2>
    <div class="q-options">
      <button class="q-opt" data-v="cuerpo">${t('oracle.q2_a')}</button>
      <button class="q-opt" data-v="espiritu">${t('oracle.q2_b')}</button>
      <button class="q-opt" data-v="mente">${t('oracle.q2_c')}</button>
    </div>
  `);
  container.querySelectorAll('.q-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      answers.q2 = btn.dataset.v;
      renderQ3(container, answers);
    });
  });
}

function renderQ3(container, answers) {
  const t = window._t;
  animateIn(container, `
    <p class="q-step">3 / 5</p>
    <h2 class="q-title">${t('oracle.q3')}</h2>
    <div class="q-options">
      <button class="q-opt" data-v="suave">${t('oracle.q3_a')}</button>
      <button class="q-opt" data-v="medio">${t('oracle.q3_b')}</button>
      <button class="q-opt" data-v="total">${t('oracle.q3_c')}</button>
    </div>
  `);
  container.querySelectorAll('.q-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      answers.q3 = btn.dataset.v;
      renderQ4(container, answers);
    });
  });
}

function renderQ4(container, answers) {
  const t = window._t;
  const cat = answers.q2;
  const prefix = `oracle.q4_${cat}`;
  animateIn(container, `
    <p class="q-step">4 / 5</p>
    <h2 class="q-title">${t(prefix)}</h2>
    <div class="q-options">
      <button class="q-opt" data-v="a">${t(prefix + '_a')}</button>
      <button class="q-opt" data-v="b">${t(prefix + '_b')}</button>
      <button class="q-opt" data-v="c">${t(prefix + '_c')}</button>
    </div>
  `);
  container.querySelectorAll('.q-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      answers.q4 = ELEMENT_MAP[cat][btn.dataset.v];
      renderQ5(container, answers);
    });
  });
}

function renderQ5(container, answers) {
  const t = window._t;
  animateIn(container, `
    <p class="q-step">5 / 5</p>
    <h2 class="q-title">${t('oracle.q5')}</h2>
    <div class="q-options q-intenciones">
      <button class="q-opt q-pill" data-v="a">${t('oracle.q5_a')}</button>
      <button class="q-opt q-pill" data-v="b">${t('oracle.q5_b')}</button>
      <button class="q-opt q-pill" data-v="c">${t('oracle.q5_c')}</button>
      <button class="q-opt q-pill" data-v="d">${t('oracle.q5_d')}</button>
    </div>
  `);
  container.querySelectorAll('.q-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      answers.q5 = btn.dataset.v;
      showOracleResults(container, answers);
    });
  });
}

function showOracleResults(container, answers) {
  const t = window._t;
  const allServices = window._services || [];
  const waNum = window._waNumber || '521234567890';

  // Filter by modality
  let pool = allServices.filter(s => s.modality.includes(answers.q1));
  // Filter by category
  pool = pool.filter(s => s.category === answers.q2 || s.category === 'inmersion');
  // Filter by intensity (but keep if total matches or is broader)
  const intensityRank = { suave: 1, medio: 2, total: 3 };
  pool = pool.filter(s => intensityRank[s.intensity] <= intensityRank[answers.q3] + 1);
  // Score by element
  const preferredElems = [answers.q4, ...(INTENTION_BOOST[answers.q5] || [])];
  pool.sort((a, b) => {
    const sa = preferredElems.includes(a.element) ? 1 : 0;
    const sb = preferredElems.includes(b.element) ? 1 : 0;
    return sb - sa;
  });

  const results = pool.slice(0, 3);
  if (!results.length) results.push(...allServices.slice(0, 2));

  const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  animateIn(container, `
    <div class="q-results-header">
      <h2 class="q-title">${t('oracle.results_title')}</h2>
      <p class="q-subtitle">${t('oracle.results_sub')}</p>
    </div>
    <div class="results-cards">
      ${results.map(s => `
        <div class="result-card">
          <span class="card-badge">${s.duration}</span>
          <h3>${s.name}</h3>
          <a href="https://wa.me/${waNum}?text=${encodeURIComponent(s.wa.replace('{{date}}', date))}" target="_blank" rel="noopener" class="wa-btn">
            ${t('oracle.reserve_btn')} ↗
          </a>
        </div>
      `).join('')}
    </div>
    <button class="q-restart" onclick="document.getElementById('oracle-overlay').classList.remove('active')">${t('oracle.restart')}</button>
  `);
}

function animateIn(container, html) {
  container.style.opacity = '0';
  container.style.transform = 'translateY(20px)';
  container.innerHTML = html;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    });
  });
}
