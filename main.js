// main.js – version statique pour GitHub Pages (portfolio.json)

let DATA = null;
let barChart = null;
let donutChart = null;
let radarHomeChart = null;
let radarSaeChart = null;

document.addEventListener("DOMContentLoaded", () => {
  fetch("portfolio.json")
    .then((res) => res.json())
    .then((json) => {
      DATA = json;
      initKpis();
      initCharts();
      initSaeView();
      initCompetencesView();
      initRessourcesView();
      initNavigation();
      initThemeToggle();
      initCvButtons();
    })
    .catch((err) => {
      console.error("Erreur de chargement de portfolio.json", err);
    });
});

// ---------------------------------------------------------
//  KPIs
// ---------------------------------------------------------
function initKpis() {
  if (!DATA || !DATA.stats) return;

  const kHours = document.getElementById("kHours");
  const kSplit = document.getElementById("kSplit");
  const kVCOD = document.getElementById("kVCOD");
  const kRess = document.getElementById("kRess");
  const kProofHint = document.getElementById("kProofHint");

  const stats = DATA.stats;
  const hoursByComp = stats.hours_by_competence || {};

  kHours.textContent = stats.total_hours ?? 0;
  kVCOD.textContent = stats.nb_sae ?? 0;
  kRess.textContent = (DATA.ressources || []).length;
  kProofHint.textContent = `Preuves : ${stats.nb_preuves ?? 0}`;

  const parts = Object.entries(hoursByComp).map(
    ([code, h]) => `${code} : ${h} h`
  );
  kSplit.textContent = parts.join(" • ");
}

// ---------------------------------------------------------
//  Graphiques (Chart.js)
// ---------------------------------------------------------
function initCharts() {
  if (!DATA || !DATA.stats) return;

  const hoursByComp = DATA.stats.hours_by_competence || {};
  const labels = Object.keys(hoursByComp); // ["C1","C2","C3","C4"]
  const values = Object.values(hoursByComp);

  // Bar chart
  const barCanvas = document.getElementById("bar");
  if (barCanvas) {
    const barCtx = barCanvas.getContext("2d");
    barChart = new Chart(barCtx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Heures par compétence",
            data: values
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: "Compétence" } },
          y: { title: { display: true, text: "Heures" }, beginAtZero: true }
        }
      }
    });
  }

  // Donut chart
  const donutCanvas = document.getElementById("donut");
  if (donutCanvas) {
    const donutCtx = donutCanvas.getContext("2d");
    donutChart = new Chart(donutCtx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            label: "Répartition des heures",
            data: values
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } }
      }
    });

    const legendContainer = document.getElementById("donutLegend");
    if (legendContainer) {
      legendContainer.innerHTML = labels
        .map((c, i) => `<span class="chip">${c} : ${values[i]} h</span>`)
        .join(" ");
    }
  }

  // Radar global (mêmes données)
  const radarCanvas = document.getElementById("radar");
  if (radarCanvas) {
    const radarCtx = radarCanvas.getContext("2d");
    radarHomeChart = new Chart(radarCtx, {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "Heures par compétence",
            data: values
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            beginAtZero: true,
            suggestedMax: Math.max(...values, 0) + 20
          }
        }
      }
    });
  }

  // Radar par SAÉ (sera mis à jour dans la vue SAÉ)
  const radarSaeCanvas = document.getElementById("radar-sae");
  if (radarSaeCanvas) {
    const radarSaeCtx = radarSaeCanvas.getContext("2d");
    radarSaeChart = new Chart(radarSaeCtx, {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "Poids des compétences dans la SAÉ",
            data: [0, 0, 0, 0]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            beginAtZero: true,
            suggestedMax: 3
          }
        }
      }
    });
  }
}

// ---------------------------------------------------------
//  Vue SAÉ & Projets
// ---------------------------------------------------------
function initSaeView() {
  if (!DATA) return;

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
      dTitle.textContent = "Aucune Saé disponible";
      dBody.textContent =
        "Aucune Saé pour ce semestre dans les données du portfolio.";
      if (radarSaeChart) {
        radarSaeChart.data.datasets[0].data = [0, 0, 0, 0];
        radarSaeChart.update();
      }
    }
  }

  function updateSaeDetails() {
    const code = saeSelect.value;
    const sae = (DATA.sae || []).find((s) => s.code === code);
    if (!sae) return;

    dTitle.textContent = `${sae.code} — Semestre ${sae.semestre}`;

    // Compétences
    const compLabels = (sae.competences || []).map((c) => {
      const meta = DATA.competences?.[c];
      return meta ? `${c} — ${meta.label}` : c;
    });

    // AC : récupérer le libellé dans DATA.acs
    const acLines = (sae.acs || []).map((acCode) => {
      const acMeta = DATA.acs?.[acCode];
      const label = acMeta?.label || acCode;
      return `<li><strong>${acCode}</strong> — ${label}</li>`;
    });

    // Ressources mobilisées : retrouver le titre à partir du code
    const ressLines = (sae.ressources || []).map((rCode) => {
      const r = (DATA.ressources || []).find((rr) => rr.code === rCode);
      const label = r ? `${r.code} — ${r.titre}` : rCode;
      return `<li>${label}</li>`;
    });

    dBody.innerHTML = `
      <p><strong>Titre :</strong> ${sae.titre}</p>
      <p><strong>Semestre :</strong> S${sae.semestre}</p>
      <p><strong>Valeur :</strong> ${sae.valeur}</p>
      <p><strong>Compétences ciblées :</strong> ${
        compLabels.length ? compLabels.join(", ") : "—"
      }</p>
      <p><strong>Description :</strong> ${sae.description || "—"}</p>

      <p><strong>AC associées :</strong></p>
      ${
        acLines.length
          ? `<ul>${acLines.join("")}</ul>`
          : "<p>— Aucune AC renseignée pour cette SAÉ.</p>"
      }

      <p><strong>Ressources mobilisées :</strong></p>
      ${
        ressLines.length
          ? `<ul>${ressLines.join("")}</ul>`
          : "<p>— Aucune ressource renseignée pour cette SAÉ.</p>"
      }
    `;

    // Radar SAÉ : 3 si la compétence est ciblée, 0 sinon
    const labels = ["C1", "C2", "C3", "C4"];
    const data = labels.map((c) =>
      sae.competences && sae.competences.includes(c) ? 3 : 0
    );
    if (radarSaeChart) {
      radarSaeChart.data.labels = labels;
      radarSaeChart.data.datasets[0].data = data;
      radarSaeChart.update();
    }
  }

  saeSelect.addEventListener("change", updateSaeDetails);

  if (semSelect) {
    semSelect.addEventListener("change", () => {
      const val = semSelect.value; // "", "S1", ...
      fillSaeOptions(val || null);
    });
  }

  // Remplissage initial
  fillSaeOptions(null);
}

// ---------------------------------------------------------
//  Vue Compétences
// ---------------------------------------------------------
function initCompetencesView() {
  if (!DATA) return;
  const container = document.getElementById("compBadges");
  if (!container) return;

  const hoursByComp = DATA.stats?.hours_by_competence || {};

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
//  Vue Ressources
// ---------------------------------------------------------
function initRessourcesView() {
  if (!DATA) return;
  const container = document.getElementById("ressTable");
  if (!container) return;

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
//  Navigation entre vues
// ---------------------------------------------------------
function initNavigation() {
  const links = document.querySelectorAll("header nav a");
  const views = document.querySelectorAll(".view");

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
//  Boutons CV + preuves
// ---------------------------------------------------------
function initCvButtons() {
  const btnView = document.getElementById("btnViewCV");
  if (btnView) {
    btnView.addEventListener("click", () => {
      document
        .querySelectorAll(".view")
        .forEach((v) => v.classList.remove("active"));
      const target = document.getElementById("view-cv");
      if (target) target.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const btnProofs = document.getElementById("btnProofs");
  if (btnProofs) {
    btnProofs.addEventListener("click", () => {
      alert(
        "Galerie de preuves non encore configurée dans la version statique."
      );
    });
  }
}
