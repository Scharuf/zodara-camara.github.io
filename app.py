import os
import sqlite3
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

DB_FILE = "butsd.sqlite"
INIT_SQL_FILE = "init_db.sql"


def ensure_database():
    if not os.path.exists(DB_FILE):
        open(DB_FILE, "w").close()


def init_tables():
    ensure_database()
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        with open(INIT_SQL_FILE, "r", encoding="utf-8") as f:
            sql = f.read()
        conn.executescript(sql)
    print("✅ Base initialisée")


def q(sql, args=()):
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        cur = conn.execute(sql, args)
        return [dict(r) for r in cur.fetchall()]


@app.route("/")
def index():
    return render_template("index.html")


# ---- NOUVELLE PAGE : Galerie des preuves ----
@app.route("/preuves")
def page_preuves():
    """
    Affiche une galerie d’images des preuves.
    On essaie d’être robuste au schéma de table : on cherche une colonne
    qui ressemble à une URL/chemin d’image (image_url | url | chemin | fichier | path).
    """
    rows = []
    try:
        rows = q("SELECT * FROM preuves_sae")
    except Exception:
        rows = []

    # Détecte la colonne image si possible
    img_keys = {"image_url", "image", "url", "chemin", "fichier", "path"}
    key_found = None
    if rows:
        for k in rows[0].keys():
            if k.lower() in img_keys:
                key_found = k
                break

    return render_template("preuves.html", rows=rows, image_key=key_found)


# ==== API ====

@app.route("/api/competences")
def api_competences():
    return jsonify(q("""
        SELECT id_competence, intitule, description
        FROM COMPETENCE ORDER BY id_competence
    """))

@app.route("/api/heures")
def api_heures():
    s = request.args.get("semestre", type=int)
    if s:
        return jsonify(q("""
            SELECT c.id_competence, c.intitule, COALESCE(SUM(a.heure),0) AS total_heures
            FROM COMPETENCE c
            LEFT JOIN ACTIVITE_PEDAGOGIQUE a
              ON a.id_competence = c.id_competence AND a.semestre = ?
            GROUP BY c.id_competence, c.intitule
            ORDER BY c.id_competence
        """, (s,)))
    return jsonify(q("""
        SELECT c.id_competence, c.intitule, COALESCE(SUM(a.heure),0) AS total_heures
        FROM COMPETENCE c
        LEFT JOIN ACTIVITE_PEDAGOGIQUE a ON a.id_competence = c.id_competence
        GROUP BY c.id_competence, c.intitule
        ORDER BY c.id_competence
    """))

@app.route("/api/kpis")
def api_kpis():
    s = request.args.get("semestre", type=int)

    if s:
        heures = q("""
            SELECT c.intitule, COALESCE(SUM(a.heure),0) AS total_heures
            FROM COMPETENCE c
            LEFT JOIN ACTIVITE_PEDAGOGIQUE a
              ON a.id_competence = c.id_competence AND a.semestre = ?
            GROUP BY c.intitule ORDER BY c.intitule
        """, (s,))
        sae_vcod = q("SELECT COUNT(*) n FROM sae WHERE numero_semestre=? AND valeur='VCOD'", (s,))[0]["n"]
        # on garde le comptage côté API si jamais tu en as besoin ailleurs
        preuves = q("""
            SELECT COUNT(*) n
            FROM preuves_sae p
            JOIN sae s2 ON s2.id_sae = p.id_sae
            WHERE s2.numero_semestre = ?
        """, (s,))[0]["n"]
    else:
        heures = q("""
            SELECT c.intitule, COALESCE(SUM(a.heure),0) AS total_heures
            FROM COMPETENCE c
            LEFT JOIN ACTIVITE_PEDAGOGIQUE a ON a.id_competence = c.id_competence
            GROUP BY c.intitule ORDER BY c.intitule
        """)
        sae_vcod = q("SELECT COUNT(*) n FROM sae WHERE valeur='VCOD'")[0]["n"]
        preuves = q("SELECT COUNT(*) n FROM preuves_sae")[0]["n"]

    total_heures = sum(int(h["total_heures"]) for h in heures)
    ress_total = q("SELECT COUNT(*) n FROM ressource")[0]["n"]

    return jsonify({
        "total_heures": total_heures,
        "heures": heures,
        "sae_vcod": int(sae_vcod),
        "ressources_total": ress_total,
        "preuves_total": int(preuves)
    })

@app.route("/api/top-ressources")
def api_top_ressources():
    s = request.args.get("semestre", type=int)
    if s:
        return jsonify(q("""
            SELECT r.code, r.titre, COUNT(*) n
            FROM sae_ressource sr
            JOIN sae s2 ON s2.id_sae=sr.id_sae AND s2.numero_semestre=?
            JOIN ressource r ON r.id_ressource=sr.id_ressource
            GROUP BY r.code,r.titre ORDER BY n DESC,r.code LIMIT 12
        """, (s,)))
    return jsonify(q("""
        SELECT r.code, r.titre, COUNT(*) n
        FROM sae_ressource sr
        JOIN ressource r ON r.id_ressource=sr.id_ressource
        GROUP BY r.code,r.titre ORDER BY n DESC,r.code LIMIT 12
    """))

@app.route("/api/ressources")
def api_ressources():
    return jsonify(q("""
        SELECT id_ressource, code, titre, description
        FROM ressource
        ORDER BY code
    """))

@app.route("/api/sae")
def api_sae():
    s = request.args.get("semestre", type=int)
    if s:
        return jsonify(q("""
            SELECT id_sae, code, titre, numero_semestre AS semestre, valeur
            FROM sae WHERE numero_semestre=? ORDER BY code
        """, (s,)))
    return jsonify(q("""
        SELECT id_sae, code, titre, numero_semestre AS semestre, valeur
        FROM sae ORDER BY numero_semestre, code
    """))

@app.route("/api/sae/<int:id_sae>")
def api_sae_detail(id_sae):
    sae = q("""SELECT id_sae, code, titre, numero_semestre AS semestre, valeur
               FROM sae WHERE id_sae=?""", (id_sae,))
    if not sae: return jsonify({"error":"not found"}),404
    comp = q("""SELECT sc.id_competence, c.intitule
                FROM sae_competence sc JOIN COMPETENCE c
                ON c.id_competence=sc.id_competence
                WHERE sc.id_sae=? ORDER BY sc.id_competence""", (id_sae,))
    acs  = q("""SELECT a.code, a.intitule
               FROM sae_ac s JOIN AC a ON a.code=s.ac_code
               WHERE s.id_sae=? ORDER BY a.code""", (id_sae,))
    ress = q("""SELECT r.code, r.titre
                FROM sae_ressource sr JOIN ressource r
                ON r.id_ressource=sr.id_ressource
                WHERE sr.id_sae=? ORDER BY r.code""", (id_sae,))
    item = sae[0]; item["competences"]=comp; item["acs"]=acs; item["ressources"]=ress
    return jsonify(item)

@app.route("/api/sae/<int:id_sae>/radar")
def api_sae_radar(id_sae):
    rows = q("""
        SELECT c.intitule AS label,
               COALESCE(MAX(CASE WHEN sc.id_sae IS NOT NULL THEN CAST(sc.niveau_cible AS INTEGER) END),
                        CASE WHEN COUNT(sc.id_competence)>0 THEN 1 ELSE 0 END) AS value
        FROM COMPETENCE c
        LEFT JOIN sae_competence sc
          ON sc.id_competence=c.id_competence AND sc.id_sae=?
        GROUP BY c.intitule ORDER BY c.intitule
    """, (id_sae,))
    return jsonify({"labels":[r["label"] for r in rows],
                    "values":[int(r["value"] or 0) for r in rows]})


if __name__ == "__main__":
    init_tables()
    app.run(debug=True, port=5000)
