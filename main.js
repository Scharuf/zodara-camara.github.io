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
  const kHours = document.getElementById("kHours");
  const kSplit = document.getElementById("kSplit");
  const kVCOD = document.getElementById("kVCOD");
  const kRess = document.getElementById("kRess");
  const kProofHint = document.getElementById("kProofHint");

  const stats = DATA.stats;
  const hoursByComp = stats.hours_by_competence;

  kHours.textContent = stats.total_hours;
  kVCOD.textContent = DATA.stats.nb_sae;
  kRess.textContent = DATA.ressources.length;
  kProofHint.textContent = `Preuves : ${stats.nb_preuves}`;

  const parts = Object.entries(hoursByComp).map(
    ([code, h]) => `${code} : ${h} h`
  );
  kSplit.textContent = parts.join(" • ");
}

// ---------------------------------------------------------
//  Graphiques (Chart.js)
// ---------------------------------------------------------
function initCharts() {
  const hoursByComp = DATA.stats.hours_by_competence;
  const labels = Object.keys(hoursByComp); // ["C1","C2","C3","C4"]
  const values = Object.values(hoursByComp);

  // Bar chart
  const barCtx = document.getElementById("bar").getContext("2d");
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

  // Donut chart
  const donutCtx = document.getElementById("donut").getContext("2d");
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

  // Légende custom
  const legendContainer = document.getElementById("donutLegend");
  legendContainer.innerHTML = labels
    .map((c, i) => `<span class="chip">${c} : ${values[i]} h</span>`)
    .join(" ");

  // Radar global (même données que bar)
  const radarCtx = document.getElementById("radar").getContext("2d");
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
          suggestedMax: Math.max(...values) + 20
        }
      }
    }
  });

  // Radar par SAÉ
  const radarSaeCtx = document.getElementById("radar-sae").getContext("2d");
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

// ---------------------------------------------------------
//  Vue SAÉ & Projets
// ---------------------------------------------------------
function initSaeView() {
  const saeSelect = document.getElementById("sae");
  const semSelect = document.getElementById("sem");
  const dTitle = document.getElementById("dTitle");
  const dBody = document.getElementById("dBody");

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
      dTitle.textContent = "Aucune Saé disponible";
      dBody.textContent =
        "Aucune Saé pour ce semestre dans les données du portfolio.";
      radarSaeChart.data.datasets[0].data = [0, 0, 0, 0];
      radarSaeChart.update();
    }
  }

  function updateSaeDetails() {
    const code = saeSelect.value;
    const sae = DATA.sae.find((s) => s.code === code);
    if (!sae) return;

    dTitle.textContent = `${sae.code} — Semestre ${sae.semestre}`;

    const compLabels = (sae.competences || []).map((c) => {
      const meta = DATA.competences[c];
      return meta ? `${c} — ${meta.label}` : c;
    });

    // AC détaillées
    const acLabels = (sae.acs || []).map((acCode) => {
      const meta = DATA.acs && DATA.acs[acCode];
      const label = meta ? meta.label : `Description à préciser (${acCode})`;
      return `<li><strong>${acCode}</strong> — ${label}</li>`;
    });

    // Ressources détaillées
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
      <p><strong>Compétences ciblées :</strong> ${
        compLabels.length ? compLabels.join(", ") : "—"
      }</p>
      <p><strong>Description :</strong> ${sae.description || "—"}</p>
      <p><strong>AC associées :</strong></p>
      ${
        acLabels.length
          ? `<ul>${acLabels.join("")}</ul>`
          : "<p class=\"muted\">Aucune AC renseignée.</p>"
      }
      <p><strong>Ressources mobilisées :</strong></p>
      ${
        resLines.length
          ? `<ul>${resLines.join("")}</ul>`
          : "<p class=\"muted\">Aucune ressource renseignée.</p>"
      }
    `;

    // Radar par SAÉ (3 si la compétence est ciblée, 0 sinon)
    const labels = ["C1", "C2", "C3", "C4"];
    const data = labels.map((c) =>
      sae.competences && sae.competences.includes(c) ? 3 : 0
    );
    radarSaeChart.data.labels = labels;
    radarSaeChart.data.datasets[0].data = data;
    radarSaeChart.update();
  }

  saeSelect.addEventListener("change", updateSaeDetails);

  if (semSelect) {
    semSelect.addEventListener("change", () => {
      const val = semSelect.value; // "", "S1", "S2", ...
      fillSaeOptions(val || null);
    });
  }

  // initial
  fillSaeOptions(null);
}

// ---------------------------------------------------------
//  Vue Compétences
// ---------------------------------------------------------
function initCompetencesView() {
  const container = document.getElementById("compBadges");
  if (!container) return;

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
//  Vue Ressources
// ---------------------------------------------------------
function initRessourcesView() {
  const container = document.getElementById("ressTable");
  if (!container) return;

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

  const btnProofs = document.getElementById("btnProofs");
  if (btnProofs) {
    btnProofs.addEventListener("click", () => {
      alert("Galerie de preuves non encore configurée dans la version statique.");
    });
  }
}
