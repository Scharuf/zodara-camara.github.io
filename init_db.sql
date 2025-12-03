-- ============================================================
-- SCHÉMA BUT Science des Données - SQLite
-- Fusion des tables et données
-- ============================================================

-- ============================================================
-- SUPPRESSION DES TABLES EXISTANTES (pour réinitialiser la base)
-- ============================================================
DROP TABLE IF EXISTS sae_ressource;
DROP TABLE IF EXISTS sae_ac;
DROP TABLE IF EXISTS sae_competence;
DROP TABLE IF EXISTS preuves_sae;
DROP TABLE IF EXISTS projet;
DROP TABLE IF EXISTS sae;
DROP TABLE IF EXISTS ressource;
DROP TABLE IF EXISTS matiere_competence;
DROP TABLE IF EXISTS matiere_semestre;
DROP TABLE IF EXISTS matiere;
DROP TABLE IF EXISTS semestre;                  --ok
DROP TABLE IF EXISTS AC;                        --ok
DROP TABLE IF EXISTS ACTIVITE_PEDAGOGIQUE;      --ok
DROP TABLE IF EXISTS ANNEE;                     --ok  
DROP TABLE IF EXISTS COMPETENCE;                --ok

-- ============================================================
-- TABLE DES COMPETENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS COMPETENCE (
    id_competence CHAR(2) PRIMARY KEY,
    intitule TEXT NOT NULL,
    description TEXT NOT NULL
);

INSERT OR IGNORE INTO COMPETENCE (id_competence, intitule, description) VALUES
('C1', 'Traiter des données à des fins décisionnelles',
 'En intervenant à toutes les étapes du cycle de vie de la donnée (insertion, modification, extraction, suppression). ' ||
 'En utilisant le modèle de données adapté aux besoins. ' ||
 'En s''inscrivant dans une démarche de documentation des réalisations adaptée au public visé. ' ||
 'En traduisant correctement les demandes métier en programmes, avec le respect du cahier des charges s''il existe. ' ||
 'En écrivant un programme correctement structuré et documenté, respectant les bonnes pratiques. ' ||
 'En identifiant les librairies et langages dédiés.');

INSERT OR IGNORE INTO COMPETENCE (id_competence, intitule, description) VALUES
('C2', 'Analyser statistiquement les données',
 'En tenant compte du contexte de l''étude (économique, socio-démographique, commerciale, clinique…). ' ||
 'En mettant en évidence les grandes tendances et les informations principales. ' ||
 'En identifiant et en mettant en œuvre les techniques adaptées aux attentes du client ou de l’instance décisionnaire. ' ||
 'En identifiant et en mettant en œuvre les techniques adaptées aux données complexes (données massives, données mal structurées, flux de données…). ' ||
 'En tenant compte du contexte inférentiel (variabilité de l’échantillon).');

INSERT OR IGNORE INTO COMPETENCE (id_competence, intitule, description) VALUES
('C3', 'Valoriser une production',
 'En s’adaptant au niveau d’expertise, à la culture et au statut du destinataire. ' ||
 'En s''exprimant correctement, aussi bien en français qu’en anglais, à l''oral comme à l''écrit. ' ||
 'En veillant aux aspects éthiques, déontologiques et réglementaires d’utilisation et de diffusion des données. ' ||
 'En interprétant et contextualisant les résultats (citations, vérification des sources, esprit critique). ' ||
 'En utilisant la forme de restitution adaptée. ' ||
 'En tenant compte des réalités économiques et managériales des entreprises.');

INSERT OR IGNORE INTO COMPETENCE (id_competence, intitule, description) VALUES
('C4', 'Développer un outil décisionnel',
 'En mettant en œuvre une structuration des données adaptée à leurs caractéristiques (type, volume…). ' ||
 'En assurant la qualité des données et minimisant les biais liés à l’incertitude et l’imprécision dans les sources. ' ||
 'En étant sensible aux aspects éthiques, déontologiques et juridiques d’utilisation et de diffusion des données. ' ||
 'En réalisant des solutions de visualisation spécifiques aux données métier. ' ||
 'En intervenant à différents niveaux de la chaîne décisionnelle. ' ||
 'En utilisant des méthodes de développement logiciel.');

-- ============================================================
-- TABLE DES ANNÉES
-- ============================================================
CREATE TABLE IF NOT EXISTS ANNEE (
    id_annee CHAR(4) PRIMARY KEY,
    intitule TEXT NOT NULL
);

INSERT OR IGNORE INTO ANNEE (id_annee, intitule) VALUES
('BUT1', 'Traiter des données structurées / Mettre en œuvre une analyse descriptive / Contextualiser et présenter les données'),
('BUT2', 'Automatiser le traitement de données multidimensionnelles / Mettre en œuvre une analyse exploratoire / Restituer et argumenter ses résultats / Développer un composant d’une solution décisionnelle'),
('BUT3', 'Intégrer le traitement de données complexes / Mettre en œuvre l''analyse exploratoire de données complexes / Intégrer et valoriser sa production dans l''écosystème de l''entreprise / Participer au déploiement d''une solution décisionnelle');

-- ============================================================
-- TABLE ACTIVITE_PEDAGOGIQUE
-- ============================================================
CREATE TABLE IF NOT EXISTS ACTIVITE_PEDAGOGIQUE (
    num INTEGER PRIMARY KEY,
    semestre INTEGER NOT NULL,
    heure INTEGER NOT NULL,
    skill TEXT NOT NULL,
    id_competence CHAR(2) NOT NULL REFERENCES COMPETENCE(id_competence)
);

INSERT OR IGNORE INTO ACTIVITE_PEDAGOGIQUE (num, semestre, heure, skill, id_competence) VALUES

--S1
(1, 1, 30, 'Traiter des données à des fins décisionnelles',              'C1'),
(2, 1, 45, 'Analyser statistiquement les données',                        'C2'),
(3, 1, 45, 'Valoriser une production dans un contexte professionnel',     'C3'),

--S2
(4, 2, 45, 'Traiter des données à des fins décisionnelles',              'C1'),
(5, 2, 40, 'Analyser statistiquement les données',                        'C2'),
(6, 2, 35, 'Valoriser une production dans un contexte professionnel',     'C3'),

--S3
(7,  3, 45, 'Développer un outil décisionnel',                            'C4'),
(8,  3, 45, 'Traiter des données à des fins décisionnelles',              'C1'),
(9,  3, 40, 'Analyser statistiquement les données',                        'C2'),
(10, 3, 25, 'Valoriser une production dans un contexte professionnel',    'C3'),

--S4
(11, 4, 40, 'Développer un outil décisionnel',                            'C4'),
(12, 4, 35, 'Traiter des données à des fins décisionnelles',              'C1'),
(13, 4, 45, 'Analyser statistiquement les données',                        'C2'),
(14, 4, 20, 'Valoriser une production dans un contexte professionnel',    'C3'),

--S5
(15, 5, 45, 'Développer un outil décisionnel',                            'C4'),
(16, 5, 45, 'Traiter des données à des fins décisionnelles',              'C1'),
(17, 5, 40, 'Analyser statistiquement les données',                        'C2'),
(18, 5, 35, 'Valoriser une production dans un contexte professionnel',    'C3'),

--S6
(19, 6, 30, 'Développer un outil décisionnel',                            'C4'),
(20, 6, 45, 'Traiter des données à des fins décisionnelles',              'C1'),
(21, 6, 35, 'Analyser statistiquement les données',                        'C2'),
(22, 6, 40, 'Valoriser une production dans un contexte professionnel',    'C3');

-- ============================================================
-- TABLE AC (Apprentissage Critiques)
-- ============================================================
CREATE TABLE IF NOT EXISTS AC (
    code VARCHAR(30) PRIMARY KEY,
    intitule TEXT NOT NULL,
    description TEXT,
    id_competence CHAR(2) NOT NULL REFERENCES COMPETENCE(id_competence)
);
INSERT OR IGNORE INTO AC (code, intitule, description, id_competence) VALUES
-- AC11
('AC11.01','Interpréter et prendre en compte le besoin du client', NULL,'C1'),
('AC11.02','Respecter les formalismes de notation', NULL,'C1'),
('AC11.03','Connaître la syntaxe des langages et savoir l’utiliser', NULL,'C1'),
('AC11.04','Maîtriser la structure des données à exploiter (importance)', NULL,'C1'),
('AC11.05','Comprendre les structures algorithmiques de base', NULL,'C1'),
('AC11.06','Prendre conscience de l’intérêt de la programmation', NULL,'C1'),
-- AC12
('AC12.01','Réaliser que les sources de données ont des caractéristiques propres à considérer', NULL,'C2'),
('AC12.02','Comprendre qu’une analyse correcte ne peut émaner que de données propres et préparées', NULL,'C2'),
('AC12.03','Comprendre l’intérêt des synthèses numériques et graphiques pour décrire une variable statistique', NULL,'C2'),
('AC12.04','Comprendre l’intérêt des synthèses numériques et graphiques pour mettre en évidence des liaisons entre variables.', NULL,'C2'),
('AC12.05','Comprendre l''intérêt de l’utilisation d’un modèle probabiliste', NULL,'C2'),
('AC12.06','Appréhender la notion de fluctuation d''échantillonnage, notamment à l’aide de simulations probabilistes', NULL,'C2'),
-- AC13
('AC13.01','Prendre connaissance des biais rencontrés dans la mise en place d’une enquête', NULL,'C3'),
('AC13.02','Identifier l’importance de contextualiser ses données', NULL,'C3'),
('AC13.03','Mesurer l’importance de mettre en évidence des résultats clés par l’utilisation d’indicateurs pertinents', NULL,'C3'),
('AC13.04','Lors de la restitution des résultats, mesurer l’importance d’expliciter également la démarche suivie', NULL,'C3'),
('AC13.05','Comprendre les intérêts de la data visualisation et de l’infographie', NULL,'C3'),
('AC13.06','Mesurer l’importance d’une expression précise et nuancée dans la communication en français et dans une langue étrangère des résultats', NULL,'C3'),
('AC24.01','Comprendre le rôle fondamental de l’analyse des besoins et de l’existant dans un projet décisionnel', NULL,'C3'),
('AC24.02','Percevoir les enjeux de l’automatisation et de l’interopérabilité d’un ensemble de tâches', NULL,'C3'),
('AC24.03','Prendre conscience des différences entre outils (logiciels, langages) pour choisir le plus adapté', NULL,'C3'),
('AC24.04','Comprendre le cycle de vie d’un projet informatique', NULL,'C3'),
-- AC24
('AC41.01', 'Comprendre l’organisation des données de l’entreprise', NULL,'C4'),
('AC41.02', 'Réaliser le rôle central et spécifique de l’entrepôt de données dans la chaine décisionnelle',NULL, 'C4'),
('AC41.03', 'Identifier et résoudre les problèmes d’intégration de sources complémentaires et hétérogènes', NULL,'C4'),
('AC41.04', 'Comprendre la nécessité de tester, corriger et documenter un programme', NULL, 'C4'),
('AC41.05', 'Apprécier l’intérêt de briques logicielles existantes et savoir les utiliser', NULL,'C4'),
('AC43.01', 'Saisir l’intérêt de mobiliser de manière proactive des ressources métiers liées à l’environnement', NULL,'C4'),
('AC43.02', 'Savoir défendre ses choix d’analyses', NULL,'C4'),
('AC43.03', 'Saisir la nécessité de choisir des indicateurs pertinents pour communiquer sur les résultats', NULL,'C4'),
('AC43.04', 'Prendre conscience de la rigueur requise dans ses productions et dans la communication à leur propos', NULL,'C4'),
('AC44.01', 'Comprendre le rôle fondamental de l’analyse des besoins et de l’existant dans un projet décisionnel', NULL,'C4'),
('AC44.02', 'Percevoir les enjeux de l’automatisation et de l’interopérabilité d’un ensemble de tâches', NULL,'C4'),
('AC44.03', 'Prendre conscience des différences entre outils (logiciels, langages) pour choisir le plus adapté', NULL,'C4'),
('AC44.04', 'Comprendre le cycle de vie d’un projet informatique', NULL,'C4');
-- AC21
INSERT OR IGNORE INTO AC (code, intitule, description, id_competence) VALUES
('AC21.01','Comprendre l’organisation des données de l’entreprise',NULL,'C4'),
('AC21.03','Identifier et résoudre les problèmes d’intégration de sources complémentaires et hétérogènes',NULL,'C4'),
('AC21.05','Apprécier l’intérêt de briques logicielles existantes et savoir les utiliser',NULL,'C4'),
('AC21.06','Comprendre la nécessité de tester, corriger et documenter un programme',NULL,'C4');
-- AC23
INSERT OR IGNORE INTO AC (code, intitule, description, id_competence) VALUES
('AC23.01','Saisir l’intérêt de mobiliser de manière proactive des ressources métiers liées à l’environnement',NULL,'C4'),
('AC23.02','Savoir défendre ses choix d’analyses',NULL,'C4');

-- AC21 : organisation / entrepôt de données (liés à C4)
INSERT OR IGNORE INTO AC (code, intitule, description, id_competence) VALUES
('AC21.01','Comprendre l’organisation des données de l’entreprise',NULL,'C4'),
('AC21.02','Réaliser le rôle central et spécifique de l’entrepôt de données dans la chaîne décisionnelle',NULL,'C4'),
('AC21.03','Identifier et résoudre les problèmes d’intégration de sources complémentaires et hétérogènes',NULL,'C4'),
('AC21.04','Comprendre la nécessité de tester, corriger et documenter un programme',NULL,'C4'),
('AC21.05','Apprécier l’intérêt de briques logicielles existantes et savoir les utiliser',NULL,'C4'),
('AC21.06','Apprécier les limites de validité et les conditions d’application d’une analyse',NULL,'C4');

-- AC22 : séries temporelles (C2)
INSERT OR IGNORE INTO AC (code, intitule, description, id_competence) VALUES
('AC22.01','Prendre conscience de la différence entre modélisation statistique et analyse exploratoire',NULL,'C2'),
('AC22.02','Saisir la spécificité de l’analyse des données temporelles ou chronologiques',NULL,'C2'),
('AC22.05','Apprécier les limites de validité des modèles utilisés',NULL,'C2');

-- AC23 : communication / restitution (C3)
INSERT OR IGNORE INTO AC (code, intitule, description, id_competence) VALUES
('AC23.01','Saisir l’intérêt de mobiliser de manière proactive des ressources métiers liées à l’environnement',NULL,'C3'),
('AC23.02','Savoir défendre ses choix d’analyses',NULL,'C3'),
('AC23.03','Saisir la nécessité de choisir des indicateurs pertinents pour communiquer sur les résultats',NULL,'C3'),
('AC23.04','Prendre conscience de la rigueur requise dans ses productions et dans la communication à leur propos',NULL,'C3');

-- AC25 : relations en milieu professionnel (C3)
INSERT OR IGNORE INTO AC (code, intitule, description, id_competence) VALUES
('AC25.01','Comprendre les enjeux des relations en milieu professionnel adaptées à l’interlocuteur et à sa culture',NULL,'C3');

INSERT OR IGNORE INTO AC (code, intitule, description, id_competence) VALUES
('AC31.02', 'Spécificités des données complexes', NULL, 'C3'),
('AC31.03', 'Mener une veille technologique', NULL, 'C3'),
('AC32.02', 'Importance de la mise en œuvre de méthodes adaptées', NULL, 'C3'),
('AC33.01', 'Savoir transformer la donnée', NULL, 'C3'),
('AC33.02', 'Mesurer l’impact du RGPD', NULL, 'C3'),
('AC33.03', 'Identifier les formes de bonne communication', NULL, 'C3'),
('AC33.04', 'Comprendre les mécanismes de base de l’IA', NULL, 'C3'),
('AC33.05', 'Être force de proposition', NULL, 'C3'),
('AC34.01','Prendre conscience de la nécessité de différencier les interlocuteurs',NULL,'C4'),
('AC34.02','Défendre ses choix de solution',NULL,'C4'),
('AC34.03','Réaliser l’intérêt d’appliquer des méthodes de développement',NULL,'C4'),
('AC34.04','Apprécier l’intérêt du gestionnaire de versions',NULL,'C4');



INSERT OR IGNORE INTO AC (code, intitule, description, id_competence) VALUES
('AC52.01' , 'Prendre conscience des différences entre des outils statistiques pour choisir le plus adapté', NULL, 'C4'),
('AC52.02', 'Prendre conscience des différences entre des outils statistiques pour choisir le plus adapté', NULL, 'C3'),
('AC52.03', 'Saisir l’importance de la mise en œuvre de méthodes adaptées à des domaines et des données spécifiques(Marketing, Biostatistique, Statistique spatiale, Gestion', NULL, 'C4'),
('AC52.04', 'Comprendre les mécanismes de bases de l’intelligence artificielle (apprentissage statistique supervisé, échan-tillons d’apprentissage et échantillons de test', NULL, 'C3'),
('AC53.01', 'Mesurer l’impact d’un respect de la législation en terme de droit des données', NULL, 'C3'),
('AC53.02', 'Identifier les clés d’une bonne communication (procédures et techniques utilisées)', NULL, 'C4'),
('AC53.03', 'Mesurer l’importance de comprendre et de répondre à l’ensemble des problématiques posées', NULL, 'C4'),
('AC53.04', 'Être force de proposition', NULL, 'C4');


INSERT OR IGNORE INTO AC (code, intitule, description, id_competence) VALUES
('AC61.01', 'Identifier les solutions technologiques permettant la collecte et la diffusion de données', NULL, 'C3'),
('AC61.02', 'Comprendre les spécificités des données complexes et de leur exploitation', NULL, 'C4'),
('AC61.03', 'Savoir mener une veille technologique', NULL, 'C2'),
('AC62.01', 'Prendre conscience des différences entre des outils statistiques pour choisir le plus adapté', NULL, 'C1'),
('AC62.02', 'Saisir l’importance de la mise en œuvre de méthodes adaptées à des domaines et des données spécifiques marketing, Biostatistique, Statistique spatiale, Gestion ', NULL, 'C4'),
('AC63.01', 'Savoir transformer la donnée pour la mettre en conformité avec des normes (anonymisation, normalisation', NULL, 'C1'),
('AC63.02', 'Mesurer l’impact d’un respect de la législation en terme de droit des données', NULL, 'C2'),
('AC63.03', 'Identifier les clés d’une bonne communication (procédures et techniques utilisées', NULL, 'C3'),
('AC63.04', 'Mesurer l’importance de comprendre et de répondre à l’ensemble des problématiques posées', NULL, 'C4'),
('AC63.05', 'Être force de proposition', NULL, 'C4'),
('AC63.06', 'Prendre conscience de la nécessité d’intégrer la vision de l’interlocuteur (transversalité, international, multiculture, niveau d’expertise', NULL, 'C1') ,
('AC64.01', 'Prendre conscience de la nécessité d’utiliser des moyens specifiques pour exploiter les Big data ou les flux de données',  NULL, 'C1'),
('AC64.02', 'Défendre ses choix de solution par un argumentaire éclairé', NULL, 'C4'),
('AC64.03', 'Réaliser l’intérêt d’appliquer les méthodes de développement dans la réalisation un projet informatique', NULL, 'C4'),
('AC64.04', 'Apprécier l’intérêt de l’utilisation d’un gestionnaire de versions de code ', NULL, 'C4');




-- ============================================================
-- TABLE semestre
-- ============================================================

CREATE TABLE IF NOT EXISTS semestre (
  numero         INTEGER PRIMARY KEY CHECK (numero BETWEEN 1 AND 6),
  heures_totales INTEGER
);

INSERT OR IGNORE INTO semestre (numero, heures_totales) VALUES
(1,400),(2,380),(3,400),(4,200),(5,300),(6,150);

CREATE TABLE IF NOT EXISTS matiere (
  id_matiere   INTEGER PRIMARY KEY AUTOINCREMENT,
  code         TEXT UNIQUE,
  libelle      TEXT NOT NULL,
  description  TEXT
);
--INSERT OR IGNORE INTO matiere(code; libelle)

CREATE TABLE IF NOT EXISTS matiere_semestre (
  id_matiere      INTEGER NOT NULL REFERENCES matiere(id_matiere) ON DELETE CASCADE,
  numero_semestre INTEGER NOT NULL REFERENCES semestre(numero) ON DELETE CASCADE,
  nb_heures       INTEGER NOT NULL,
  is_tp           INTEGER DEFAULT 0,              -- 0/1
  PRIMARY KEY (id_matiere, numero_semestre, is_tp)
);


CREATE TABLE IF NOT EXISTS matiere_competence (
  id_matiere      INTEGER NOT NULL REFERENCES matiere(id_matiere) ON DELETE CASCADE,
  id_competence   CHAR(2) NOT NULL REFERENCES COMPETENCE(id_competence) ON DELETE CASCADE,
  PRIMARY KEY (id_matiere, id_competence)
);

CREATE TABLE IF NOT EXISTS ressource (
  id_ressource INTEGER PRIMARY KEY AUTOINCREMENT,
  code         TEXT UNIQUE NOT NULL,
  titre        TEXT NOT NULL,
  description  TEXT
);

INSERT OR IGNORE INTO ressource (code, titre, description) VALUES
-- Semestre 1
('R1.01', 'Tableur et reporting', 'Création de formules, graphiques, TCD, reporting'),
('R1.02', 'Bases de données relationnelles 1', 'SGBD relationnel, SQL, modèle relationnel'),
('R1.03', 'Bases de la programmation 1', NULL),
('R1.04', 'Statistique descriptive 1', NULL),
('R1.05', 'Probabilités 1', NULL),
('R1.06', 'Mathématiques - analyse', NULL),
('R1.07', 'Initiation à l’anglais de spécialité', NULL),
('R1.08', 'Communication de l’information et recherche documentaire', NULL),
('R1.09', 'Découverte des données de l’environnement territorial et économique', NULL),
('R1.10', 'Projet Personnel et Professionnel 1', 'PPP 1'),

-- Semestre 2
('R2.01', 'Reporting et Datavisualisation', NULL),
('R2.02', 'Bases de données relationnelles 2', NULL),
('R2.03', 'Bases de la programmation 2', NULL),
('R2.04', 'Programmation statistique 2', NULL),
('R2.05', 'Statistique descriptive 2', NULL),
('R2.06', 'Probabilités 2', NULL),
('R2.07', 'Bases de l’algèbre', NULL),
('R2.08', 'Statistique inférentielle', NULL),
('R2.09', 'Approfondissement de l’anglais de spécialité', NULL),
('R2.10', 'Communication et sémiologie', NULL),
('R2.11', 'Étude des données de l’environnement entrepreneurial et économique', NULL),
('R2.12', 'Projet Personnel et Professionnel 2', 'PPP 2'),

-- Semestre 3
('R3.01', 'Utilisation avancée d’outils de reporting', NULL),
('R3.02', 'Systèmes d’information décisionnels', NULL),
('R3.03', 'Technologies web', NULL),
('R3.04', 'Programmation statistique automatisée', NULL),
('R3.05', 'Algèbre linéaire', NULL),
('R3.06', 'Tests d’hypothèses pour analyses bivariées', NULL),
('R3.07', 'Anglais professionnel', NULL),
('R3.08', 'Communication professionnelle', NULL),
('R3.09', 'Les données de l’environnement entrepreneurial et économique pour l’aide à la décision', NULL),
('R3.10', 'Programmation objet', NULL),
('R3.11', 'Projet Personnel et Professionnel 3', 'PPP 3'),

-- Semestre 4
('R4.01', 'Automatisation et test en programmation', NULL),
('R4.02', 'Méthodes factorielles', NULL),
('R4.03', 'Classification automatique', NULL),
('R4.04', 'Anglais scientifique et argumentation', NULL),
('R4.05', 'Communication scientifique et argumentation', NULL),
('R4.06', 'Exploration et valorisation de données dans un cadre juridique et économique', NULL),
('R4.07', 'Projet Personnel et Professionnel 4', 'PPP 4'),
('R4.08', 'Préparation/intégration de données', NULL),
('R4.09', 'Programmation web', NULL),

-- Semestre 5
('R5.01', 'Bases de données NoSQL', NULL),
('R5.02', 'Data mining', NULL),
('R5.03', 'Anglais pour la coopération internationale et l’écrit international des données', NULL),
('R5.04', 'Communication des données, éthique et responsabilités', NULL),
('R5.05', 'Projet Personnel et Professionnel 5', 'PPP 5'),
('R5.06', 'Développement logiciel', NULL),
('R5.07', 'Programmation web pour la visualisation', NULL),

-- Semestre 6
('R6.01', 'Big Data : enjeux, stockage et extraction', NULL),
('R6.02', 'Méthodes statistiques pour le Big Data', NULL),
('R6.03', 'Anglais pour la communication d’entreprise', NULL),
('R6.04', 'Communication pour le management', NULL),
('R6.05', 'Approfondissement en Big Data', NULL);

CREATE TABLE IF NOT EXISTS sae (
  id_sae          INTEGER PRIMARY KEY AUTOINCREMENT,
  code            TEXT UNIQUE NOT NULL,              -- ex : 'SAÉ 1.01'
  titre           TEXT NOT NULL,
  numero_semestre INTEGER REFERENCES semestre(numero),
  valeur          TEXT                               -- ex : 'VCOD' si besoin
);

INSERT OR IGNORE INTO sae (code, titre, numero_semestre, valeur) VALUES
-- Semestre 1
('SAÉ 1.01', 'Reporting à partir de données stockées dans un SGBD relationnel',   1, 'VCOD'),
('SAÉ 1.02', 'Écriture et lecture de fichiers de données',                        1, 'VCOD'),
('SAÉ 1.03', 'Préparation et synthèse d’une analyse (statistique) simple',        1, 'VCOD'),
('SAÉ 1.04', 'Apprendre en situation professionnelle ou production de données en entreprise', 1, 'VCOD'),
('SAÉ 1.05', 'Présentation en anglais d’un territoire économique et culturel',    1, 'VCOD'),
('SAÉ 1.06', 'Mise en œuvre d’une enquête',                                       1, 'VCOD'),

-- Semestre 2
('SAÉ 2.01', 'Conception et implémentation d’une base de données',                2, 'VCOD'),
('SAÉ 2.02', 'Estimation par échantillonnage',                                    2, 'VCOD'),
('SAÉ 2.03', 'Régression sur données réelles',                                    2, 'VCOD'),
('SAÉ 2.04', 'Datavisualisation',                                                 2, 'VCOD'),
('SAÉ 2.05', 'Construction et présentation d’indicateurs de performance',         2,'VCOD'),
('SAÉ 2.06', 'Analyse de données, reporting et datavisualisation',                2, 'VCOD'),

-- Semestre 3 (VCOD)
('SAÉ 3.01', 'Collecte automatisée de données web',                               3, 'VCOD'),
('SAÉ 3.02', 'Intégration de données dans un datawarehouse',                      3, 'VCOD'),
('SAÉ 3.03', 'Description et prévision de données temporelles',                   3, 'VCOD'),
('SAÉ 3.04', 'Conformité réglementaire pour traiter des données',                 3, 'VCOD'),

-- Semestre 4 (VCOD)
('SAÉ 4.01', 'Développement d’un composant d’une solution décisionnelle',         4, 'VCOD'),
('SAÉ 4.02', 'Reporting d’une analyse multivariée',                               4, 'VCOD'),

-- Semestre 5 (VCOD)
('SAÉ 5.01', 'Analyse et conception d’un outil décisionnel',                      5, 'VCOD'),
('SAÉ 5.02', 'Migration de données vers ou depuis un environnement NoSQL',        5, 'VCOD'),
('SAÉ 5.03', 'Mise en œuvre d’un processus de Datamining',                        5, 'VCOD'),

-- Semestre 6 (VCOD)
('SAÉ 6.01', 'Développement et test d’un outil décisionnel',                      6, 'VCOD');

CREATE TABLE IF NOT EXISTS projet (
  id_projet        INTEGER PRIMARY KEY AUTOINCREMENT,
  id_sae           INTEGER REFERENCES sae(id_sae) ON DELETE SET NULL,
  titre            TEXT NOT NULL,
  resume           TEXT,
  stack            TEXT,
  lien_demo        TEXT,
  lien_code        TEXT,
  date_realisation DATE
);


CREATE TABLE IF NOT EXISTS preuves_sae (
  id_preuve    INTEGER PRIMARY KEY AUTOINCREMENT,
  id_sae       INTEGER NOT NULL REFERENCES sae(id_sae) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  titre        TEXT NOT NULL,
  url          TEXT,
  chemin_local TEXT,
  description  TEXT,
  date_ajout   TEXT DEFAULT (datetime('now'))
);


CREATE TABLE IF NOT EXISTS sae_competence (
  id_sae         INTEGER NOT NULL REFERENCES sae(id_sae) ON DELETE CASCADE,
  id_competence  CHAR(2) NOT NULL REFERENCES COMPETENCE(id_competence) ON DELETE CASCADE,
  niveau_cible   TEXT,
  PRIMARY KEY (id_sae, id_competence)
);

-- =================
-- SAE <-> AC (code)
-- =================
CREATE TABLE IF NOT EXISTS sae_ac (
  id_sae  INTEGER NOT NULL REFERENCES sae(id_sae) ON DELETE CASCADE,
  ac_code VARCHAR(30) NOT NULL REFERENCES AC(code) ON DELETE CASCADE,
  PRIMARY KEY (id_sae, ac_code)
);

-- =====================
-- SAE <-> RESSOURCE
-- =====================
CREATE TABLE IF NOT EXISTS sae_ressource (
  id_sae       INTEGER NOT NULL REFERENCES sae(id_sae) ON DELETE CASCADE,
  id_ressource INTEGER NOT NULL REFERENCES ressource(id_ressource) ON DELETE CASCADE,
  PRIMARY KEY (id_sae, id_ressource)
);

-- ===========================
-- Vue récapitulatif des SAÉ
-- ===========================
CREATE VIEW IF NOT EXISTS v_sae_resume AS
WITH comp AS (
  SELECT s.id_sae, GROUP_CONCAT(DISTINCT sc.id_competence, ', ') AS competences
  FROM sae s LEFT JOIN sae_competence sc ON sc.id_sae = s.id_sae
  GROUP BY s.id_sae
),
acs AS (
  SELECT s.id_sae, GROUP_CONCAT(DISTINCT sa.ac_code, ', ') AS acs
  FROM sae s LEFT JOIN sae_ac sa ON sa.id_sae = s.id_sae
  GROUP BY s.id_sae
),
ress AS (
  SELECT s.id_sae, GROUP_CONCAT(DISTINCT r.code, ', ') AS ressources
  FROM sae s LEFT JOIN sae_ressource sr ON sr.id_sae = s.id_sae
             LEFT JOIN ressource r ON r.id_ressource = sr.id_ressource
  GROUP BY s.id_sae
)
SELECT s.id_sae, s.code, s.titre, s.numero_semestre AS semestre,
       comp.competences, acs.acs, ress.ressources
FROM sae s
LEFT JOIN comp  ON comp.id_sae = s.id_sae
LEFT JOIN acs   ON acs.id_sae  = s.id_sae
LEFT JOIN ress  ON ress.id_sae = s.id_sae;

---isertion
/* ============================================================
   LIENS POUR SAÉ 1.01 : Reporting à partir de données stockées
   dans un SGBD relationnel
   ============================================================ */

-- 1) Compétence ciblée : C1
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
SELECT s.id_sae, 'C1', '2'      -- tu peux ajuster le niveau_cible (1,2,3…)
FROM sae s
WHERE s.code = 'SAÉ 1.01';

-- 2) Apprentissages critiques (AC) associés
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.01'
FROM sae s
WHERE s.code = 'SAÉ 1.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.02'
FROM sae s
WHERE s.code = 'SAÉ 1.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.03'
FROM sae s
WHERE s.code = 'SAÉ 1.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.04'
FROM sae s
WHERE s.code = 'SAÉ 1.01';

-- 3) Ressources mobilisées : R1.01, R1.02, R1.10
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code IN ('R1.01','R1.02','R1.10')
WHERE s.code = 'SAÉ 1.01';

/* ============================================================
   LIENS POUR SAÉ 1.02 : Écriture et lecture de fichiers de données
   ============================================================ */

-- 1) Compétence ciblée : C1
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
SELECT s.id_sae, 'C1', '2'      -- tu peux adapter le niveau_cible
FROM sae s
WHERE s.code = 'SAÉ 1.02';

-- 2) Apprentissages critiques (AC11.01 à AC11.06)
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.01'
FROM sae s
WHERE s.code = 'SAÉ 1.02';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.02'
FROM sae s
WHERE s.code = 'SAÉ 1.02';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.03'
FROM sae s
WHERE s.code = 'SAÉ 1.02';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.04'
FROM sae s
WHERE s.code = 'SAÉ 1.02';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.05'
FROM sae s
WHERE s.code = 'SAÉ 1.02';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.06'
FROM sae s
WHERE s.code = 'SAÉ 1.02';

-- 3) Ressources mobilisées : R1.03, R1.10
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code IN ('R1.03','R1.10')
WHERE s.code = 'SAÉ 1.02';

/* ============================================================
   LIENS POUR SAÉ 1.03 : Préparation et synthèse d’un tableau de données
   ============================================================ */

-- 1) Compétence ciblée : C2
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
SELECT s.id_sae, 'C2', '2'   -- adapte le niveau_cible si besoin
FROM sae s
WHERE s.code = 'SAÉ 1.03';

-- 2) Apprentissages critiques (AC12.01 à AC12.04)
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC12.01'
FROM sae s
WHERE s.code = 'SAÉ 1.03';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC12.02'
FROM sae s
WHERE s.code = 'SAÉ 1.03';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC12.03'
FROM sae s
WHERE s.code = 'SAÉ 1.03';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC12.04'
FROM sae s
WHERE s.code = 'SAÉ 1.03';

-- 3) Ressources mobilisées : R1.04, R1.10
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code IN ('R1.04','R1.10')
WHERE s.code = 'SAÉ 1.03';

/* ============================================================
   LIENS POUR SAÉ 1.04 : Apprendre en situation la production de données en entreprise
   ============================================================ */

-- 1) Compétence ciblée : C3
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
SELECT s.id_sae, 'C3', '1'
FROM sae s
WHERE s.code = 'SAÉ 1.04';

-- 2) AC associées : AC13.02, AC13.03, AC13.04
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC13.02'
FROM sae s
WHERE s.code = 'SAÉ 1.04';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC13.03'
FROM sae s
WHERE s.code = 'SAÉ 1.04';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC13.04'
FROM sae s
WHERE s.code = 'SAÉ 1.04';

-- 3) Ressources mobilisées : R1.09, R1.10
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code IN ('R1.09','R1.10')
WHERE s.code = 'SAÉ 1.04';

/* ============================================================
   LIENS POUR SAÉ 1.05 : Présentation en anglais d’un territoire économique et culturel
   ============================================================ */

-- 1) Compétence ciblée : C3
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
SELECT s.id_sae, 'C3', '1'
FROM sae s
WHERE s.code = 'SAÉ 1.05';

-- 2) AC associées : AC13.04, AC13.06
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC13.04'
FROM sae s
WHERE s.code = 'SAÉ 1.05';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC13.06'
FROM sae s
WHERE s.code = 'SAÉ 1.05';

-- 3) Ressources mobilisées : R1.07, R1.08, R1.09, R1.10
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R1.07'
WHERE s.code = 'SAÉ 1.05';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R1.08'
WHERE s.code = 'SAÉ 1.05';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R1.09'
WHERE s.code = 'SAÉ 1.05';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R1.10'
WHERE s.code = 'SAÉ 1.05';

/* ============================================================
   LIENS POUR SAÉ 1.06 : Mise en œuvre d’une enquête
   ============================================================ */

-- 1) Compétence ciblée : C3
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
SELECT s.id_sae, 'C3', '1'
FROM sae s
WHERE s.code = 'SAÉ 1.06';

-- 2) AC associées : AC13.01 → AC13.06
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC13.01'
FROM sae s
WHERE s.code = 'SAÉ 1.06';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC13.02'
FROM sae s
WHERE s.code = 'SAÉ 1.06';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC13.03'
FROM sae s
WHERE s.code = 'SAÉ 1.06';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC13.04'
FROM sae s
WHERE s.code = 'SAÉ 1.06';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC13.05'
FROM sae s
WHERE s.code = 'SAÉ 1.06';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC13.06'
FROM sae s
WHERE s.code = 'SAÉ 1.06';

-- 3) Ressources mobilisées : R1.08, R1.09, R1.10
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R1.08'
WHERE s.code = 'SAÉ 1.06';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R1.09'
WHERE s.code = 'SAÉ 1.06';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R1.10'
WHERE s.code = 'SAÉ 1.06';

/* ============================================================
   LIENS POUR SAÉ 2.01 : Conception et implémentation d’une base de données
   ============================================================ */

-- 1) Compétence ciblée : C1
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
SELECT s.id_sae, 'C1', '2'
FROM sae s
WHERE s.code = 'SAÉ 2.01';

-- 2) AC associées : AC11.01 → AC11.06
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.01' FROM sae s WHERE s.code = 'SAÉ 2.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.02' FROM sae s WHERE s.code = 'SAÉ 2.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.03' FROM sae s WHERE s.code = 'SAÉ 2.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.04' FROM sae s WHERE s.code = 'SAÉ 2.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.05' FROM sae s WHERE s.code = 'SAÉ 2.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC11.06' FROM sae s WHERE s.code = 'SAÉ 2.01';

-- 3) Ressources mobilisées : R2.01, R2.02, R2.03, R2.12
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R2.01'
WHERE s.code = 'SAÉ 2.01';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R2.02'
WHERE s.code = 'SAÉ 2.01';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R2.03'
WHERE s.code = 'SAÉ 2.01';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R2.12'
WHERE s.code = 'SAÉ 2.01';

/* ============================================================
   LIENS POUR SAÉ 2.02 : Estimation par échantillonnage
   ============================================================ */

-- 1) Compétence ciblée : C2
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
SELECT s.id_sae, 'C2', '2'
FROM sae s
WHERE s.code = 'SAÉ 2.02';

-- 2) AC associées : AC12.01, AC12.02, AC12.05, AC12.06
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC12.01'
FROM sae s
WHERE s.code = 'SAÉ 2.02';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC12.02'
FROM sae s
WHERE s.code = 'SAÉ 2.02';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC12.05'
FROM sae s
WHERE s.code = 'SAÉ 2.02';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC12.06'
FROM sae s
WHERE s.code = 'SAÉ 2.02';

-- 3) Ressources mobilisées : R2.06, R2.08, R2.12
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R2.06'
WHERE s.code = 'SAÉ 2.02';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R2.08'
WHERE s.code = 'SAÉ 2.02';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R2.12'
WHERE s.code = 'SAÉ 2.02';

/* ============================================================
   LIENS POUR SAÉ 2.03 : Régression sur données réelles
   ============================================================ */

-- 1) Compétence ciblée : C2
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
SELECT s.id_sae, 'C2', '2'
FROM sae s
WHERE s.code = 'SAÉ 2.03';

-- 2) AC associées : AC12.03, AC12.04
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC12.03'
FROM sae s
WHERE s.code = 'SAÉ 2.03';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT s.id_sae, 'AC12.04'
FROM sae s
WHERE s.code = 'SAÉ 2.03';

-- 3) Ressources mobilisées : R2.04, R2.05, R2.12
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R2.04'
WHERE s.code = 'SAÉ 2.03';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R2.05'
WHERE s.code = 'SAÉ 2.03';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s
JOIN ressource r ON r.code = 'R2.12'
WHERE s.code = 'SAÉ 2.03';

/* ============================================================
   LIENS POUR SAÉ 2.04 : Datavisualisation
   ============================================================ */

-- Compétences associées : C1, C2, C3
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
SELECT id_sae, 'C1', '2' FROM sae WHERE code = 'SAÉ 2.04';

INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
SELECT id_sae, 'C2', '2' FROM sae WHERE code = 'SAÉ 2.04';

INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
SELECT id_sae, 'C3', '2' FROM sae WHERE code = 'SAÉ 2.04';


-- AC associées
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC11.01' FROM sae WHERE code = 'SAÉ 2.04';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC11.04' FROM sae WHERE code = 'SAÉ 2.04';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC12.02' FROM sae WHERE code = 'SAÉ 2.04';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC12.03' FROM sae WHERE code = 'SAÉ 2.04';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC12.04' FROM sae WHERE code = 'SAÉ 2.04';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC13.02' FROM sae WHERE code = 'SAÉ 2.04';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC13.05' FROM sae WHERE code = 'SAÉ 2.04';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC13.06' FROM sae WHERE code = 'SAÉ 2.04';


-- Ressources mobilisées : R2.01, R2.05, R2.10, R2.12
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s JOIN ressource r ON r.code = 'R2.01'
WHERE s.code = 'SAÉ 2.04';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s JOIN ressource r ON r.code = 'R2.05'
WHERE s.code = 'SAÉ 2.04';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s JOIN ressource r ON r.code = 'R2.10'
WHERE s.code = 'SAÉ 2.04';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s JOIN ressource r ON r.code = 'R2.12'
WHERE s.code = 'SAÉ 2.04';
/* ============================================================
   LIENS POUR SAÉ 2.05 : Construction et présentation d’indicateurs de performance
   ============================================================ */

-- Compétence associée : C3
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
SELECT id_sae, 'C3', '2' FROM sae WHERE code = 'SAÉ 2.05';


-- AC associées (AC13.xx)
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC13.02' FROM sae WHERE code = 'SAÉ 2.05';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC13.03' FROM sae WHERE code = 'SAÉ 2.05';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC13.04' FROM sae WHERE code = 'SAÉ 2.05';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC13.05' FROM sae WHERE code = 'SAÉ 2.05';


-- Ressources mobilisées : R2.11 et R2.12
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s JOIN ressource r ON r.code = 'R2.11'
WHERE s.code = 'SAÉ 2.05';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s JOIN ressource r ON r.code = 'R2.12'
WHERE s.code = 'SAÉ 2.05';
-- ============================================================
-- LIENS POUR SAÉ 2.06 – Analyse de données, reporting et datavisualisation
-- ============================================================

-- Compétences ciblées : C1, C2, C3
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C1' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C2' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C3' FROM sae WHERE code = 'SAÉ 2.06';

-- AC mobilisées : quasiment tout AC11, AC12, AC13
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC11.01' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC11.02' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC11.03' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC11.04' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC11.05' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC11.06' FROM sae WHERE code = 'SAÉ 2.06';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC12.01' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC12.02' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC12.03' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC12.04' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC12.05' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC12.06' FROM sae WHERE code = 'SAÉ 2.06';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC13.01' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC13.02' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC13.03' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC13.04' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC13.05' FROM sae WHERE code = 'SAÉ 2.06';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC13.06' FROM sae WHERE code = 'SAÉ 2.06';

-- Ressources utilisées :
-- R2.01, R2.02, R2.03, R2.04, R2.05, R2.06, R2.08, R2.09, R2.10, R2.11, R2.12
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R2.01'
  WHERE s.code = 'SAÉ 2.06';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R2.02'
  WHERE s.code = 'SAÉ 2.06';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R2.03'
  WHERE s.code = 'SAÉ 2.06';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R2.04'
  WHERE s.code = 'SAÉ 2.06';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R2.05'
  WHERE s.code = 'SAÉ 2.06';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R2.06'
  WHERE s.code = 'SAÉ 2.06';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R2.08'
  WHERE s.code = 'SAÉ 2.06';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R2.09'
  WHERE s.code = 'SAÉ 2.06';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R2.10'
  WHERE s.code = 'SAÉ 2.06';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R2.11'
  WHERE s.code = 'SAÉ 2.06';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R2.12'
  WHERE s.code = 'SAÉ 2.06';

/* =======================
   Liaisons pour SAÉ 3.01
   ======================= */

-- Compétences (C3, C1, C2, C4)
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
SELECT id_sae, 'C3' FROM sae WHERE code = 'SAÉ 3.01';

INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
SELECT id_sae, 'C1' FROM sae WHERE code = 'SAÉ 3.01';

INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
SELECT id_sae, 'C2' FROM sae WHERE code = 'SAÉ 3.01';

INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
SELECT id_sae, 'C4' FROM sae WHERE code = 'SAÉ 3.01';

-- AC associées
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC21.01' FROM sae WHERE code = 'SAÉ 3.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC21.03' FROM sae WHERE code = 'SAÉ 3.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC21.05' FROM sae WHERE code = 'SAÉ 3.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC21.06' FROM sae WHERE code = 'SAÉ 3.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC23.01' FROM sae WHERE code = 'SAÉ 3.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC23.02' FROM sae WHERE code = 'SAÉ 3.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC24.01' FROM sae WHERE code = 'SAÉ 3.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC24.02' FROM sae WHERE code = 'SAÉ 3.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC24.03' FROM sae WHERE code = 'SAÉ 3.01';

-- Ressources associées
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s, ressource r
WHERE s.code = 'SAÉ 3.01' AND r.code = 'R3.02';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s, ressource r
WHERE s.code = 'SAÉ 3.01' AND r.code = 'R3.03';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s, ressource r
WHERE s.code = 'SAÉ 3.01' AND r.code = 'R3.04';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s, ressource r
WHERE s.code = 'SAÉ 3.01' AND r.code = 'R3.05';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource
FROM sae s, ressource r
WHERE s.code = 'SAÉ 3.01' AND r.code = 'R3.11';

/* ============================================================
   LIENS POUR SAÉ 3.02 : Intégration de données dans un datawarehouse
   ============================================================ */

-- Compétences : C1, C3
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C1' FROM sae WHERE code = 'SAÉ 3.02';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C3' FROM sae WHERE code = 'SAÉ 3.02';

-- AC associées : AC21.01, AC21.02, AC21.03, AC21.04, AC21.05, AC23.03, AC23.04
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.01' FROM sae WHERE code = 'SAÉ 3.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.02' FROM sae WHERE code = 'SAÉ 3.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.03' FROM sae WHERE code = 'SAÉ 3.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.04' FROM sae WHERE code = 'SAÉ 3.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.05' FROM sae WHERE code = 'SAÉ 3.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.03' FROM sae WHERE code = 'SAÉ 3.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.04' FROM sae WHERE code = 'SAÉ 3.02';

-- Ressources : R3.02, R3.04, R3.11
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R3.02'
  WHERE s.code = 'SAÉ 3.02';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R3.04'
  WHERE s.code = 'SAÉ 3.02';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R3.11'
  WHERE s.code = 'SAÉ 3.02';



/* ============================================================
   LIENS POUR SAÉ 3.03 : Description et prévision de données temporelles
   ============================================================ */

-- Compétences : C2, C3
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C2' FROM sae WHERE code = 'SAÉ 3.03';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C3' FROM sae WHERE code = 'SAÉ 3.03';

-- AC associées : AC22.01, AC22.02, AC22.05, AC23.01, AC23.02, AC23.03, AC43.04
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC22.01' FROM sae WHERE code = 'SAÉ 3.03';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC22.02' FROM sae WHERE code = 'SAÉ 3.03';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC22.05' FROM sae WHERE code = 'SAÉ 3.03';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.01' FROM sae WHERE code = 'SAÉ 3.03';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.02' FROM sae WHERE code = 'SAÉ 3.03';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.03' FROM sae WHERE code = 'SAÉ 3.03';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC43.04' FROM sae WHERE code = 'SAÉ 3.03';

-- Ressources : R3.09, R3.11
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R3.09'
  WHERE s.code = 'SAÉ 3.03';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R3.11'
  WHERE s.code = 'SAÉ 3.03';

/* ============================================================
   LIENS POUR SAÉ 3.04 : Conformité réglementaire pour traiter des données
   ============================================================ */

-- Compétences : C1, C2, C3
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C1' FROM sae WHERE code = 'SAÉ 3.04';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C2' FROM sae WHERE code = 'SAÉ 3.04';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C3' FROM sae WHERE code = 'SAÉ 3.04';

-- AC associées : AC21.01, AC25.01, AC23.01, AC23.03, AC23.04
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.01' FROM sae WHERE code = 'SAÉ 3.04';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC25.01' FROM sae WHERE code = 'SAÉ 3.04';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.01' FROM sae WHERE code = 'SAÉ 3.04';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.03' FROM sae WHERE code = 'SAÉ 3.04';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.04' FROM sae WHERE code = 'SAÉ 3.04';

-- Ressources : R3.02, R3.08, R3.09, R3.11
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R3.02'
  WHERE s.code = 'SAÉ 3.04';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R3.08'
  WHERE s.code = 'SAÉ 3.04';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R3.09'
  WHERE s.code = 'SAÉ 3.04';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R3.11'
  WHERE s.code = 'SAÉ 3.04';

/* ============================================================
   LIENS POUR SAÉ 4.01 : Développement d’un composant
   d’une solution décisionnelle
   ============================================================ */

-- Compétences ciblées : C4, C1, C3
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
  SELECT id_sae, 'C4', '3' FROM sae WHERE code = 'SAÉ 4.01';

INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
  SELECT id_sae, 'C1', '3' FROM sae WHERE code = 'SAÉ 4.01';

INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
  SELECT id_sae, 'C3', '3' FROM sae WHERE code = 'SAÉ 4.01';

-- AC associées
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.01' FROM sae WHERE code = 'SAÉ 4.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.02' FROM sae WHERE code = 'SAÉ 4.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.03' FROM sae WHERE code = 'SAÉ 4.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.04' FROM sae WHERE code = 'SAÉ 4.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.05' FROM sae WHERE code = 'SAÉ 4.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.01' FROM sae WHERE code = 'SAÉ 4.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.02' FROM sae WHERE code = 'SAÉ 4.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.03' FROM sae WHERE code = 'SAÉ 4.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC24.01' FROM sae WHERE code = 'SAÉ 4.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC24.02' FROM sae WHERE code = 'SAÉ 4.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC24.03' FROM sae WHERE code = 'SAÉ 4.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC24.04' FROM sae WHERE code = 'SAÉ 4.01';

-- Ressources mobilisées : R4.01, R4.07, R4.08, R4.09
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R4.01'
  WHERE s.code = 'SAÉ 4.01';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R4.07'
  WHERE s.code = 'SAÉ 4.01';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R4.08'
  WHERE s.code = 'SAÉ 4.01';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R4.09'
  WHERE s.code = 'SAÉ 4.01';

/* ============================================================
   LIENS POUR SAÉ 4.02 : Reporting d’une analyse multivariée
   ============================================================ */

-- Compétences ciblées : C1, C2, C3
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
  SELECT id_sae, 'C1', '3' FROM sae WHERE code = 'SAÉ 4.02';

INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
  SELECT id_sae, 'C2', '3' FROM sae WHERE code = 'SAÉ 4.02';

INSERT OR IGNORE INTO sae_competence (id_sae, id_competence, niveau_cible)
  SELECT id_sae, 'C3', '3' FROM sae WHERE code = 'SAÉ 4.02';

-- AC associées
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.01' FROM sae WHERE code = 'SAÉ 4.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.04' FROM sae WHERE code = 'SAÉ 4.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC21.05' FROM sae WHERE code = 'SAÉ 4.02';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC22.01' FROM sae WHERE code = 'SAÉ 4.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC22.02' FROM sae WHERE code = 'SAÉ 4.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC22.05' FROM sae WHERE code = 'SAÉ 4.02';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.01' FROM sae WHERE code = 'SAÉ 4.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.02' FROM sae WHERE code = 'SAÉ 4.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.03' FROM sae WHERE code = 'SAÉ 4.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
  SELECT id_sae, 'AC23.04' FROM sae WHERE code = 'SAÉ 4.02';

-- Ressources mobilisées : R4.01, R4.02, R4.03, R4.05, R4.07
INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R4.01'
  WHERE s.code = 'SAÉ 4.02';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R4.02'
  WHERE s.code = 'SAÉ 4.02';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R4.03'
  WHERE s.code = 'SAÉ 4.02';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R4.05'
  WHERE s.code = 'SAÉ 4.02';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
  SELECT s.id_sae, r.id_ressource
  FROM sae s JOIN ressource r ON r.code = 'R4.07'
  WHERE s.code = 'SAÉ 4.02';

INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C3' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C1' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C2' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C4' FROM sae WHERE code = 'SAÉ 5.01';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC33.01' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC31.02' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC31.03' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC32.02' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC33.02' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC33.03' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC33.04' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC33.05' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC34.01' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC34.02' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC34.03' FROM sae WHERE code = 'SAÉ 5.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC34.04' FROM sae WHERE code = 'SAÉ 5.01';

INSERT OR IGNORE INTO  sae_ressource (id_sae, id_ressource)
 SELECT s.id_sae, r.id_ressource 
  FROM sae s JOIN ressource r ON r.code = 'R5.05'
  WHERE s.code = 'SAÉ 5.01';


INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource 
FROM sae s JOIN ressource r ON r.code ='R5.06' 
WHERE s.code = 'SAÉ 5.01';

INSERT OR IGNORE INTO sae_ressource (id_sae, id_ressource)
SELECT s.id_sae, r.id_ressource  
FROM sae s JOIN ressource r ON r.code = 'R4.01'
WHERE s.code = 'SAÉ 5.01';


INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
SELECT id_sae, 'C1' FROM sae WHERE code = 'SAÉ 5.02';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
SELECT id_sae, 'C3' FROM sae WHERE code = 'SAÉ 5.02';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
SELECT id_sae, 'C4' FROM sae WHERE code = 'SAÉ 5.02';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC33.01' FROM sae WHERE code = 'SAÉ 5.02';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC31.02' FROM sae WHERE code = 'SAÉ 5.02';

INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC31.03' FROM sae WHERE code = 'SAÉ 5.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) 
SELECT id_sae, 'AC33.03' FROM sae WHERE code = 'SAÉ 5.02';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code)
SELECT id_sae, 'AC33.05' FROM sae WHERE code = 'SAÉ 5.02';

INSERT OR IGNORE INTO sae_ressource 
SELECT s.id_sae, r.id_ressource   
FROM sae s JOIN ressource r ON r.code = 'R5.05' 
WHERE s.code = 'SAÉ 5.02';

/* ============================================================
   LIENS POUR SAÉ 5.03 : Reporting d’une analyse multivariée
   ============================================================ */

INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C3' FROM sae WHERE code = 'SAÉ 5.03';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C1' FROM sae WHERE code = 'SAÉ 5.03';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C2' FROM sae WHERE code = 'SAÉ 5.03';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
  SELECT id_sae, 'C4' FROM sae WHERE code = 'SAÉ 5.03';



INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC52.01' FROM sae WHERE code = 'SAÉ 5.03';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC52.02' FROM sae WHERE code = 'SAÉ 5.03';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC52.03' FROM sae WHERE code = 'SAÉ 5.03';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC53.01' FROM sae WHERE code = 'SAÉ 5.03';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC53.02' FROM sae WHERE code = 'SAÉ 5.03';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC53.03' FROM sae WHERE code = 'SAÉ 5.03';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC53.04' FROM sae WHERE code = 'SAÉ 5.03';

INSERT OR IGNORE INTO sae_ressource 
SELECT s.id_sae, r.id_ressource   
FROM sae s JOIN ressource r ON r.code = 'R5.05' 
WHERE s.code = 'SAÉ 5.02';

/* ============================================================
   LIENS POUR SAÉ 6.01 : Reporting d’une analyse multivariée
   ============================================================ */
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
SELECT id_sae, 'C3' FROM sae WHERE code = 'SAÉ 6.01';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
SELECT id_sae, 'C1' FROM sae WHERE code = 'SAÉ 6.01';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
SELECT id_sae, 'C2' FROM sae WHERE code = 'SAÉ 6.01';
INSERT OR IGNORE INTO sae_competence (id_sae, id_competence)
SELECT id_sae, 'C4' FROM sae WHERE code = 'SAÉ 6.01';


INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC61.01'   FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC61.02'   FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC61.03'   FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC62.01'   FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC62.02'   FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC63.01'   FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC63.02'   FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC63.03'	  FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC63.04'   FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC63.05'   FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC63.06'   FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC64.01'   FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC64.02'   FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC64.03'   FROM sae WHERE code =   'SAÉ 6.01';
INSERT OR IGNORE INTO sae_ac (id_sae, ac_code) SELECT id_sae, 'AC64.04'   FROM sae WHERE code =   'SAÉ 6.01';


INSERT OR IGNORE INTO sae_ressource 
SELECT s.id_sae, r.id_ressource   
FROM sae s JOIN ressource r ON r.code = 'R6.05' 
WHERE s.code = 'SAÉ 6.01';