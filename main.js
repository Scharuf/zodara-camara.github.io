// main.js – version statique pour GitHub Pages (portfolio.json)
// ✅ Stats EXACTES basées sur sae.heures (option B)

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
      initRessourcesView(null); // <-- on affiche toutes au départ
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
// Helpers
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

function formatHours(h) {
  if (h == null || Number.isNaN(h)) return "0";
  return Number.isInteger(h) ? String(h) : h.toFixed(1);
}

// Répartition des heures d’une liste de SAÉ sur les compétences
// -> si une SAÉ a 60h et [C1,C2,C3], chacune reçoit 20h.
function computeHoursByCompetenceFromSaeList(saeList) {
  const compTotals = { C1: 0, C2: 0, C3: 0, C4: 0 };

  saeList.forEach((s) => {
    const h = Number(s.heures ?? 0);
    const comps = Array.isArray(s.competences) ? s.competences : [];
    if (!h || !comps.length) return;

    const share = h / comps.length;
    comps.forEach((c) => {
      if (compTotals[c] !== undefined) compTotals[c] += share;
    });
  });

  // On garde des valeurs décimales (souvent nécessaire si division /3)
  // Arrondi léger à 1 décimale pour éviter 19.999999
  Object.keys(compTotals).forEach((c) => {
    compTotals[c] = Math.round(compTotals[c] * 10) / 10;
  });

  return compTotals;
}

function computeTotalHoursFromSaeList(saeList) {
  return saeList.reduce((sum, s) => sum + Number(s.heures ?? 0), 0);
}

// ---------------------------------------------------------
// Détection de la clé utilisée pour relier SAÉ et preuves
// ---------------------------------------------------------
function detectSaeKeyForPreuves() {
  if (!DATA || !DATA.preuves || DATA.preuves.length === 0) return;

  const sample = DATA.preuves[0].sae;
  if (!sample) return;

  const matchId = (DATA.sae || []).some((s) => s.id === sample);
  const matchCode = (DATA.sae || []).some((s) => s.code === sample);

  if (matchCode && !matchId) SAE_KEY_FOR_PREUVES = "code";
  else SAE_KEY_FOR_PREUVES = "id";
}

// ---------------------------------------------------------
// Calcul des stats EXACTES en fonction du semestre (via sae.heures)
// ---------------------------------------------------------
function computeStatsForSemester(semValue) {
  const allSae = DATA.sae || [];
  const allRess = DATA.ressources || [];
  const allPreuves = DATA.preuves || [];

  // Tous semestres
  if (!semValue) {
    const total_hours = computeTotalHoursFromSaeList(allSae);
    const hours_by_competence = computeHoursByCompetenceFromSaeList(allSae);

    const nb_sae_total = allSae.length;
    const nb_sae_vcod = allSae.filter((s) => s.valeur === "VCOD").length;

    return {
      total_hours: Math.round(total_hours), // total entier si tes heures sont entières
      nb_sae_total,
      nb_sae_vcod,
      nb_preuves: allPreuves.length,
      nb_ressources: allRess.length,
      hours_by_competence,
    };
  }

  const semNum = parseSemValue(semValue);
  if (!semNum) return computeStatsForSemester(null);

  const saeSem = allSae.filter((s) => s.semestre === semNum);
  const ressourcesSem = allRess.filter((r) => r.semestre === semNum);

  // Preuves : filtrées par "année" BUT (BUT1/BUT2/BUT3) liée au semestre
  const year = semesterToYearLabel(semNum);
  const preuvesSem = year ? allPreuves.filter((p) => p.annee === year) : allPreuves;

  const total_hours = computeTotalHoursFromSaeList(saeSem);
  const hours_by_competence = computeHoursByCompetenceFromSaeList(saeSem);

  const nb_sae_total = saeSem.length;
  const nb_sae_vcod = saeSem.filter((s) => s.valeur === "VCOD").length;

  return {
    total_hours: Math.round(total_hours),
    nb_sae_total,
    nb_sae_vcod,
    nb_preuves: preuvesSem.length,
    nb_ressources: ressourcesSem.length,
    hours_by_competence,
  };
}

// ---------------------------------------------------------
// KPIs
// ---------------------------------------------------------
function initKpis(stats) {
  updateKpis(stats);
  updateProofsLink();
}

function updateKpis(stats) {
  const kHours = document.getElementById("kHours");
  const kSplit = document.getElementById("kSplit");
  const kVCOD = document.getElementById("kVCOD");
  const kRess = document.getElementById("kRess");
  const kProofHint = document.getElementById("kProofHint");

  if (!kHours || !kSplit || !kVCOD || !kRess || !kProofHint) return;

  kHours.textContent = formatHours(stats.total_hours);
  kVCOD.textContent = stats.nb_sae_vcod;
  kRess.textContent = stats.nb_ressources;
  kProofHint.textContent = `Preuves : ${stats.nb_preuves}`;

  const parts = Object.entries(stats.hours_by_competence).map(
    ([code, h]) => `${code} : ${formatHours(h)} h`
  );
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
  if (typeof Chart === "undefined") return;

  const hoursByComp = stats.hours_by_competence;
  const labels = Object.keys(hoursByComp);
  const values = Object.values(hoursByComp);

  const barCanvas = document.getElementById("bar");
  const donutCanvas = document.getElementById("donut");
  const radarCanvas = document.getElementById("radar");
  const radarSaeCanvas = document.getElementById("radar-sae");

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

  // Donut : proportions correctes + tooltip % + heures
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
                const value = Number(context.parsed ?? 0);
                const total = (context.dataset.data || []).reduce((a, b) => a + Number(b || 0), 0);
                const pct = total ? ((value / total) * 100).toFixed(1) : "0.0";
                return `${context.label} : ${pct}% (${formatHours(value)} h)`;
              },
            },
          },
        },
      },
    });
  }

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

  legendContainer.innerHTML = labels
    .map((c, i) => `<span class="chip">${c} : ${formatHours(values[i])} h</span>`)
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

  // ✅ rendu ressources interactif avec le semestre
  initRessourcesView(currentSemFilter);
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
      <p><strong>Heures :</strong> ${formatHours(Number(sae.heures ?? 0))} h</p>
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
      const keyValue = SAE_KEY_FOR_PREUVES === "code" ? sae.code : (sae.id || sae.code);

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

  // On affiche les heures totales issues de la somme des SAÉ (exact)
  const hoursByComp = computeHoursByCompetenceFromSaeList(DATA.sae || []);

  container.innerHTML = "";
  Object.entries(DATA.competences || {}).forEach(([code, meta]) => {
    const chip = document.createElement("div");
    chip.className = "chip chip-large";
    const h = hoursByComp[code] ?? 0;

    chip.innerHTML = `
      <div><strong>${code}</strong> — ${meta.label}</div>
      <div class="muted">${meta.description}</div>
      <div class="muted">Heures totales associées : ${formatHours(h)} h</div>
    `;
    container.appendChild(chip);
  });
}

// ---------------------------------------------------------
// Vue Ressources (✅ filtrage par semestre)
// ---------------------------------------------------------
function initRessourcesView(semValue) {
  const container = document.getElementById("ressTable");
  if (!container || !DATA) return;

  const semNum = parseSemValue(semValue);
  const ressources = (DATA.ressources || []).filter((r) => {
    if (!semNum) return true;
    return r.semestre === semNum;
  });

  const rows = ressources
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
        ${rows || `<tr><td colspan="3" class="muted">Aucune ressource pour ce semestre.</td></tr>`}
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
      if (!v) return; // lien normal (ex: index.html)
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
