const PIE_COLORS = ["#2196F3", "#FF5C8D", "#FF9F40", "#FFD966"];

const themeBtn = document.getElementById("theme");
function setTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  themeBtn.textContent = t==="dark" ? "☀️ Mode clair" : "🌙 Mode sombre";
  localStorage.setItem("theme", t);
}
setTheme(localStorage.getItem("theme") || "light");
themeBtn.onclick = () =>
  setTheme((document.documentElement.getAttribute("data-theme")||"light")==="light"?"dark":"light");

// bouton preuves
document.getElementById("btnProofs").onclick = () => { window.location.href = "/preuves"; };

const qs = p=>p?`?semestre=${encodeURIComponent(p.replace('S',''))}`:"";
const esc = s=>(s??"").toString().replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
const $ = id=>document.getElementById(id);

function showView(name){
  document.querySelectorAll(".view").forEach(v => {
    v.classList.toggle("active", v.id === "view-" + name);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== NAVIGATION PAR VUES =====
document.querySelectorAll("nav a[data-view]").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const view = link.getAttribute("data-view");
    showView(view);
  });
});
// Bouton "Visualiser le CV"
const btnViewCV = document.getElementById("btnViewCV");
if (btnViewCV){
  btnViewCV.addEventListener("click", () => {
    showView("cv");
  });
}


// Boutons "Retour à l'accueil"
document.querySelectorAll(".back-home").forEach(btn => {
  btn.addEventListener("click", () => showView("home"));
});


let bar, donut, radar;
let currentSem="";

// ===== KPIs =====
async function loadKPIs(){
  const k = await (await fetch("/api/kpis"+qs(currentSem))).json();
  $("kHours").textContent = k.total_heures || 0;
  $("kVCOD").textContent  = k.sae_vcod || 0;
  $("kRess").textContent  = k.ressources_total || 0;
  const n = k.preuves_total || 0;
  $("kProofHint").textContent = n ? `Galerie d’images (${n})` : "Galerie d’images";
  const split = (k.heures||[]).map(h=>`${h.intitule.split(" ")[0]}: ${h.total_heures}`).join(" · ") || "—";
  $("kSplit").textContent = split;
}

// ===== CHARTS =====
async function loadHeures(){
  const data = await (await fetch("/api/heures"+qs(currentSem))).json();
  const labels = data.map(d=>d.intitule);
  const values = data.map(d=>Number(d.total_heures)||0);

  // Bar chart
  if (bar) bar.destroy();
  bar = new Chart($("bar").getContext("2d"), {
    type:"bar",
    data:{ labels, datasets:[{label:"Heures totales", data:values}] },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      scales:{y:{beginAtZero:true}},
      plugins:{legend:{display:true}}
    }
  });

  // Donut chart avec légende HTML
  if (donut) donut.destroy();
  const colors = PIE_COLORS.slice(0, values.length);
  donut = new Chart($("donut").getContext("2d"), {
    type:"doughnut",
    data:{
      labels,
      datasets:[{
        data:values,
        backgroundColor:colors
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      cutout:"60%",
      plugins:{ legend:{ display:false } }
    }
  });

  const legend = $("donutLegend");
  legend.innerHTML = labels.map((label, i) => `
    <div class="legend-item">
      <span class="legend-color" style="background:${colors[i]}"></span>
      <span>${esc(label)}</span>
    </div>
  `).join("");
}

// ===== RESSOURCES =====
async function loadRessources(){
  const rows = await (await fetch("/api/ressources")).json();
  const target = $("ressTable");
  if (!rows.length){
    target.innerHTML = `<div class="muted" style="padding:10px;">Aucune ressource.</div>`;
    return;
  }
  let html = `<table><thead><tr><th>Code</th><th>Titre</th></tr></thead><tbody>`;
  rows.forEach(r => html += `<tr><td><span class="badge">${esc(r.code)}</span></td><td>${esc(r.titre)}</td></tr>`);
  html += `</tbody></table>`;
  target.innerHTML = html;
}

// ===== SAE LIST + DETAIL + RADAR =====
async function loadSAE(){
  const rows = await (await fetch("/api/sae"+qs(currentSem))).json();
  const sel = $("sae");
  sel.innerHTML = rows.map(s=>`<option value="${s.id_sae}">${esc(s.code)} — ${esc(s.titre)}</option>`).join("");
  function open(){
    if(!sel.value) return;
    openDetail(sel.value);
    loadRadar(sel.value);
  }
  sel.onchange = open;
  sel.ondblclick = open;
  if (rows.length){ sel.value = rows[0].id_sae; open(); }
  else{
    $("dTitle").textContent="Détails SAÉ";
    $("dBody").textContent="Aucune SAÉ.";
    if(radar){radar.destroy(); radar=null;}
  }
}

async function openDetail(id){
  const r = await fetch(`/api/sae/${id}`);
  if(!r.ok) return;
  const d = await r.json();
  $("dTitle").textContent = `${d.code} — Semestre ${d.semestre}`;
  const comp = (d.competences||[]).map(x=>`<li><strong>${x.id_competence}</strong> — ${esc(x.intitule)}</li>`).join("") || "<li class='muted'>Aucune</li>";
  const acs  = (d.acs||[]).map(x=>`<li><strong>${x.code}</strong> — ${esc(x.intitule)}</li>`).join("") || "<li class='muted'>Aucune</li>";
  const ress = (d.ressources||[]).map(x=>`<li><strong>${x.code}</strong> — ${esc(x.titre)}</li>`).join("") || "<li class='muted'>Aucune</li>";
  $("dBody").innerHTML = `
    <p><strong>Titre :</strong> ${esc(d.titre)}</p>
    <p><strong>Valeur :</strong> <span class="badge">${esc(d.valeur||"—")}</span></p>
    <h4>Compétences</h4><ul>${comp}</ul>
    <h4>AC associées</h4><ul>${acs}</ul>
    <h4>Ressources utilisées</h4><ul>${ress}</ul>
  `;
}

async function loadRadar(id){
  const r = await fetch(`/api/sae/${id}/radar`);
  const d = await r.json();
  if (radar) radar.destroy();
  radar = new Chart($("radar").getContext("2d"), {
    type:"radar",
    data:{ labels:d.labels, datasets:[{label:"Niveau", data:d.values, borderWidth:2, pointRadius:3}] },
    options:{
      responsive:true,
      maintainAspectRatio:true,
      plugins:{ legend:{display:false} },
      scales:{ r:{ beginAtZero:true, suggestedMax:Math.max(3,...d.values,3), ticks:{ stepSize:1 } } }
    }
  });
}

// ===== COMPETENCES (badges) =====
async function loadCompetences(){
  const rows = await (await fetch("/api/competences")).json();
  const t = $("compBadges");
  t.innerHTML = rows.map(c => `
    <div class="chip">
      <span class="code">${esc(c.id_competence)}</span>
      <div>
        <strong>${esc(c.intitule)}</strong><br>
        <span class="muted">${esc(c.description)}</span>
      </div>
    </div>
  `).join("");
}

// ===== Semestre filtre =====
$("sem").onchange = async (e)=>{
  const v = e.target.value;
  currentSem = v ? v.replace('S','') : "";
  await Promise.all([loadKPIs(), loadHeures(), loadSAE(), loadRessources()]);
};

// ===== Boutons "Retour à l'accueil" =====
document.querySelectorAll(".back-top").forEach(btn => {
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// ===== INIT =====
(async function(){
  await Promise.all([loadKPIs(), loadHeures(), loadSAE(), loadRessources(), loadCompetences()]);
})();
