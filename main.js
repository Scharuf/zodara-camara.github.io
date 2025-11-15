// --------- helpers affichage ----------
function qs(sel) {
  return document.querySelector(sel);
}
function qsa(sel) {
  return Array.from(document.querySelectorAll(sel));
}

// Etats globaux
let PORTFOLIO = null;
let barChart = null;
let donutChart = null;
let radarChart = null;
let currentSaeId = null;

// --------- chargement JSON ----------
async function loadPortfolio() {
  try {
    const res = await fetch('portfolio.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    PORTFOLIO = data;
    console.log('📄 portfolio.json chargé', data);
    initFromData();
  } catch (err) {
    console.error('Erreur de chargement de portfolio.json', err);
  }
}

// --------- initialisation globale ----------
function initFromData() {
  if (!PORTFOLIO) return;

  fillKpis(PORTFOLIO.summary);
  initCharts(PORTFOLIO.summary);
  fillCompetences(PORTFOLIO.competences);
  fillRessources(PORTFOLIO.ressources);
  fillSaeList(PORTFOLIO.sae);
  setupNavigation();
  setupThemeToggle();
  setupButtons();
}

// --------- KPIs ----------
function fillKpis(summary) {
  qs('#kHours').textContent = summary.hours_total ?? 0;
  qs('#kVCOD').textContent = summary.sae_vcod_count ?? 0;
  qs('#kRess').textContent = summary.ressource_count ?? 0;
  qs('#kProofHint').textContent = `Preuves : ${summary.proofs_count ?? 0}`;

  const split = summary.hours_by_competence || {};
  const txt = Object.entries(split)
    .map(([c, h]) => `${c} : ${h} h`)
    .join(' • ');
  qs('#kSplit').textContent = txt || '—';
}

// --------- CHARTS ----------
function initCharts(summary) {
  const ctxBar = qs('#bar').getContext('2d');
  const ctxDonut = qs('#donut').getContext('2d');
  const ctxRadar = qs('#radar').getContext('2d');
  const hours = summary.hours_by_competence || {};
  const labels = Object.keys(hours);
  const values = Object.values(hours);

  // Bar
  if (barChart) barChart.destroy();
  barChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Heures',
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Donut
  if (donutChart) donutChart.destroy();
  donutChart = new Chart(ctxDonut, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });

  // Radar global = somme des radars de toutes les SAÉ
  const radarData = { C1: 0, C2: 0, C3: 0, C4: 0 };
  (PORTFOLIO.sae || []).forEach(s => {
    if (!s.radar) return;
    for (const k of ['C1', 'C2', 'C3', 'C4']) {
      radarData[k] += s.radar[k] || 0;
    }
  });

  const rLabels = Object.keys(radarData);
  const rValues = Object.values(radarData);

  if (radarChart) radarChart.destroy();
  radarChart = new Chart(ctxRadar, {
    type: 'radar',
    data: {
      labels: rLabels,
      datasets: [{
        label: 'Intensité globale (AC par compétence)',
        data: rValues
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: { beginAtZero: true }
      }
    }
  });
}

// --------- COMPÉTENCES vue ----------
function fillCompetences(list) {
  const container = qs('#compBadges');
  if (!container) return;
  container.innerHTML = '';

  (list || []).forEach(c => {
    const el = document.createElement('div');
    el.className = 'chip';
    el.innerHTML = `<strong>${c.id}</strong> — ${c.intitule}`;
    el.title = c.description || '';
    container.appendChild(el);
  });
}

// --------- RESSOURCES vue ----------
function fillRessources(list) {
  const container = qs('#ressTable');
  if (!container) return;
  container.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'table-ress';
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Code</th>
      <th>Semestre</th>
      <th>Titre</th>
    </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  (list || []).forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.code}</td>
      <td>${r.semestre ?? ''}</td>
      <td>${r.titre}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

// --------- SAÉ vue ----------
function fillSaeList(list) {
  const select = qs('#sae');
  if (!select) return;
  select.innerHTML = '';

  (list || []).forEach(s => {
    const opt = document.createElement('option');
    opt.value = String(s.id_sae);
    opt.textContent = `${s.code} — ${s.titre}`;
    select.appendChild(opt);
  });

  select.addEventListener('change', () => {
    const id = Number(select.value || 0);
    showSaeDetails(id);
  });

  // Sélectionne la première par défaut
  if (list.length > 0) {
    select.value = String(list[0].id_sae);
    showSaeDetails(list[0].id_sae);
  }
}

function showSaeDetails(id_sae) {
  const sae = (PORTFOLIO.sae || []).find(s => s.id_sae === Number(id_sae));
  currentSaeId = id_sae;
  const titleEl = qs('#dTitle');
  const bodyEl = qs('#dBody');
  const ctxRadar = qs('#radar-sae')?.getContext('2d');

  if (!sae) {
    if (titleEl) titleEl.textContent = 'Détails Saé';
    if (bodyEl) bodyEl.textContent = 'Aucune Saé sélectionnée.';
    if (radarChart) radarChart.update(); // global seulement
    return;
  }

  if (titleEl) {
    titleEl.textContent = `${sae.code} — Semestre ${sae.semestre}`;
  }

  if (bodyEl) {
    const comp = sae.competences?.join(', ') || '—';
    const acs = sae.acs?.join(', ') || '—';
    const ress = sae.ressources?.join(', ') || '—';

    bodyEl.innerHTML = `
      <p><strong>Titre :</strong> ${sae.titre}</p>
      <p><strong>Semestre :</strong> S${sae.semestre}</p>
      <p><strong>Valeur :</strong> ${sae.valeur || ''}</p>
      <p><strong>Compétences ciblées :</strong> ${comp}</p>
      <p><strong>AC associées :</strong> ${acs}</p>
      <p><strong>Ressources mobilisées :</strong> ${ress}</p>
    `;
  }

  // Radar spécifique SAÉ sur #radar-sae
  if (ctxRadar && sae.radar) {
    const labels = ['C1', 'C2', 'C3', 'C4'];
    const values = labels.map(k => sae.radar[k] || 0);

    if (window.saeRadarChart) {
      window.saeRadarChart.destroy();
    }
    window.saeRadarChart = new Chart(ctxRadar, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: `Profil AC — ${sae.code}`,
          data: values
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: { beginAtZero: true }
        }
      }
    });
  }
}

// --------- Navigation entre vues ----------
function setupNavigation() {
  const links = qsa('nav a[data-view]');
  const views = {
    home: qs('#view-home'),
    sae: qs('#view-sae'),
    competences: qs('#view-competences'),
    ressources: qs('#view-ressources'),
    contact: qs('#view-contact'),
    cv: qs('#view-cv'),
  };

  links.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const view = a.dataset.view;
      if (!view || !views[view]) return;
      qsa('.view').forEach(v => v.classList.remove('active'));
      views[view].classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  qsa('.back-home').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.view').forEach(v => v.classList.remove('active'));
      views.home.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// --------- Thème clair/sombre ----------
function setupThemeToggle() {
  const btn = qs('#theme');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    btn.textContent = next === 'light' ? '🌙 Mode sombre' : '☀ Mode clair';
  });
}

// --------- Boutons CV / preuves ----------
function setupButtons() {
  const btnViewCV = qs('#btnViewCV');
  if (btnViewCV) {
    btnViewCV.addEventListener('click', () => {
      const views = {
        home: qs('#view-home'),
        cv: qs('#view-cv'),
      };
      qsa('.view').forEach(v => v.classList.remove('active'));
      views.cv.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const btnProofs = qs('#btnProofs');
  if (btnProofs) {
    btnProofs.addEventListener('click', () => {
      // Pour l'instant, simple popup
      alert("Ici tu pourras lier des images / pdf de preuves de projets.");
    });
  }
}

// --------- DOM READY ----------
document.addEventListener('DOMContentLoaded', () => {
  loadPortfolio();
});
