const pool   = require('../config/database');
const logger = require('../utils/logger');

async function getNiveaux() {
  const r = await pool.query('SELECT id, code, libelle FROM niveaux ORDER BY ordre ASC');
  return r.rows;
}

async function getMatieresPourNiveau(niveauId) {
  const r = await pool.query(
    `SELECT m.id, m.code, m.libelle
     FROM matieres m
     JOIN matieres_niveaux mn ON m.id = mn.matiere_id
     WHERE mn.niveau_id = $1 ORDER BY m.libelle ASC`,
    [niveauId]
  );
  return r.rows;
}

async function getCours(matiereId, niveauId) {
  const r = await pool.query(
    `SELECT id, titre, version_sms FROM cours
     WHERE matiere_id = $1 AND niveau_id = $2 AND actif = true
       AND version_sms IS NOT NULL
     ORDER BY date_publication DESC LIMIT 1`,
    [matiereId, niveauId]
  );
  if (r.rows.length > 0) {
    await pool.query(
      'UPDATE cours SET nombre_telechargements = nombre_telechargements + 1 WHERE id = $1',
      [r.rows[0].id]
    );
  }
  return r.rows[0] || null;
}

async function getCorrige(matiereId, niveauId, type) {
  const r = await pool.query(
    `SELECT id, titre, version_sms FROM sujets
     WHERE matiere_id = $1 AND niveau_id = $2 AND type = $3
       AND actif = true AND statut = 'valide' AND version_sms IS NOT NULL
     ORDER BY nombre_consultations DESC LIMIT 1`,
    [matiereId, niveauId, type]
  );
  if (r.rows.length > 0) {
    await pool.query(
      'UPDATE sujets SET nombre_consultations = nombre_consultations + 1 WHERE id = $1',
      [r.rows[0].id]
    );
  }
  return r.rows[0] || null;
}

async function enregistrerQuestion(telephone, contenu, matiereId, niveauId) {
  await pool.query(
    `INSERT INTO questions_ussd (telephone, contenu, matiere_id, niveau_id)
     VALUES ($1, $2, $3, $4)`,
    [telephone, contenu, matiereId || null, niveauId || null]
  );
}

async function logSession(data) {
  try {
    await pool.query(
      `INSERT INTO sessions_ussd_log
         (session_id, telephone, chemin, action, matiere_id, niveau_id, sms_envoye, erreur)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [data.sessionId, data.telephone, data.chemin || null, data.action || null,
       data.matiereId || null, data.niveauId || null,
       data.smsEnvoye || false, data.erreur || null]
    );
  } catch (e) {
    logger.error('Log session failed: ' + e.message);
  }
}

module.exports = { getNiveaux, getMatieresPourNiveau, getCours, getCorrige, enregistrerQuestion, logSession };
