// static/js/main.js

let gData = null;
let barChart = null;
let donutChart = null;
let radarGlobalChart = null;
let radarSaeChart = null;

document.addEventListener("DOMContentLoaded", () => {
  // Charger les données statiques
  fetch("static/data/portfolio.json")
    .then((r) => r.json())
    .then((json) => {
      gData = json;
      initNavigation();
      initThemeToggle();
      initCVButtons();
      initHomeView();
      initSaeView();
      initCompetencesView();
      initRessourcesView();
    })
    .catch((err) => {
      console.error("Erreur de chargement du JSON :", err);
    });
});

/* =========================
   Navigation entre les vues
   ========================= */
function initNavigation() {
  const views = document.querySelectorAll(".view");

  function showView(name) {
    views.forEach((v) => v.classList.remove("active"));
    const target = document.getElementById("view-" + name);
    if (target) target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Liens du header
  document.querySelectorAll("nav a[data-view]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const view = a.getAttribute("data-view");
      if (view === "home") showView("home");
      else showView(view);
    });
  });

  // Boutons "Retour à l’accueil"
  document.querySelectorAll(".back-home").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showView("home");
    });
  });
}

/* =========================
   Thème clair / sombre
   ========================= */
function initThemeToggle() {
  const btn = document.getElementById("theme");
  const html = document.documentElement;

  if (!btn) return;

  function updateLabel() {
    const isDark = html.getAttribute("data-theme") === "dark";
    btn.textContent = isDark ? "☀️ Mode clair" : "🌙 Mode sombre";
  }

  btn.addEventListener("click", () => {
    const current = html.getAttribute("data-theme") || "light";
    html.setAttribute("data-theme", current === "light" ? "dark" : "light");
    updateLabel();
  });

  updateLabel();
}

/* =========================
   Boutons CV
   ========================= */
function initCVButtons() {
  const btnView = document.getElementById("btnViewCV");

  if (btnView) {
    btnView.addEventListener("click", () => {
      document
        .querySelectorAll(".view")
        .forEach((v) => v.classList.remove("active"));
      const v = document.getElementById("view-cv");
      if (v) v.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

/* =========================
   Vue accueil : KPIs + charts
   ========================= */
function initHomeView() {
  if (!gData || !gData.summary) return;

  const sum = gData.summary;

  // KPIs
  const kHours = document.getElementById("kHours");
  const kSplit = document.getElementById("kSplit");
  const kVCOD = document.getElementById("kVCOD");
  const kRess = document.getElementById("kRess");

  if (kHours) kHours.textContent = sum.hours_total ?? 0;
  if (kVCOD) kVCOD.textContent = sum.sae_vcod_count ?? 0;
  if (kRess) kRess.textContent = sum.ressources_count ?? 0;

  if (kSplit) {
    const parts = [];
    for (const [cid, obj] of Object.entries(sum.hours_by_competence || {})) {
      parts.push(`${cid} ${obj.hours} h`);
    }
    kSplit.textContent = parts.length ? parts.join(" • ") : "—";
  }

  // Données pour graphiques
  const labels = [];
  const hours = [];
  for (const [cid, obj] of Object.entries(sum.hours_by_competence || {})) {
    labels.push(`${cid} – ${obj.label}`);
    hours.push(obj.hours);
  }

  // Bar chart
  const barCanvas = document.getElementById("bar");
  if (barCanvas && labels.length) {
    if (barChart) barChart.destroy();
    barChart = new Chart(barCanvas.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Heures",
            data: hours,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  // Donut chart
  const donutCanvas = document.getElementById("donut");
  if (donutCanvas && labels.length) {
    if (donutChart) donutChart.destroy();
    donutChart = new Chart(donutCanvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: hours,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
      },
    });

    const legend = document.getElementById("donutLegend");
    if (legend) {
      legend.innerHTML = "";
      labels.forEach((lab, idx) => {
        const span = document.createElement("span");
        span.textContent = `${lab} (${hours[idx]} h)`;
        legend.appendChild(span);
      });
    }
  }

  // Radar global = mêmes données heures / compétence
  const radarCanvas = document.getElementById("radar");
  if (radarCanvas && labels.length) {
    if (radarGlobalChart) radarGlobalChart.destroy();
    radarGlobalChart = new Chart(radarCanvas.getContext("2d"), {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "Heures par compétence",
            data: hours,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          r: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}

/* =========================
   Vue SAÉ & Projets
   ========================= */
function initSaeView() {
  if (!gData || !Array.isArray(gData.sae)) return;

  const select = document.getElementById("sae");
  const dTitle = document.getElementById("dTitle");
  const dBody = document.getElementById("dBody");
  const radarCanvas = document.getElementById("radar-sae");

  if (!select) return;

  // Remplir la liste
  gData.sae.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = String(s.id_sae);
    opt.textContent = `${s.code} — ${s.titre}`;
    select.appendChild(opt);
  });

  function renderRadarForSae(sae) {
    if (!radarCanvas) return;

    const labels = ["C1", "C2", "C3", "C4"];
    const values = [0, 0, 0, 0];

    (sae.competences || []).forEach((c) => {
      const idx = labels.indexOf(c.id_competence);
      if (idx >= 0) {
        const lvl = parseInt(c.niveau_cible || "0", 10);
        values[idx] = isNaN(lvl) ? 0 : lvl;
      }
    });

    if (radarSaeChart) radarSaeChart.destroy();
    radarSaeChart = new Chart(radarCanvas.getContext("2d"), {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "Niveau cible par compétence",
            data: values,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          r: {
            beginAtZero: true,
            suggestedMax: 3,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  function renderDetails(sae) {
    if (dTitle)
      dTitle.textContent = `${sae.code} — Semestre ${sae.semestre}`;

    if (!dBody) return;

    const compList = (sae.competences || [])
      .map((c) => `${c.id_competence} – ${c.intitule}`)
      .join("<br>");

    const acList = (sae.ac || [])
      .map((a) => `${a.code} – ${a.intitule}`)
      .join("<br>");

    const ressList = (sae.ressources || [])
      .map((r) => `${r.code} – ${r.titre}`)
      .join("<br>");

    dBody.innerHTML = `
      <p><strong>Titre :</strong> ${sae.titre}</p>
      <p><strong>Valeur :</strong> ${sae.valeur || "—"}</p>
      <p><strong>Compétences visées :</strong><br>${compList || "—"}</p>
      <p><strong>Apprentissages critiques (AC) :</strong><br>${acList || "—"}</p>
      <p><strong>Ressources mobilisées :</strong><br>${ressList || "—"}</p>
    `;
  }

  select.addEventListener("change", () => {
    const id = parseInt(select.value, 10);
    const sae = gData.sae.find((s) => s.id_sae === id);
    if (!sae) return;
    renderDetails(sae);
    renderRadarForSae(sae);
  });

  // Sélectionner la première SAÉ par défaut
  if (gData.sae.length > 0) {
    select.value = String(gData.sae[0].id_sae);
    select.dispatchEvent(new Event("change"));
  }
}

/* =========================
   Vue Compétences
   ========================= */
function initCompetencesView() {
  if (!gData || !Array.isArray(gData.competences)) return;

  const container = document.getElementById("compBadges");
  if (!container) return;

  container.innerHTML = "";
  gData.competences.forEach((c) => {
    const div = document.createElement("div");
    div.className = "chip";
    div.innerHTML = `
      <strong>${c.id_competence}</strong> – ${c.intitule}
      <p class="chip-desc">${c.description || ""}</p>
    `;
    container.appendChild(div);
  });
}

/* =========================
   Vue Ressources
   ========================= */
function initRessourcesView() {
  if (!gData || !Array.isArray(gData.ressources)) return;

  const container = document.getElementById("ressTable");
  if (!container) return;

  const table = document.createElement("table");
  table.className = "ress-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Code</th>
        <th>Intitulé</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  gData.ressources.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.code}</td>
      <td>${r.titre}</td>
      <td>${r.description || ""}</td>
    `;
    tbody.appendChild(tr);
  });

  container.innerHTML = "";
  container.appendChild(table);
}
