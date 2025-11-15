// main.js – version statique pour GitHub Pages (portfolio.json)

let DATA = null;
let barChart = null;
let donutChart = null;
let radarHomeChart = null;
let radarSaeChart = null;

// pour recalculer les stats par semestre
let GLOBAL_COMP_COUNTS = { C1: 0, C2: 0, C3: 0, C4: 0 };

// ---------------------------------------------------------
//  Chargement du JSON
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  fetch("portfolio.json")
    .then((res) => res.json())
    .then((json) => {
      DATA = json;
      prepareGlobalCompCounts();
      // affichage complet (tous semestres)
      updateKpisAndCharts(null);
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
//  Préparation : comptage global des compétences sur toutes les SAÉ
// ---------------------------------------------------------
function prepareGlobalCompCounts() {
  GLOBAL_COMP_COUNTS = { C1: 0, C2: 0, C3: 0, C4: 0 };
  DATA.sae.forEach((s) => {
    (s.competences || []).forEach((c) => {
      if (GLOBAL_COMP_COUNTS[c] !== undefined) {
        GLOBAL_COMP_COUNTS[c] += 1;
      }
    });
  });
}

// ---------------------------------------------------------
//  Calcule les stats (heures, nb SAÉ, nb ressources…) pour un semestre
//  filterSem = "S1", "S2", ... ou null pour tout
// ---------------------------------------------------------
function computeStatsForSemester(filterSem) {
  const allSae = DATA.sae;
  const allRess = DATA.ressources;

  const saeList = filterSem
    ? allSae.filter((s) => `S${s.semestre}` === filterSem)
    : allSae;

  const ressList = filterSem
    ? allRess.filter((r) => `S${r.semestre}` === filterSem)
    : allRess;

  const nbSae = saeList.length;
  const nbRess = ressList.length;

  // comptage des compétences sur le sous-ensemble
  const compCountsCurrent = { C1: 0, C2: 0, C3: 0, C4: 0 };
  saeList.forEach((s) => {
    (s.competences || []).forEach((c) => {
      if (compCountsCurrent[c] !== undefined) {
        compCountsCurrent[c] += 1;
      }
    });
  });

  // on repart de la répartition globale des heures
  const globalHours = DATA.stats.hours_by_competence;
  const hoursByCompCurrent = { C1: 0, C2: 0, C3: 0, C4: 0 };
  let totalHoursCurrent = 0;

  ["C1", "C2", "C3", "C4"].forEach((c) => {
    const globalCount = GLOBAL_COMP_COUNTS[c] || 0;
    const currentCount = compCountsCurrent[c] || 0;

    if (filterSem == null) {
      // pas de filtre → on garde les valeurs originales
      hoursByCompCurrent[c] = globalHours[c] || 0;
    } else if (globalCount === 0) {
      hoursByCompCurrent[c] = 0;
    } else {
      // on propage les heures globales au prorata du nombre de SAÉ
      const ratio = currentCount / globalCount;
      hoursByCompCurrent[c] = Math.round((globalHours[c] || 0) * ratio);
    }

    totalHoursCurrent += hoursByCompCurrent[c];
  });

  // si pas de filtre, on force à la valeur totale d’origine
  if (filterSem == null) {
    totalHoursCurrent = DATA.stats.total_hours;
  }

  return {
    total_hours: totalHoursCurrent,
    nb_sae: nbSae,
    nb_preuves: DATA.stats.nb_preuves,
    nb_ressources: nbRess,
    hours_by_competence: hoursByCompCurrent
  };
}

// ---------------------------------------------------------
//  Met à jour KPIs + graphiques pour un semestre donné
// ---------------------------------------------------------
function updateKpisAndCharts(filterSem) {
  const stats = computeStatsForSemester(filterSem);
  const hoursByComp = stats.hours_by_competence;
  const labels = Object.keys(hoursByComp);
  const values = Object.values(hoursByComp);

  // ===== KPIs =====
  const kHours = document.getElementById("kHours");
  const kSplit = document.getElementById("kSplit");
  const kVCOD = document.getElementById("kVCOD");
  const kRess = document.getElementById("kRess");
  const kProofHint = document.getElementById("kProofHint");

  if (kHours) kHours.textContent = stats.total_hours;
  if (kVCOD) kVCOD.textContent = stats.nb_sae;
  if (kRess) kRess.textContent = stats.nb_ressources;
  if (kProofHint) kProofHint.textContent = `Preuves : ${stats.nb_preuves}`;

  const parts = labels.map((c, i) => `${c} : ${values[i]} h`);
  if (kSplit) kSplit.textContent = parts.join(" • ");

  // ===== Graphiques =====
  // Bar
  const barCanvas = document.getElementById("bar");
  if (barCanvas) {
    const barCtx = barCanvas.getContext("2d");
    if (!barChart) {
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
    } else {
      barChart.data.labels = labels;
      barChart.data.datasets[0].data = values;
      barChart.update();
    }
  }

  // Donut
  const donutCanvas = document.getElementById("donut");
  if (donutCanvas) {
    const donutCtx = donutCanvas.getContext("2d");
    if (!donutChart) {
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
    } else {
      donutChart.data.labels = labels;
      donutChart.data.datasets[0].data = values;
      donutChart.update();
    }

    const legendContainer = document.getElementById("donutLegend");
    if (legendContainer) {
      legendContainer.innerHTML = labels
        .map((c, i) => `<span class="chip">${c} : ${values[i]} h</span>`)
        .join(" ");
    }
  }

  // Radar global
  const radarCanvas = document.getElementById("radar");
  if (radarCanvas) {
    const radarCtx = radarCanvas.getContext("2d");
    if (!radarHomeChart) {
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
              suggestedMax: Math.max(...values, 10) + 20
            }
          }
        }
      });
    } else {
      radarHomeChart.data.labels = labels;
      radarHomeChart.data.datasets[0].data = values;
      radarHomeChart.update();
    }
  }

  // Radar SAÉ existe déjà, il est mis à jour ailleurs
}

// ---------------------------------------------------------
//  Vue SAÉ & Projets
// ---------------------------------------------------------
function initSaeView() {
  const saeSelect = document.getElementById("sae");
  const semSelect = document.getElementById("sem");
  const dTitle = document.getElementById("dTitle");
  const dBody = document.getElementById("dBody");

  if (!saeSelect) return;

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
      if (dTitle) dTitle.textContent = "Aucune Saé disponible";
      if (dBody) {
        dBody.textContent =
          "Aucune Saé pour ce semestre dans les données du portfolio.";
      }
      if (radarSaeChart) {
        radarSaeChart.data.datasets[0].data = [0, 0, 0, 0];
        radarSaeChart.update();
      }
    }
  }

  function updateSaeDetails() {
    const code = saeSelect.value;
    const sae = DATA.sae.find((s) => s.code === code);
    if (!sae) return;

    if (dTitle) dTitle.textContent = `${sae.code} — Semestre ${sae.semestre}`;

    const compLabels = (sae.competences || []).map((c) => {
      const meta = DATA.competences[c];
      return meta ? `${c} — ${meta.label}` : c;
    });

    // AC
    const acList = sae.acs || sae.ac || [];
    const acHtml =
      acList.length > 0
        ? `<ul>${acList.map((a) => `<li>${a}</li>`).join("")}</ul>`
        : "— (non renseignées dans la version statique)";

    // Ressources
    const ressCodes = sae.ressources || [];
    let ressHtml = "— (non renseignées dans la version statique)";
    if (ressCodes.length > 0) {
      const details = ressCodes.map((code) => {
        const r = DATA.ressources.find((rr) => rr.code === code);
        return r ? `${code} — ${r.titre}` : code;
      });
      ressHtml = `<ul>${details.map((t) => `<li>${t}</li>`).join("")}</ul>`;
    }

    if (dBody) {
      dBody.innerHTML = `
        <p><strong>Titre :</strong> ${sae.titre}</p>
        <p><strong>Semestre :</strong> S${sae.semestre}</p>
        <p><strong>Valeur :</strong> ${sae.valeur}</p>
        <p><strong>Compétences ciblées :</strong> ${
          compLabels.length ? compLabels.join(", ") : "—"
        }</p>
        <p><strong>Description :</strong> ${sae.description || "—"}</p>
        <p><strong>AC associées :</strong><br>${acHtml}</p>
        <p><strong>Ressources mobilisées :</strong><br>${ressHtml}</p>
      `;
    }

    // Radar par SAÉ : 3 si compétence ciblée, 0 sinon
    const labels = ["C1", "C2", "C3", "C4"];
    const data = labels.map((c) =>
      sae.competences && sae.competences.includes(c) ? 3 : 0
    );

    if (!radarSaeChart) {
      const radarSaeCtx = document
        .getElementById("radar-sae")
        .getContext("2d");
      radarSaeChart = new Chart(radarSaeCtx, {
        type: "radar",
        data: {
          labels,
          datasets: [
            {
              label: "Poids des compétences dans la SAÉ",
              data
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
    } else {
      radarSaeChart.data.labels = labels;
      radarSaeChart.data.datasets[0].data = data;
      radarSaeChart.update();
    }
  }

  saeSelect.addEventListener("change", updateSaeDetails);

  // filtre par semestre (dans le header)
  if (semSelect) {
    semSelect.addEventListener("change", () => {
      const val = semSelect.value || null; // "" => tous
      fillSaeOptions(val);
      updateKpisAndCharts(val);
    });
  }

  // remplissage initial
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
//  Boutons CV & Preuves
// ---------------------------------------------------------
function initCvButtons() {
  const btnView = document.getElementById("btnViewCV");
  if (btnView) {
    btnView.addEventListener("click", () => {
      const views = document.querySelectorAll(".view");
      views.forEach((v) => v.classList.remove("active"));
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
