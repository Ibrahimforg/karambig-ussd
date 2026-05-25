CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS niveaux (
  id      SERIAL PRIMARY KEY,
  code    VARCHAR(20) UNIQUE NOT NULL,
  libelle VARCHAR(50) NOT NULL,
  ordre   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS matieres (
  id      SERIAL PRIMARY KEY,
  code    VARCHAR(50) UNIQUE NOT NULL,
  libelle VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS matieres_niveaux (
  id         SERIAL PRIMARY KEY,
  matiere_id INTEGER REFERENCES matieres(id) ON DELETE CASCADE,
  niveau_id  INTEGER REFERENCES niveaux(id)  ON DELETE CASCADE,
  UNIQUE (matiere_id, niveau_id)
);

CREATE TABLE IF NOT EXISTS cours (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre                  VARCHAR(300) NOT NULL,
  matiere_id             INTEGER REFERENCES matieres(id),
  niveau_id              INTEGER REFERENCES niveaux(id),
  date_publication       DATE NOT NULL DEFAULT CURRENT_DATE,
  nombre_telechargements INTEGER NOT NULL DEFAULT 0,
  version_sms            TEXT CHECK (char_length(version_sms) <= 800),
  actif                  BOOLEAN NOT NULL DEFAULT true,
  created_at             TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sujets (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre                VARCHAR(300) NOT NULL,
  matiere_id           INTEGER REFERENCES matieres(id),
  niveau_id            INTEGER REFERENCES niveaux(id),
  type                 VARCHAR(20) NOT NULL CHECK (type IN ('examen_final','partiel_td')),
  annee                INTEGER,
  statut               VARCHAR(20) NOT NULL DEFAULT 'valide' CHECK (statut IN ('en_attente','valide','rejete')),
  nombre_consultations INTEGER NOT NULL DEFAULT 0,
  version_sms          TEXT CHECK (char_length(version_sms) <= 800),
  actif                BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions_ussd (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telephone   VARCHAR(20) NOT NULL,
  contenu     TEXT NOT NULL,
  matiere_id  INTEGER REFERENCES matieres(id),
  niveau_id   INTEGER REFERENCES niveaux(id),
  statut      VARCHAR(20) NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente','publiee','rejetee')),
  reponse_sms TEXT,
  repondu_le  TIMESTAMP,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions_ussd_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) NOT NULL,
  telephone  VARCHAR(20) NOT NULL,
  chemin     TEXT,
  action     VARCHAR(50),
  matiere_id INTEGER REFERENCES matieres(id),
  niveau_id  INTEGER REFERENCES niveaux(id),
  sms_envoye BOOLEAN DEFAULT false,
  erreur     TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cours_mat_niv
  ON cours(matiere_id, niveau_id) WHERE actif = true;
CREATE INDEX IF NOT EXISTS idx_sujets_mat_niv_type
  ON sujets(matiere_id, niveau_id, type) WHERE actif = true AND statut = 'valide';
CREATE INDEX IF NOT EXISTS idx_sessions_tel
  ON sessions_ussd_log(telephone, created_at DESC);
