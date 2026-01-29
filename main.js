// main.js – version statique pour GitHub Pages (portfolio.json)
// Corrigé + réorganisé

(() => {
  "use strict";

  const state = {
    DATA: null,
    barChart: null,
    donutChart: null,
    radarHomeChart: null,
    radarSaeChart: null,
    currentSemFilter: null, // null = tous
    SAE_KEY_FOR_PREUVES: "code" // par défaut : "code" (car tes preuves utilisent "SAÉ 1.01")
  };

  document.addEventListener("DOMContentLoaded", initApp);

  async function initApp() {
    try {
      const res = await fetch("portfolio.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} – portfolio.json introuvable ou inaccessible`);
      state.DATA = await res.json();

      detectSaeKeyForPreuves();

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

    } catch (err) {
      console.error("Erreur de chargement / initialisation:", err);
    }
  }

  // ---------------------------------------------------------
  //  Détection de la clé utilisée pour relier SAÉ et preuves
  // ---------------------------------------------------------
  function detectSaeKeyForPreuves() {
    const DATA = state.DATA;
    if (!DATA?.preuves?.length || !DATA?.sae?.length) return;

    const sample = DATA.preuves[0]?.sae;
    if (!sample) return;

    const matchId = DATA.sae.some((s) => s.id === sample);
    const matchCode = DATA.sae.some((s) => s.code === sample);

    if (matchCode && !matchId) state.SAE_KEY_FOR_PREUVES = "code";
    else if (matchId && !matchCode) state.SAE_KEY_FOR_PREUVES = "id";
    else if (matchCode && matchId) state.SAE_KEY_FOR_PREUVES = "code"; // ambigu -> on préfère code
  }

  // ---------------------------------------------------------
  //  Stats en fonction du semestre
  // ---------------------------------------------------------
  function computeStatsForSemester(semValue) {
    const DATA = state.DATA;
    const baseStats = DATA.stats;
    const allHoursByComp = baseStats.hours_by_competence;
    const compKeys = Object.keys(allHoursByComp);

    // Tous semestres
    if (!semValue) {
      return {
        total_hours: baseStats.total_hours,
        nb_sae: baseStats.nb_sae,
        nb_preuves: baseStats.nb_preuves,
        nb_ressources: DATA.ressources.length,
        hours_by_competence: { ...allHoursByComp }
      };
    }

    const semNum = parseInt(semValue.slice(1), 10); // "S4" -> 4

    // SAÉ du semestre
    const saeSem = DATA.sae.filter((s) => s.semestre === semNum);
    const nb_sae = saeSem.length;

    // Ressources du semestre
    const ressourcesSem = DATA.ressources.filter((r) => r.semestre === semNum);
    const nb_ressources = ressourcesSem.length;

    // ---- Preuves du semestre (cohérent) ----
    // On garde les preuves dont p.sae correspond à une SAÉ de ce semestre
    const saeKeysSem = new Set(
      saeSem.map((s) => {
        if (state.SAE_KEY_FOR_PREUVES === "id") return s.id || s.code;
        return s.code;
      })
    );

    const nb_preuves = (DATA.preuves || []).filter((p) => saeKeysSem.has(p.sae)).length;

    // Répartition approximative des heures par compétence (basée sur occurrences de compétences dans les SAÉ)
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
      hoursByCompSem[c] = totOcc === 0 ? 0 : Math.round(allHoursByComp[c] * (semOccur[c] / totOcc));
    });

    const total_hours = Object.values(hoursByCompSem).reduce((sum, h) => sum + h, 0);

    return {
      total_hours,
      nb_sae,
      nb_preuves,
      nb_ressources,
      hours_by_competence: hoursByCompSem
    };
  }

  // ---------------------------------------------------------
  //  KPIs
  // ---------------------------------------------------------
  function initKpis(stats) {
    updateKpis(stats);
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
    kVCOD.textContent = stats.nb_sae;
    kRess.textContent = stats.nb_ressources;
    kProofHint.textContent = `Preuves : ${stats.nb_preuves}`;

    const parts = Object.entries(hoursByComp).map(([code, h]) => `${code} : ${h} h`);
    kSplit.textContent = parts.join(" • ");
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

    if (barCanvas) {
      state.barChart = new Chart(barCanvas.getContext("2d"), {
        type: "bar",
        data: { labels, datasets: [{ label: "Heures par compétence", data: values }] },
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

    if (donutCanvas) {
      state.donutChart = new Chart(donutCanvas.getContext("2d"), {
        type: "doughnut",
        data: { labels, datasets: [{ label: "Répartition des heures", data: values }] },
        options: { responsive: true, plugins: { legend: { position: "bottom" } } }
      });
    }

    if (radarCanvas) {
      state.radarHomeChart = new Chart(radarCanvas.getContext("2d"), {
        type: "radar",
        data: { labels, datasets: [{ label: "Heures par compétence", data: values }] },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { r: { beginAtZero: true, suggestedMax: Math.max(...values) + 20 } }
        }
      });
    }

    updateDonutLegend(labels, values);

    if (radarSaeCanvas) {
      state.radarSaeChart = new Chart(radarSaeCanvas.getContext("2d"), {
        type: "radar",
        data: {
          labels: ["C1", "C2", "C3", "C4"],
          datasets: [{ label: "Poids des compétences dans la SAÉ", data: [0, 0, 0, 0] }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { r: { beginAtZero: true, suggestedMax: 3 } }
        }
      });
    }
  }

  function updateCharts(stats) {
    const hoursByComp = stats.hours_by_competence;
    const labels = Object.keys(hoursByComp);
    const values = Object.values(hoursByComp);

    if (state.barChart) {
      state.barChart.data.labels = labels;
      state.barChart.data.datasets[0].data = values;
      state.barChart.update();
    }

    if (state.donutChart) {
      state.donutChart.data.labels = labels;
      state.donutChart.data.datasets[0].data = values;
      state.donutChart.update();
    }

    if (state.radarHomeChart) {
      state.radarHomeChart.data.labels = labels;
      state.radarHomeChart.data.datasets[0].data = values;
      state.radarHomeChart.options.scales.r.suggestedMax = Math.max(...values) + 20;
      state.radarHomeChart.update();
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
  //  Changement de semestre (KPIs + charts + SAÉ list)
  // ---------------------------------------------------------
  function updateDashboardForSemester(semValue) {
    state.currentSemFilter = semValue || null;
    const stats = computeStatsForSemester(state.currentSemFilter);
    updateKpis(stats);
    updateCharts(stats);
  }

  // ---------------------------------------------------------
  //  Vue SAÉ & Projets
  // ---------------------------------------------------------
  function initSaeView() {
    const DATA = state.DATA;

    const saeSelect = document.getElementById("sae");
    const semSelect = document.getElementById("sem");
    const dTitle = document.getElementById("dTitle");
    const dBody = document.getElementById("dBody");

    if (!saeSelect || !dTitle || !dBody) return;

    function fillSaeOptions(filterSem) {
      saeSelect.innerHTML = "";

      const list = DATA.sae
        .filter((s) => !filterSem || `S${s.semestre}` === filterSem)
        .sort((a, b) => (a.semestre - b.semestre) || a.code.localeCompare(b.code));

      list.forEach((s) => {
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

        if (state.radarSaeChart) {
          state.radarSaeChart.data.datasets[0].data = [0, 0, 0, 0];
          state.radarSaeChart.update();
        }

        const blocExplication = document.getElementById("sae-explication");
        if (blocExplication) blocExplication.textContent = "Aucune SAÉ pour ce semestre.";
      }
    }

    function updateSaeDetails() {
      const code = saeSelect.value;
      const sae = DATA.sae.find((s) => s.code === code);
      if (!sae) return;

      dTitle.textContent = `${sae.code} — Semestre S${sae.semestre}`;

      const compLabels = (sae.competences || []).map((c) => {
        const meta = DATA.competences?.[c];
        return meta ? `${c} — ${meta.label}` : c;
      });

      const acLabels = (sae.acs || []).map((acCode) => {
        const meta = DATA.acs?.[acCode];
        const label = meta ? meta.label : `Description à préciser (${acCode})`;
        return `<li><strong>${acCode}</strong> — ${label}</li>`;
      });

      const allR = DATA.ressources || [];
      const resLines = (sae.ressources || []).map((rCode) => {
        const r = allR.find((x) => x.code === rCode);
        return `<li>${r ? `${r.code} — ${r.titre}` : rCode}</li>`;
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

      // Radar SAÉ : 3 si la compétence est ciblée, 0 sinon
      if (state.radarSaeChart) {
        const labels = ["C1", "C2", "C3", "C4"];
        const data = labels.map((c) => (sae.competences || []).includes(c) ? 3 : 0);
        state.radarSaeChart.data.labels = labels;
        state.radarSaeChart.data.datasets[0].data = data;
        state.radarSaeChart.update();
      }

      // Texte explication perso
      const blocExplication = document.getElementById("sae-explication");
      if (blocExplication) blocExplication.textContent = sae.explication || sae.description || "";

      // Lien preuves filtrées
      const lienPreuves = document.getElementById("btn-preuves-sae");
      if (lienPreuves) {
        const keyValue =
          state.SAE_KEY_FOR_PREUVES === "id"
            ? (sae.id || sae.code)
            : sae.code;

        lienPreuves.href = `preuve.html?sae=${encodeURIComponent(keyValue)}`;
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
  //  Vue Compétences
  // ---------------------------------------------------------
  function initCompetencesView() {
    const DATA = state.DATA;
    const container = document.getElementById("compBadges");
    if (!container || !DATA) return;

    const hoursByComp = DATA.stats.hours_by_competence;

    container.innerHTML = "";
    Object.entries(DATA.competences || {}).forEach(([code, meta]) => {
      const chip = document.createElement("div");
      chip.className = "chip chip-large";
      const h = hoursByComp?.[code] ?? 0;

      chip.innerHTML = `
        <div><strong>${code}</strong> — ${meta.label}</div>
        <div class="muted">${meta.description}</div>
        <div class="muted">Heures totales associées : ${h} h</div>
      `;
      container.appendChild(chip);
    });
  }

  // ---------------------------------------------------------
  //  Vue Ressources (CORRIGÉ)
  // ---------------------------------------------------------
  function initRessourcesView() {
    const DATA = state.DATA;
    const container = document.getElementById("ressTable");
    if (!container || !DATA) return;

    const rows = (DATA.ressources || [])
      .map((r) => {
        return `
          <tr>
            <td>${r.code}</td>
            <td>${r.titre}</td>
            <td>S${r.semestre}</td>
          </tr>
        `;
      })
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
  // ---------------------------------------------------------
  function initPreuvesPage() {
    const DATA = state.DATA;
    const conteneur = document.getElementById("liste-preuves");
    if (!conteneur || !DATA) return;

    const params = new URLSearchParams(window.location.search);
    const saeParam = params.get("sae");
    const texteFiltre = document.getElementById("filtre-sae-texte");

    let preuves = DATA.preuves || [];

    if (saeParam) {
      preuves = preuves.filter((p) => p.sae === saeParam);
      if (texteFiltre) texteFiltre.textContent = `Preuves associées à ${saeParam}`;
    } else {
      if (texteFiltre) texteFiltre.textContent = "Toutes les preuves disponibles.";
    }

    if (!preuves.length) {
      conteneur.textContent = "Aucune preuve à afficher pour le moment.";
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

    links.forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const v = a.dataset.view;
        if (v) showView(v);
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
  //  Thème clair / sombre (avec localStorage)
  // ---------------------------------------------------------
  function initThemeToggle() {
    const btn = document.getElementById("theme");
    if (!btn) return;

    // Restaurer
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      document.documentElement.setAttribute("data-theme", saved);
      btn.textContent = saved === "light" ? "🌙 Mode sombre" : "☀️ Mode clair";
    }

    btn.addEventListener("click", () => {
      const html = document.documentElement;
      const current = html.getAttribute("data-theme") || "light";
      const next = current === "light" ? "dark" : "light";
      html.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
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
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      const target = document.getElementById("view-cv");
      if (target) target.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

})();
