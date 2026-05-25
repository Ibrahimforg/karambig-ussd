const pool   = require('../config/database');
const sms    = require('../services/smsService');
const logger = require('../utils/logger');
const path   = require('path');

// ── Authentification ────────────────────────────────────────
function getLogin(req, res) {
  if (req.session.admin) return res.redirect('/admin/dashboard');
  res.sendFile(path.join(__dirname, '../admin/views/login.html'));
}

function postLogin(req, res) {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.admin = true;
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/login?error=1');
  }
}

function logout(req, res) {
  req.session.destroy();
  res.redirect('/admin/login');
}

// ── Dashboard ───────────────────────────────────────────────
async function getDashboard(req, res) {
  res.sendFile(path.join(__dirname, '../admin/views/dashboard.html'));
}

async function getStats(req, res) {
  try {
    const totalCours     = await pool.query('SELECT COUNT(*) FROM cours WHERE actif = true');
    const totalSujets    = await pool.query("SELECT COUNT(*) FROM sujets WHERE actif = true AND statut = 'valide'");
    const totalSessions  = await pool.query('SELECT COUNT(*) FROM sessions_ussd_log');
    const totalSMS       = await pool.query('SELECT COUNT(*) FROM sessions_ussd_log WHERE sms_envoye = true');
    const totalQuestions = await pool.query("SELECT COUNT(*) FROM questions_ussd WHERE statut = 'en_attente'");
    const topMatieres    = await pool.query(
      `SELECT m.libelle, COUNT(s.id) as nb
       FROM sessions_ussd_log s JOIN matieres m ON s.matiere_id = m.id
       WHERE s.matiere_id IS NOT NULL
       GROUP BY m.libelle ORDER BY nb DESC LIMIT 5`
    );
    res.json({
      cours:            parseInt(totalCours.rows[0].count),
      sujets:           parseInt(totalSujets.rows[0].count),
      sessions:         parseInt(totalSessions.rows[0].count),
      sms:              parseInt(totalSMS.rows[0].count),
      questionsEnAttente: parseInt(totalQuestions.rows[0].count),
      topMatieres:      topMatieres.rows,
    });
  } catch (err) {
    logger.error('Stats error: ' + err.message);
    res.status(500).json({ error: err.message });
  }
}

// ── Niveaux ─────────────────────────────────────────────────
async function getNiveaux(req, res) {
  const r = await pool.query('SELECT * FROM niveaux ORDER BY ordre ASC');
  res.json(r.rows);
}

async function createNiveau(req, res) {
  const { code, libelle, ordre } = req.body;
  try {
    const r = await pool.query(
      'INSERT INTO niveaux (code, libelle, ordre) VALUES ($1, $2, $3) RETURNING *',
      [code, libelle, ordre]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateNiveau(req, res) {
  const { id } = req.params;
  const { code, libelle, ordre } = req.body;
  try {
    const r = await pool.query(
      'UPDATE niveaux SET code=$1, libelle=$2, ordre=$3 WHERE id=$4 RETURNING *',
      [code, libelle, ordre, id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteNiveau(req, res) {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM niveaux WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ── Matières ────────────────────────────────────────────────
async function getMatieres(req, res) {
  const r = await pool.query('SELECT * FROM matieres ORDER BY libelle ASC');
  res.json(r.rows);
}

async function createMatiere(req, res) {
  const { code, libelle } = req.body;
  try {
    const r = await pool.query(
      'INSERT INTO matieres (code, libelle) VALUES ($1, $2) RETURNING *',
      [code, libelle]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateMatiere(req, res) {
  const { id } = req.params;
  const { code, libelle } = req.body;
  try {
    const r = await pool.query(
      'UPDATE matieres SET code=$1, libelle=$2 WHERE id=$3 RETURNING *',
      [code, libelle, id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteMatiere(req, res) {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM matieres WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ── Liaisons Matières/Niveaux ───────────────────────────────
async function getLiaisons(req, res) {
  const r = await pool.query(
    `SELECT mn.id, m.libelle as matiere, n.libelle as niveau, mn.matiere_id, mn.niveau_id
     FROM matieres_niveaux mn
     JOIN matieres m ON mn.matiere_id = m.id
     JOIN niveaux  n ON mn.niveau_id  = n.id
     ORDER BY m.libelle, n.ordre`
  );
  res.json(r.rows);
}

async function createLiaison(req, res) {
  const { matiere_id, niveau_id } = req.body;
  try {
    const r = await pool.query(
      'INSERT INTO matieres_niveaux (matiere_id, niveau_id) VALUES ($1, $2) RETURNING *',
      [matiere_id, niveau_id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteLiaison(req, res) {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM matieres_niveaux WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ── Cours ───────────────────────────────────────────────────
async function getCours(req, res) {
  const r = await pool.query(
    `SELECT c.id, c.titre, m.libelle as matiere, n.libelle as niveau,
            c.date_publication, c.nombre_telechargements, c.actif,
            c.version_sms, c.matiere_id, c.niveau_id
     FROM cours c
     JOIN matieres m ON c.matiere_id = m.id
     JOIN niveaux  n ON c.niveau_id  = n.id
     ORDER BY c.date_publication DESC`
  );
  res.json(r.rows);
}

async function createCours(req, res) {
  const { titre, matiere_id, niveau_id, version_sms } = req.body;
  try {
    if (!version_sms || version_sms.length > 800) {
      return res.status(400).json({ error: 'La version SMS est obligatoire et ne doit pas depasser 800 caracteres.' });
    }
    const r = await pool.query(
      `INSERT INTO cours (titre, matiere_id, niveau_id, version_sms, date_publication)
       VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *`,
      [titre, matiere_id, niveau_id, version_sms]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateCours(req, res) {
  const { id } = req.params;
  const { titre, matiere_id, niveau_id, version_sms, actif } = req.body;
  try {
    const r = await pool.query(
      `UPDATE cours SET titre=$1, matiere_id=$2, niveau_id=$3, version_sms=$4, actif=$5
       WHERE id=$6 RETURNING *`,
      [titre, matiere_id, niveau_id, version_sms, actif, id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteCours(req, res) {
  const { id } = req.params;
  try {
    await pool.query('UPDATE cours SET actif = false WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ── Corrigés/Sujets ─────────────────────────────────────────
async function getSujets(req, res) {
  const r = await pool.query(
    `SELECT s.id, s.titre, m.libelle as matiere, n.libelle as niveau,
            s.type, s.statut, s.annee, s.nombre_consultations, s.actif,
            s.version_sms, s.matiere_id, s.niveau_id
     FROM sujets s
     JOIN matieres m ON s.matiere_id = m.id
     JOIN niveaux  n ON s.niveau_id  = n.id
     ORDER BY s.created_at DESC`
  );
  res.json(r.rows);
}

async function createSujet(req, res) {
  const { titre, matiere_id, niveau_id, type, annee, version_sms } = req.body;
  try {
    if (!version_sms || version_sms.length > 800) {
      return res.status(400).json({ error: 'La version SMS est obligatoire et ne doit pas depasser 800 caracteres.' });
    }
    const r = await pool.query(
      `INSERT INTO sujets (titre, matiere_id, niveau_id, type, annee, version_sms, statut)
       VALUES ($1, $2, $3, $4, $5, $6, 'valide') RETURNING *`,
      [titre, matiere_id, niveau_id, type, annee || null, version_sms]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateSujet(req, res) {
  const { id } = req.params;
  const { titre, matiere_id, niveau_id, type, annee, version_sms, statut, actif } = req.body;
  try {
    const r = await pool.query(
      `UPDATE sujets SET titre=$1, matiere_id=$2, niveau_id=$3, type=$4,
              annee=$5, version_sms=$6, statut=$7, actif=$8
       WHERE id=$9 RETURNING *`,
      [titre, matiere_id, niveau_id, type, annee || null, version_sms, statut, actif, id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteSujet(req, res) {
  const { id } = req.params;
  try {
    await pool.query('UPDATE sujets SET actif = false WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ── Questions USSD ───────────────────────────────────────────
async function getQuestions(req, res) {
  const r = await pool.query(
    `SELECT q.id, q.telephone, q.contenu, q.statut, q.reponse_sms,
            q.repondu_le, q.created_at,
            m.libelle as matiere, n.libelle as niveau
     FROM questions_ussd q
     LEFT JOIN matieres m ON q.matiere_id = m.id
     LEFT JOIN niveaux  n ON q.niveau_id  = n.id
     ORDER BY q.created_at DESC`
  );
  res.json(r.rows);
}

async function repondreQuestion(req, res) {
  const { id } = req.params;
  const { reponse } = req.body;
  try {
    const q = await pool.query('SELECT * FROM questions_ussd WHERE id = $1', [id]);
    if (q.rows.length === 0) return res.status(404).json({ error: 'Question introuvable' });

    const question = q.rows[0];
    await sms.envoyerSMS(question.telephone,
      `Karambig Roogo - Reponse a votre question:\n${reponse}\n\nPour plus d'infos: *305#`
    );

    await pool.query(
      `UPDATE questions_ussd SET statut='publiee', reponse_sms=$1, repondu_le=NOW() WHERE id=$2`,
      [reponse, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function changerStatutQuestion(req, res) {
  const { id } = req.params;
  const { statut } = req.body;
  try {
    await pool.query('UPDATE questions_ussd SET statut=$1 WHERE id=$2', [statut, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ── Historique SMS ─────────────────────────────────────────────
async function getSMSHistory(req, res) {
  try {
    const r = await pool.query(
      `SELECT s.id, s.telephone, s.chemin, s.action, s.sms_envoye, s.created_at,
              m.libelle as matiere, n.libelle as niveau
       FROM sessions_ussd_log s
       LEFT JOIN matieres m ON s.matiere_id = m.id
       LEFT JOIN niveaux n ON s.niveau_id = n.id
       WHERE s.sms_envoye = true
       ORDER BY s.created_at DESC
       LIMIT 50`
    );
    res.json(r.rows);
  } catch (err) {
    logger.error('SMS history error: ' + err.message);
    res.status(500).json({ error: err.message });
  }
}

async function getSMSView(req, res) {
  res.sendFile(path.join(__dirname, '../admin/views/sms.html'));
}

module.exports = {
  getLogin, postLogin, logout,
  getDashboard, getStats,
  getNiveaux, createNiveau, updateNiveau, deleteNiveau,
  getMatieres, createMatiere, updateMatiere, deleteMatiere,
  getLiaisons, createLiaison, deleteLiaison,
  getCours, createCours, updateCours, deleteCours,
  getSujets, createSujet, updateSujet, deleteSujet,
  getQuestions, repondreQuestion, changerStatutQuestion,
  getSMSHistory, getSMSView,
};
