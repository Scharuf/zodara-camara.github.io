// main.js – version statique pour GitHub Pages (portfolio.json)

let DATA = null;

let barChart = null;
let donutChart = null;
let radarHomeChart = null;
let radarSaeChart = null;

let currentSemFilter = null; // null = tous les semestres
let SAE_KEY_FOR_PREUVES = "id"; // lien SAÉ <-> preuves ("id" ou "code")

document.addEventListener("DOMContentLoaded", () => {
  fetch("portfolio.json")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status} sur portfolio.json`);
      return res.json();
    })
    .then((json) => {
      DATA = json;

      detectSaeKeyForPreuves();

      // Stats initiales (tous semestres)
      const initialStats = computeStatsForSemester(null);

      initKpis(initialStats);
      initCharts(initialStats); // ne fait rien si Chart.js absent
      initSaeView();
      initCompetencesView();
      initRessourcesView();
      initNavigation();
      initThemeToggle();
      initCvButtons();
      initPreuvesPage(); // si on est sur preuve.html
    })
    .catch((err) => {
      console.error("Erreur de chargement de portfolio.json", err);
      const hint = document.getElementById("kProofHint");
      if (hint) hint.textContent = "Erreur : portfolio.json non chargé (voir console)";
    });
});

// ---------------------------------------------------------
// Helpers : semestre -> BUT
// ---------------------------------------------------------
function semesterToYearLabel(semNum) {
  if (semNum === 1 || semNum === 2) return "BUT1";
  if (semNum === 3 || semNum === 4) return "BUT2";
  if (semNum === 5 || semNum === 6) return "BUT3";
  return null;
}

function parseSemValue(semValue) {
  if (!semValue) return null;
  const n = parseInt(String(semValue).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------
// Détection de la clé utilisée pour relier SAÉ et preuves
// ---------------------------------------------------------
function detectSaeKeyForPreuves() {
  if (!DATA || !DATA.preuves || DATA.preuves.length === 0) return;

  const sample = DATA.preuves[0].sae;
  if (!sample) return;

  const matchId = DATA.sae.some((s) => s.id === sample);
  const matchCode = DATA.sae.some((s) => s.code === sample);

  if (matchCode && !matchId) SAE_KEY_FOR_PREUVES = "code";
  else SAE_KEY_FOR_PREUVES = "id"; // défaut
}

// ---------------------------------------------------------
// Calcul des stats en fonction du semestre
// ---------------------------------------------------------
function computeStatsForSemester(semValue) {
  const baseStats = DATA.stats;
  const allHoursByComp = baseStats.hours_by_competence;
  const compKeys = Object.keys(allHoursByComp);

  // Tous semestres
  if (!semValue) {
    const nb_sae_total = Array.isArray(DATA.sae) ? DATA.sae.length : 0;
    const nb_sae_vcod = Array.isArray(DATA.sae)
      ? DATA.sae.filter((s) => s.valeur === "VCOD").length
      : 0;

    return {
      total_hours: baseStats.total_hours,
      nb_sae_total,
      nb_sae_vcod,
      nb_preuves: baseStats.nb_preuves,
      nb_ressources: Array.isArray(DATA.ressources) ? DATA.ressources.length : 0,
      hours_by_competence: { ...allHoursByComp },
    };
  }

  const semNum = parseSemValue(semValue);
  if (!semNum) return computeStatsForSemester(null);

  const saeSem = (DATA.sae || []).filter((s) => s.semestre === semNum);
  const nb_sae_total = saeSem.length;
  const nb_sae_vcod = saeSem.filter((s) => s.valeur === "VCOD").length;

  const ressourcesSem = (DATA.ressources || []).filter((r) => r.semestre === semNum);
  const nb_ressources = ressourcesSem.length;

  // Répartition approx des heures par compétence (ratio occurrences SAÉ)
  const totalOccur = {};
  const semOccur = {};
  compKeys.forEach((c) => {
    totalOccur[c] = 0;
    semOccur[c] = 0;
  });

  (DATA.sae || []).forEach((s) => {
    (s.competences || []).forEach((c) => {
      if (totalOccur[c] !== undefined) totalOccur[c] += 1;
      if (s.semestre === semNum && semOccur[c] !== undefined) semOccur[c] += 1;
    });
  });

  const hoursByCompSem = {};
  compKeys.forEach((c) => {
    const totOcc = totalOccur[c];
    hoursByCompSem[c] = totOcc === 0 ? 0 : Math.round(allHoursByComp[c] * (semOccur[c] / totOcc));
  });

  const total_hours = Object.values(hoursByCompSem).reduce((sum, h) => sum + h, 0);

  return {
    total_hours,
    nb_sae_total,
    nb_sae_vcod,
    nb_preuves: baseStats.nb_preuves,
    nb_ressources,
    hours_by_competence: hoursByCompSem,
  };
}

// ---------------------------------------------------------
// KPIs
// ---------------------------------------------------------
function initKpis(stats) {
  updateKpis(stats);
  updateProofsLink(); // lien preuves dépend du semestre
}

function updateKpis(stats) {
  const kHours = document.getElementById("kHours");
  const kSplit = document.getElementById("kSplit");
  const kVCOD = document.getElementById("kVCOD");
  const kRess = document.getElementById("kRess");
  const kProofHint = document.getElementById("kProofHint");

  if (!kHours || !kSplit || !kVCOD || !kRess || !kProofHint) return;

  kHours.textContent = stats.total_hours;
  kVCOD.textContent = stats.nb_sae_vcod; // SAÉ VCOD uniquement
  kRess.textContent = stats.nb_ressources;
  kProofHint.textContent = `Preuves : ${stats.nb_preuves}`;

  const parts = Object.entries(stats.hours_by_competence).map(([code, h]) => `${code} : ${h} h`);
  kSplit.textContent = parts.join(" • ");
}

// bouton Home -> preuves avec ?sem=Sx
function updateProofsLink() {
  const btn = document.getElementById("btnProofs");
  if (!btn) return;

  btn.href = currentSemFilter
    ? `preuve.html?sem=${encodeURIComponent(currentSemFilter)}`
    : "preuve.html";
}

// ---------------------------------------------------------
// Graphiques (Chart.js)
// ---------------------------------------------------------
function initCharts(stats) {
  // Si Chart.js n’est pas chargé (ex: preuve.html), on ne fait rien
  if (typeof Chart === "undefined") return;

  const hoursByComp = stats.hours_by_competence;
  const labels = Object.keys(hoursByComp);
  const values = Object.values(hoursByComp);

  const barCanvas = document.getElementById("bar");
  const donutCanvas = document.getElementById("donut");
  const radarCanvas = document.getElementById("radar");
  const radarSaeCanvas = document.getElementById("radar-sae");

  // BAR
  if (barCanvas) {
    barChart = new Chart(barCanvas.getContext("2d"), {
      type: "bar",
      data: { labels, datasets: [{ label: "Heures par compétence", data: values }] },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: "Compétence" } },
          y: { title: { display: true, text: "Heures" }, beginAtZero: true },
        },
      },
    });
  }

  // DONUT (la proportion est correcte car Chart.js calcule la part à partir des valeurs)
  // Tooltip : affiche % + heures
  if (donutCanvas) {
    donutChart = new Chart(donutCanvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels,
        datasets: [{ label: "Répartition des heures", data: values }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed; // heures
                const total = (context.dataset.data || []).reduce((a, b) => a + b, 0);
                const pct = total ? ((value / total) * 100).toFixed(1) : "0.0";
                return `${context.label} : ${pct}% (${value} h)`;
              },
            },
          },
        },
      },
    });
  }

  // RADAR GLOBAL
  if (radarCanvas) {
    radarHomeChart = new Chart(radarCanvas.getContext("2d"), {
      type: "radar",
      data: { labels, datasets: [{ label: "Heures par compétence", data: values }] },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { r: { beginAtZero: true, suggestedMax: Math.max(...values) + 20 } },
      },
    });
  }

  updateDonutLegend(labels, values);

  // RADAR SAÉ
  if (radarSaeCanvas) {
    radarSaeChart = new Chart(radarSaeCanvas.getContext("2d"), {
      type: "radar",
      data: {
        labels: ["C1", "C2", "C3", "C4"],
        datasets: [{ label: "Poids des compétences dans la SAÉ", data: [0, 0, 0, 0] }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { r: { beginAtZero: true, suggestedMax: 3 } },
      },
    });
  }
}

function updateCharts(stats) {
  if (typeof Chart === "undefined") return;

  const hoursByComp = stats.hours_by_competence;
  const labels = Object.keys(hoursByComp);
  const values = Object.values(hoursByComp);

  if (barChart) {
    barChart.data.labels = labels;
    barChart.data.datasets[0].data = values;
    barChart.update();
  }

  if (donutChart) {
    donutChart.data.labels = labels;
    donutChart.data.datasets[0].data = values;
    donutChart.update();
  }

  if (radarHomeChart) {
    radarHomeChart.data.labels = labels;
    radarHomeChart.data.datasets[0].data = values;
    radarHomeChart.options.scales.r.suggestedMax = Math.max(...values) + 20;
    radarHomeChart.update();
  }

  updateDonutLegend(labels, values);
}

function updateDonutLegend(labels, values) {
  const legendContainer = document.getElementById("donutLegend");
  if (!legendContainer) return;

  const total = values.reduce((a, b) => a + b, 0);

  // Légende : % + heures (plus "juste" visuellement)
  legendContainer.innerHTML = labels
    .map((c, i) => {
      const pct = total ? ((values[i] / total) * 100).toFixed(1) : "0.0";
      return `<span class="chip">${c} : ${pct}% (${values[i]} h)</span>`;
    })
    .join(" ");
}

// ---------------------------------------------------------
// Mise à jour quand on change de semestre
// ---------------------------------------------------------
function updateDashboardForSemester(semValue) {
  currentSemFilter = semValue || null;
  const stats = computeStatsForSemester(currentSemFilter);
  updateKpis(stats);
  updateCharts(stats);
  updateProofsLink();
}

// ---------------------------------------------------------
// Vue SAÉ & Projets
// ---------------------------------------------------------
function initSaeView() {
  const saeSelect = document.getElementById("sae");
  const semSelect = document.getElementById("sem");
  const dTitle = document.getElementById("dTitle");
  const dBody = document.getElementById("dBody");

  if (!saeSelect || !dTitle || !dBody) return;

  function fillSaeOptions(filterSem) {
    saeSelect.innerHTML = "";

    (DATA.sae || []).forEach((s) => {
      if (filterSem && `S${s.semestre}` !== filterSem) return;
      const opt = document.createElement("option");
      opt.value = s.code;
      opt.textContent = `${s.code} — ${s.titre}`;
      saeSelect.appendChild(opt);
    });

    if (saeSelect.options.length > 0) {
      saeSelect.selectedIndex = 0;
      updateSaeDetails();
    } else {
      dTitle.textContent = "Aucune SAÉ disponible";
      dBody.textContent = "Aucune SAÉ pour ce semestre dans les données du portfolio.";

      if (radarSaeChart) {
        radarSaeChart.data.datasets[0].data = [0, 0, 0, 0];
        radarSaeChart.update();
      }

      const blocExplication = document.getElementById("sae-explication");
      if (blocExplication) blocExplication.textContent = "Aucune SAÉ pour ce semestre.";
    }
  }

  function updateSaeDetails() {
    const code = saeSelect.value;
    const sae = (DATA.sae || []).find((s) => s.code === code);
    if (!sae) return;

    dTitle.textContent = `${sae.code} — Semestre S${sae.semestre}`;

    const compLabels = (sae.competences || []).map((c) => {
      const meta = DATA.competences && DATA.competences[c];
      return meta ? `${c} — ${meta.label}` : c;
    });

    const acLabels = (sae.acs || []).map((acCode) => {
      const meta = DATA.acs && DATA.acs[acCode];
      const label = meta ? meta.label : `Description à préciser (${acCode})`;
      return `<li><strong>${acCode}</strong> — ${label}</li>`;
    });

    const allR = DATA.ressources || [];
    const resLines = (sae.ressources || []).map((rCode) => {
      const r = allR.find((x) => x.code === rCode);
      const label = r ? `${r.code} — ${r.titre}` : rCode;
      return `<li>${label}</li>`;
    });

    dBody.innerHTML = `
      <p><strong>Titre :</strong> ${sae.titre}</p>
      <p><strong>Semestre :</strong> S${sae.semestre}</p>
      <p><strong>Valeur :</strong> ${sae.valeur}</p>
      <p><strong>Compétences ciblées :</strong> ${compLabels.length ? compLabels.join(", ") : "—"}</p>
      <p><strong>Description :</strong> ${sae.description || "—"}</p>

      <p><strong>AC associées :</strong></p>
      ${acLabels.length ? `<ul>${acLabels.join("")}</ul>` : '<p class="muted">Aucune AC renseignée.</p>'}

      <p><strong>Ressources mobilisées :</strong></p>
      ${resLines.length ? `<ul>${resLines.join("")}</ul>` : '<p class="muted">Aucune ressource renseignée.</p>'}
    `;

    // Radar SAÉ
    if (radarSaeChart) {
      const labels = ["C1", "C2", "C3", "C4"];
      const data = labels.map((c) => (sae.competences && sae.competences.includes(c) ? 3 : 0));
      radarSaeChart.data.labels = labels;
      radarSaeChart.data.datasets[0].data = data;
      radarSaeChart.update();
    }

    // Explication perso
    const blocExplication = document.getElementById("sae-explication");
    if (blocExplication) blocExplication.textContent = sae.explication || sae.description || "";

    // Bouton preuves SAÉ : ?sae=...&sem=Sx
    const lienPreuves = document.getElementById("btn-preuves-sae");
    if (lienPreuves) {
      const keyValue = SAE_KEY_FOR_PREUVES === "code" ? sae.code : sae.id || sae.code;

      const qs = new URLSearchParams();
      qs.set("sae", keyValue);
      qs.set("sem", `S${sae.semestre}`);

      lienPreuves.href = `preuve.html?${qs.toString()}`;
    }
  }

  saeSelect.addEventListener("change", updateSaeDetails);

  if (semSelect) {
    semSelect.addEventListener("change", () => {
      const val = semSelect.value; // "", "S1", ...
      fillSaeOptions(val || null);
      updateDashboardForSemester(val || null);
    });
  }

  fillSaeOptions(null);
}

// ---------------------------------------------------------
// Vue Compétences
// ---------------------------------------------------------
function initCompetencesView() {
  const container = document.getElementById("compBadges");
  if (!container || !DATA) return;

  const hoursByComp = (DATA.stats && DATA.stats.hours_by_competence) || {};

  container.innerHTML = "";
  Object.entries(DATA.competences || {}).forEach(([code, meta]) => {
    const chip = document.createElement("div");
    chip.className = "chip chip-large";
    const h = hoursByComp[code] ?? 0;

    chip.innerHTML = `
      <div><strong>${code}</strong> — ${meta.label}</div>
      <div class="muted">${meta.description}</div>
      <div class="muted">Heures totales associées : ${h} h</div>
    `;
    container.appendChild(chip);
  });
}

// ---------------------------------------------------------
// Vue Ressources (corrigée)
// ---------------------------------------------------------
function initRessourcesView() {
  const container = document.getElementById("ressTable");
  if (!container || !DATA) return;

  const rows = (DATA.ressources || [])
    .map(
      (r) => `
      <tr>
        <td>${r.code}</td>
        <td>${r.titre}</td>
        <td>S${r.semestre}</td>
      </tr>
    `
    )
    .join("");

  container.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Code</th>
          <th>Titre</th>
          <th>Semestre</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// ---------------------------------------------------------
// Page PREUVES (preuve.html)
// Filtres : ?sae=...  ?sem=S3  ou les deux
// ---------------------------------------------------------
function initPreuvesPage() {
  const conteneur = document.getElementById("liste-preuves");
  if (!conteneur || !DATA) return;

  const params = new URLSearchParams(window.location.search);
  const saeParam = params.get("sae");
  const semParam = params.get("sem"); // ex: "S3"
  const texteFiltre = document.getElementById("filtre-sae-texte");

  let preuves = DATA.preuves || [];

  // Filtre semestre -> année BUT
  if (semParam) {
    const semNum = parseSemValue(semParam);
    const year = semesterToYearLabel(semNum);

    if (year) {
      preuves = preuves.filter((p) => p.annee === year);
      if (texteFiltre) texteFiltre.textContent = `Preuves du semestre ${semParam} (${year})`;
    }
  }

  // Filtre SAÉ (en plus)
  if (saeParam) {
    preuves = preuves.filter((p) => p.sae === saeParam);
    if (texteFiltre) {
      const prefix = semParam ? `${texteFiltre.textContent} — ` : "";
      texteFiltre.textContent = `${prefix}Preuves associées à ${saeParam}`;
    }
  }

  if (!semParam && !saeParam && texteFiltre) {
    texteFiltre.textContent = "Toutes les preuves disponibles.";
  }

  if (!preuves.length) {
    conteneur.innerHTML = `<div class="empty">Aucune preuve à afficher.</div>`;
    return;
  }

  conteneur.innerHTML = "";
  preuves.forEach((pr) => {
    const card = document.createElement("article");
    card.className = "preuve-card";

    const imgHtml = pr.fichier
      ? `<img src="${pr.fichier}" alt="${pr.titre}" class="preuve-image">`
      : "";

    card.innerHTML = `
      <h2>${pr.titre}</h2>
      <p><strong>Année :</strong> ${pr.annee || ""}</p>
      <p><strong>SAÉ :</strong> ${pr.sae || ""}</p>
      <p>${pr.description || ""}</p>
      ${imgHtml}
    `;

    conteneur.appendChild(card);
  });
}

// ---------------------------------------------------------
// Navigation entre vues (index.html uniquement)
// ---------------------------------------------------------
function initNavigation() {
  const links = document.querySelectorAll("header nav a");
  const views = document.querySelectorAll(".view");

  // Sur preuve.html il n’y a pas de .view -> on ne bloque aucun lien
  if (!views.length) return;

  function showView(name) {
    views.forEach((v) => v.classList.remove("active"));
    const target = document.getElementById(`view-${name}`);
    if (target) target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      const v = a.dataset.view;

      // ✅ si pas de data-view, on laisse le lien normal fonctionner
      if (!v) return;

      e.preventDefault();
      showView(v);
    });
  });

  document.querySelectorAll(".back-home").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showView("home");
    });
  });
}

// ---------------------------------------------------------
// Thème clair / sombre
// ---------------------------------------------------------
function initThemeToggle() {
  const btn = document.getElementById("theme");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";

    html.setAttribute("data-theme", next);
    btn.textContent = next === "light" ? "🌙 Mode sombre" : "☀️ Mode clair";
  });
}

// ---------------------------------------------------------
// Boutons CV
// ---------------------------------------------------------
function initCvButtons() {
  const btnView = document.getElementById("btnViewCV");
  if (!btnView) return;

  btnView.addEventListener("click", () => {
    const views = document.querySelectorAll(".view");
    views.forEach((v) => v.classList.remove("active"));
    const target = document.getElementById("view-cv");
    if (target) target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
