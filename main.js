/**
 * main.js - Version unifiée
 * Gère la navigation, les graphiques Chart.js et le filtrage des données.
 */

let DATA = null;
let charts = { bar: null, donut: null, radar: null, radarSae: null };

document.addEventListener("DOMContentLoaded", () => {
    fetch("portfolio.json")
        .then(res => res.json())
        .then(json => {
            DATA = json;
            
            // Initialisation de l'interface
            initNavigation();
            initThemeToggle();
            initSaeSelector();
            
            // Premier affichage (Global)
            updateDashboard(null);

            // Listener pour le filtre Semestre
            const semSelect = document.getElementById("sem");
            if (semSelect) {
                semSelect.addEventListener("change", (e) => {
                    updateDashboard(e.target.value || null);
                });
            }
        })
        .catch(err => console.error("Erreur chargement JSON:", err));
});

// --- NAVIGATION ---
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a[data-view]');
    const views = document.querySelectorAll('.view');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-view');

            // Mise à jour visuelle du menu
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Changement de vue
            views.forEach(v => {
                v.style.display = (v.id === `view-${target}`) ? 'block' : 'none';
            });
            
            // Déclencher le rendu des vues spécifiques
            if (target === 'competences') renderCompetences();
            if (target === 'ressources') renderRessources();
        });
    });
}

// --- LOGIQUE DE DONNÉES & DASHBOARD ---
function updateDashboard(semFilter) {
    const stats = computeStats(semFilter);
    
    // Mise à jour des chiffres (KPIs)
    const elHours = document.getElementById("kHours");
    if (elHours) elHours.textContent = stats.total_hours;
    
    const elSplit = document.getElementById("kSplit");
    if (elSplit) {
        elSplit.textContent = Object.entries(stats.hours_by_competence)
            .map(([c, h]) => `${c}: ${h}h`).join(" • ");
    }

    // Mise à jour des graphiques
    renderMainCharts(stats.hours_by_competence);
}

function computeStats(semFilter) {
    if (!semFilter) return DATA.stats;

    const semNum = parseInt(semFilter.slice(1));
    const saeFiltered = DATA.sae.filter(s => s.semestre === semNum);
    const resFiltered = DATA.ressources.filter(r => r.semestre === semNum);

    // Calcul simplifié pour le filtrage par semestre
    const hours = { "C1": 0, "C2": 0, "C3": 0, "C4": 0 };
    saeFiltered.forEach(s => {
        s.competences.forEach(c => { if(hours[c] !== undefined) hours[c] += 20; }); // Estimation
    });

    return {
        total_hours: Object.values(hours).reduce((a, b) => a + b, 0),
        hours_by_competence: hours,
        nb_sae: saeFiltered.length,
        nb_ressources: resFiltered.length
    };
}

// --- GRAPHIQUES ---
function renderMainCharts(hoursData) {
    const labels = Object.keys(hoursData);
    const values = Object.values(hoursData);
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

    // Helper pour détruire/créer
    const updateChart = (id, type, data, options = {}) => {
        const ctx = document.getElementById(id);
        if (!ctx) return;
        if (charts[id]) charts[id].destroy();
        charts[id] = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{ data: data, backgroundColor: colors, borderWidth: 1 }]
            },
            options: { responsive: true, maintainAspectRatio: false, ...options }
        });
    };

    updateChart('bar', 'bar', values, { plugins: { legend: { display: false } } });
    updateChart('donut', 'doughnut', values);
    updateChart('radar', 'radar', values);
}

// --- VUE SAÉ ---
function initSaeSelector() {
    const select = document.getElementById("sae");
    if (!select) return;

    select.innerHTML = DATA.sae.map(s => `<option value="${s.code}">${s.code} - ${s.titre}</option>`).join('');
    
    select.addEventListener("change", () => {
        const sae = DATA.sae.find(s => s.code === select.value);
        document.getElementById("dTitle").textContent = sae.titre;
        document.getElementById("dBody").innerHTML = `<p>${sae.description}</p>`;
        
        // Radar spécifique SAÉ
        const saeValues = ["C1", "C2", "C3", "C4"].map(c => sae.competences.includes(c) ? 80 : 20);
        renderSaeRadar(saeValues);
    });
}

function renderSaeRadar(data) {
    const ctx = document.getElementById("radar-sae");
    if (!ctx) return;
    if (charts.radarSae) charts.radarSae.destroy();
    charts.radarSae = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ["C1", "C2", "C3", "C4"],
            datasets: [{ label: 'Compétences visées', data: data, backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6' }]
        },
        options: { maintainAspectRatio: false }
    });
}

// --- AUTRES VUES ---
function renderCompetences() {
    const container = document.getElementById("compBadges");
    if (container) {
        container.innerHTML = DATA.competences.map(c => `
            <div class="chip"><strong>${c.id}</strong>: ${c.libelle}</div>
        `).join('');
    }
}

function renderRessources() {
    const container = document.getElementById("ressTable");
    if (container) {
        container.innerHTML = `<table>
            <tr><th>Code</th><th>Titre</th><th>Semestre</th></tr>
            ${DATA.ressources.map(r => `<tr><td>${r.code}</td><td>${r.titre}</td><td>S${r.semestre}</td></tr>`).join('')}
        </table>`;
    }
}

function initThemeToggle() {
    const btn = document.getElementById("theme");
    btn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        btn.textContent = next === "dark" ? "☀️ Mode Clair" : "🌙 Mode Sombre";
    });
}
