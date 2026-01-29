// main.js – version statique pour GitHub Pages (portfolio.json)

let DATA = null;
let barChart = null;
let donutChart = null;
let radarHomeChart = null;
let radarSaeChart = null;
let currentSemFilter = null; // null = tous les semestres

// clé utilisée pour faire le lien SAÉ <-> preuves ("id" ou "code")
let SAE_KEY_FOR_PREUVES = "id";

document.addEventListener("DOMContentLoaded", () => {
  fetch("portfolio.json")
    .then((res) => res.json())
    .then((json) => {
      DATA = json;

      detectSaeKeyForPreuves();

      // Stats initiales (tous semestres)
      const initialStats = computeStatsForSemester(null);

      initKpis(initialStats);
      initCharts(initialStats);
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
    });
});

// ---------------------------------------------------------
//  Helpers : semestre -> BUT
// ---------------------------------------------------------
function semesterToYearLabel(semNum) {
  if (semNum === 1 || semNum === 2) return "BUT1";
  if (semNum === 3 || semNum === 4) return "BUT2";
  if (semNum === 5 || semNum === 6) return "BUT3";
  return null;
}

function parseSemValue(semValue) {
  // accepte "S3", "3", "S03"
  if (!semValue) return null;
  const n = parseInt(String(semValue).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------
//  Détection de la clé utilisée pour relier SAÉ et preuves
// ---------------------------------------------------------
function detectSaeKeyForPreuves() {
  if (!DATA || !DATA.preuves || DATA.preuves.length === 0) return;

  const sample = DATA.preuves[0].sae;
  if (!sample) return;

  const matchId = DATA.sae.some((s) => s.id === sample);
  const matchCode = DATA.sae.some((s) => s.code === sample);

  if (matchCode && !matchId) {
    SAE_KEY_FOR_PREUVES = "code";
  } else if (matchId && !matchCode) {
    SAE_KEY_FOR_PREUVES = "id";
  } else {
    SAE_KEY_FOR_PREUVES = "id"; // défaut
  }
}

// ---------------------------------------------------------
//  Calcul des stats en fonction du semestre
// ---------------------------------------------------------
function computeStatsForSemester(semValue) {
  const baseStats = DATA.stats;
  const allHoursByComp = baseStats.hours_by_competence;
  const compKeys = Object.keys(allHoursByComp);

  // tous semestres
  if (!semValue) {
    const nb_sae_total = DATA.sae.length;
    const nb_sae_vcod = DATA.sae.filter((s) => s.valeur === "VCOD").length;

    return {
      total_hours: baseStats.total_hours,
      nb_sae_total,
      nb_sae_vcod,
      nb_preuves: baseStats.nb_preuves,
      nb_ressources: DATA.ressources.length,
      hours_by_competence: { ...allHoursByComp },
    };
  }

  const semNum = parseSemValue(semValue);
  if (!semNum) {
    return computeStatsForSemester(null);
  }

  const saeSem = DATA.sae.filter((s) => s.semestre === semNum);
  const nb_sae_total = saeSem.length;
  const nb_sae_vcod = saeSem.filter((s) => s.valeur === "VCOD").length;

  const ressourcesSem = DATA.ressources.filter((r) => r.semestre === semNum);
  const nb_ressources = ressourcesSem.length;

  // Répartition approximative des heures par compétence
  const totalOccur = {};
  const semOccur = {};
  compKeys.forEach((c) => {
    totalOccur[c] = 0;
    semOccur[c] = 0;
  });

  DATA.sae.forEach((s) => {
    (s.competences || []).forEach((c) => {
      if (totalOccur[c] !== undefined) totalOccur[c] += 1;
      if (s.semestre === semNum && semOccur[c] !== undefined) semOccur[c] += 1;
    });
  });

  const hoursByCompSem = {};
  compKeys.forEach((c) => {
    const totOcc = totalOccur[c];
    if (totOcc === 0) {
      hoursByCompSem[c] = 0;
    } else {
      const ratio = semOccur[c] / totOcc;
      hoursByCompSem[c] = Math.round(allHoursByComp[c] * ratio);
    }
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
//  KPIs
// ---------------------------------------------------------
function initKpis(stats) {
  updateKpis(stats);
  updateProofsLink(); // important : lien preuves dépend du semestre
}

function updateKpis(stats) {
  const kHours = document.getElementById("kHours");
  const kSplit = document.getElementById("kSplit");
  const kVCOD = document.getElementById("kVCOD");
  const kRess = document.getElementById("kRess");
  const kProofHint = document.getElementById("kProofHint");

  if (!kHours || !kSplit || !kVCOD || !kRess || !kProofHint) return;

  const hoursByComp = stats.hours_by_competence;

  kHours.textContent = stats.total_hours;
  // KPI "SAÉ VCOD" : on affiche uniquement VCOD (plus logique)
  kVCOD.textContent = stats.nb_sae_vcod;
  kRess.textContent = stats.nb_ressources;
  kProofHint.textContent = `Preuves : ${stats.nb_preuves}`;

  const parts = Object.entries(hoursByComp).map(([code, h]) => `${code} : ${h} h`);
  kSplit.textContent = parts.join(" • ");
}

// met à jour le bouton "Voir les preuves" sur la Home
function updateProofsLink() {
  const btn = document.getElementById("btnProofs");
  if (!btn) return;

  let href = "preuve.html";
  if (currentSemFilter) {
    href += `?sem=${encodeURIComponent(currentSemFilter)}`;
  }
  btn.href = href;
}

// ---------------------------------------------------------
//  Graphiques (Chart.js)
// ---------------------------------------------------------
function initCharts(stats) {
  const hoursByComp = stats.hours_by_competence;
  const labels = Object.keys(hoursByComp);
  const values = Object.values(hoursByComp);

  const barCanvas = document.getElementById("bar");
  const donutCanvas = document.getElementById("donut");
  const radarCanvas = document.getElementById("radar");
  const radarSaeCanvas = document.getElementById("radar-sae");

  // Bar
  if (barCanvas) {
    const barCtx = barCanvas.getContext("2d");
    barChart = new Chart(barCtx, {
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

  // Donut
  if (donutCanvas) {
    const donutCtx = donutCanvas.getContext("2d");
    donutChart = new Chart(donutCtx, {
      type: "doughnut",
      data: { labels, datasets: [{ label: "Répartition des heures", data: values }] },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } },
    });
  }

  // Radar global
  if (radarCanvas) {
    const radarCtx = radarCanvas.getContext("2d");
    radarHomeChart = new Chart(radarCtx, {
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

  // Radar SAÉ
  if (radarSaeCanvas) {
    const radarSaeCtx = radarSaeCanvas.getContext("2d");
    radarSaeChart = new Chart(radarSaeCtx, {
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

  legendContainer.innerHTML = labels
    .map((c, i) => `<span class="chip">${c} : ${values[i]} h</span>`)
    .join(" ");
}

// ---------------------------------------------------------
//  Mise à jour quand on change de semestre
// ---------------------------------------------------------
function updateDashboardForSemester(semValue) {
  currentSemFilter = semValue || null;
  const stats = computeStatsForSemester(currentSemFilter);
  updateKpis(stats);
  updateCharts(stats);
  updateProofsLink(); // <-- clé pour les preuves
}

// ---------------------------------------------------------
//  Vue SAÉ & Projets
// ---------------------------------------------------------
function initSaeView() {
  const saeSelect = document.getElementById("sae");
  const semSelect = document.getElementById("sem");
  const dTitle = document.getElementById("dTitle");
  const dBody = document.getElementById("dBody");

  if (!saeSelect || !dTitle || !dBody) return;

  function fillSaeOptions(filterSem) {
    saeSelect.innerHTML = "";
    DATA.sae.forEach((s) => {
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
      if (blocExplication) {
        blocExplication.textContent = "Aucune SAÉ pour ce semestre dans les données du portfolio.";
      }
    }
  }

  function updateSaeDetails() {
    const code = saeSelect.value;
    const sae = DATA.sae.find((s) => s.code === code);
    if (!sae) return;

    dTitle.textContent = `${sae.code} — Semestre S${sae.semestre}`;

    const compLabels = (sae.competences || []).map((c) => {
      const meta = DATA.competences[c];
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

    if (radarSaeChart) {
      const labels = ["C1", "C2", "C3", "C4"];
      const data = labels.map((c) => (sae.competences && sae.competences.includes(c) ? 3 : 0));
      radarSaeChart.data.labels = labels;
      radarSaeChart.data.datasets[0].data = data;
      radarSaeChart.update();
    }

    const blocExplication = document.getElementById("sae-explication");
    if (blocExplication) {
      blocExplication.textContent = sae.explication || sae.description || "";
    }

    // Bouton preuves SAÉ : on passe sae + sem
    const lienPreuves = document.getElementById("btn-preuves-sae");
    if (lienPreuves) {
      let keyValue;
      if (SAE_KEY_FOR_PREUVES === "code") keyValue = sae.code;
      else keyValue = sae.id || sae.code;

      const params = new URLSearchParams();
      params.set("sae", keyValue);
      params.set("sem", `S${sae.semestre}`);

      lienPreuves.href = `preuve.html?${params.toString()}`;
    }
  }

  saeSelect.addEventListener("change", updateSaeDetails);

  if (semSelect) {
    semSelect.addEventListener("change", () => {
      const val = semSelect.value; // "", "S1"...
      fillSaeOptions(val || null);
      updateDashboardForSemester(val || null);
    });
  }

  fillSaeOptions(null);
}

// ---------------------------------------------------------
//  Vue Compétences
// ---------------------------------------------------------
function initCompetencesView() {
  const container = document.getElementById("compBadges");
  if (!container || !DATA) return;

  const hoursByComp = DATA.stats.hours_by_competence;

  container.innerHTML = "";
  Object.entries(DATA.competences).forEach(([code, meta]) => {
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
//  Vue Ressources (corrigée : header = 3 colonnes)
// ---------------------------------------------------------
function initRessourcesView() {
  const container = document.getElementById("ressTable");
  if (!container || !DATA) return;

  const rows = DATA.ressources
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
//  Page PREUVES (preuve.html)
//  Filtres supportés :
//   - ?sae=SAÉ%203.04
//   - ?sem=S3
//   - ?sae=...&sem=S3
// ---------------------------------------------------------
function initPreuvesPage() {
  const conteneur = document.getElementById("liste-preuves");
  if (!conteneur || !DATA) return;

  const params = new URLSearchParams(window.location.search);
  const saeParam = params.get("sae");
  const semParam = params.get("sem"); // ex: "S3"
  const texteFiltre = document.getElementById("filtre-sae-texte");

  let preuves = DATA.preuves || [];

  // 1) Filtre semestre -> année BUT
  if (semParam) {
    const semNum = parseSemValue(semParam);
    const year = semesterToYearLabel(semNum);
    if (year) {
      preuves = preuves.filter((p) => p.annee === year);
      if (texteFiltre) {
        texteFiltre.textContent = `Preuves du semestre ${semParam} (${year})`;
      }
    }
  }

  // 2) Filtre SAÉ (en plus, si présent)
  if (saeParam) {
    preuves = preuves.filter((p) => p.sae === saeParam);
    if (texteFiltre) {
      const base = semParam ? `${texteFiltre.textContent} — ` : "";
      texteFiltre.textContent = `${base}Preuves associées à ${saeParam}`;
    }
  }

  // 3) Texte par défaut
  if (!semParam && !saeParam && texteFiltre) {
    texteFiltre.textContent = "Toutes les preuves disponibles.";
  }

  if (!preuves.length) {
    conteneur.innerHTML = `<div class="card muted" style="padding:16px;">Aucune preuve à afficher.</div>`;
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
//  Navigation entre vues
// ---------------------------------------------------------
function initNavigation() {
  const links = document.querySelectorAll("header nav a");
  const views = document.querySelectorAll(".view");
  if (!views.length) return;

  function showView(name) {
    views.forEach((v) => v.classList.remove("active"));
    const target = document.getElementById(`view-${name}`);
    if (target) target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  links.forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const v = a.dataset.view;
      if (v) showView(v);
    })
  );

  document.querySelectorAll(".back-home").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showView("home");
    });
  });
}

// ---------------------------------------------------------
//  Thème clair / sombre
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
//  Boutons CV
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
