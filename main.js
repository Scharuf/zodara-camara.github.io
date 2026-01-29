/**
 * main.js – Version unifiée et corrigée
 * Gère le chargement JSON, les graphiques dynamiques et la navigation.
 */

let DATA = null;
let barChart = null;
let donutChart = null;
let radarHomeChart = null;
let radarSaeChart = null;
let currentSemFilter = null; 

let SAE_KEY_FOR_PREUVES = "id";

document.addEventListener("DOMContentLoaded", () => {
    fetch("portfolio.json")
        .then((res) => res.json())
        .then((json) => {
            DATA = json;

            // 1. Détecter si on lie les preuves par "id" ou "code"
            detectSaeKeyForPreuves();

            // 2. Initialiser les statistiques globales (tous semestres)
            const initialStats = computeStatsForSemester(null);

            // 3. Lancer l'interface
            initKpis(initialStats);
            
            // Un léger délai assure que les Canvas sont bien rendus avant Chart.js
            setTimeout(() => {
                initCharts(initialStats);
                initSaeView();
            }, 50);

            initCompetencesView();
            initRessourcesView();
            initNavigation();
            initThemeToggle();
            initCvButtons();
            initPreuvesPage();
        })
        .catch((err) => {
            console.error("Erreur critique de chargement :", err);
        });
});

// --- LOGIQUE DE CALCUL ET DÉTECTION ---

function detectSaeKeyForPreuves() {
    if (!DATA || !DATA.preuves || DATA.preuves.length === 0) return;
    const sample = DATA.preuves[0].sae;
    const matchId = DATA.sae.some((s) => s.id === sample);
    const matchCode = DATA.sae.some((s) => s.code === sample);
    SAE_KEY_FOR_PREUVES = (matchCode && !matchId) ? "code" : "id";
}

function computeStatsForSemester(semValue) {
    const baseStats = DATA.stats;
    const allHoursByComp = baseStats.hours_by_competence;
    const compKeys = Object.keys(allHoursByComp);

    if (!semValue) {
        return {
            total_hours: baseStats.total_hours,
            nb_sae: baseStats.nb_sae,
            nb_preuves: baseStats.nb_preuves,
            nb_ressources: DATA.ressources.length,
            hours_by_competence: { ...allHoursByComp }
        };
    }

    const semNum = parseInt(semValue.slice(1), 10);
    const saeSem = DATA.sae.filter((s) => s.semestre === semNum);
    
    // Calcul de répartition prorata pour le filtre semestre
    const hoursByCompSem = {};
    compKeys.forEach((c) => {
        const totalSaeWithComp = DATA.sae.filter(s => s.competences?.includes(c)).length;
        const semSaeWithComp = saeSem.filter(s => s.competences?.includes(c)).length;
        hoursByCompSem[c] = totalSaeWithComp > 0 
            ? Math.round(allHoursByComp[c] * (semSaeWithComp / totalSaeWithComp)) 
            : 0;
    });

    return {
        total_hours: Object.values(hoursByCompSem).reduce((a, b) => a + b, 0),
        nb_sae: saeSem.length,
        nb_preuves: DATA.preuves.length,
        nb_ressources: DATA.ressources.filter(r => r.semestre === semNum).length,
        hours_by_competence: hoursByCompSem
    };
}

// --- AFFICHAGE DES COMPOSANTS ---

function initKpis(stats) {
    const elHours = document.getElementById("kHours");
    const elSplit = document.getElementById("kSplit");
    if (elHours) elHours.textContent = stats.total_hours;
    if (elSplit) {
        elSplit.textContent = Object.entries(stats.hours_by_competence)
            .map(([c, h]) => `${c}: ${h}h`).join(" • ");
    }
    // Update IDs secondaires
    ["kVCOD", "kRess", "kProofHint"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === "kVCOD") el.textContent = stats.nb_sae;
            if (id === "kRess") el.textContent = stats.nb_ressources;
            if (id === "kProofHint") el.textContent = `Preuves : ${stats.nb_preuves}`;
        }
    });
}

function initCharts(stats) {
    const hours = stats.hours_by_competence;
    const labels = Object.keys(hours);
    const values = Object.values(hours);

    const config = (type, data, legend = false) => ({
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Heures',
                data: data,
                backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'],
                borderColor: '#3b82f6',
                borderWidth: 1
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { display: legend } }
        }
    });

    // Destruction/Création pour éviter les superpositions au survol
    if (document.getElementById("bar")) {
        if (barChart) barChart.destroy();
        barChart = new Chart(document.getElementById("bar"), config('bar', values));
    }
    if (document.getElementById("donut")) {
        if (donutChart) donutChart.destroy();
        donutChart = new Chart(document.getElementById("donut"), config('doughnut', values, true));
    }
    if (document.getElementById("radar")) {
        if (radarHomeChart) radarHomeChart.destroy();
        radarHomeChart = new Chart(document.getElementById("radar"), config('radar', values));
    }
}

// --- NAVIGATION ET INTERACTION ---

function initSaeView() {
    const select = document.getElementById("sae");
    if (!select) return;

    select.addEventListener("change", () => {
        const sae = DATA.sae.find(s => s.code === select.value);
        if (!sae) return;
        
        document.getElementById("dTitle").textContent = `${sae.code} - ${sae.titre}`;
        document.getElementById("dBody").innerHTML = `<p>${sae.description}</p><ul>` + 
            (sae.acs || []).map(ac => `<li>${ac}</li>`).join('') + `</ul>`;

        // Mise à jour Radar SAÉ spécifique
        if (radarSaeChart) {
            radarSaeChart.data.datasets[0].data = ["C1", "C2", "C3", "C4"].map(c => 
                sae.competences?.includes(c) ? 3 : 0
            );
            radarSaeChart.update();
        }
    });
}

function initThemeToggle() {
    const btn = document.getElementById("theme");
    if (!btn) return;
    btn.addEventListener("click", () => {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const target = isDark ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", target);
        btn.textContent = isDark ? "🌙 Mode sombre" : "☀️ Mode clair";
        localStorage.setItem("theme", target);
    });
    // Appliquer au chargement
    const saved = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
}

function initPreuvesPage() {
    const container = document.getElementById("liste-preuves");
    if (!container || !DATA) return;

    container.innerHTML = DATA.preuves.map(p => `
        <article class="preuve-card">
            <h2>${p.titre}</h2>
            <p class="muted">${p.annee} | ${p.sae}</p>
            <p>${p.description}</p>
            <img src="${p.fichier}" alt="Aperçu" class="preuve-image" onerror="this.style.display='none'">
        </article>
    `).join('');
}

// Les autres fonctions (Ressources, Navigation, CV) restent identiques à ton code d'origine
function initNavigation() { /* ... ta logique de liens ... */ }
function initCvButtons() { /* ... ta logique de boutons CV ... */ }
function initCompetencesView() { /* ... ta logique de badges ... */ }
function initRessourcesView() { /* ... ta logique de table ... */ }
