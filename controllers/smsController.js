const pool    = require('../config/database');
const content = require('../services/contentService');
const sms     = require('../services/smsService');
const logger  = require('../utils/logger');

async function handleSMS(req, res) {
  const { from, text } = req.body;
  logger.info(`SMS entrant de ${from}: ${text}`);
  res.sendStatus(200);

  try {
    const parties = text.trim().split('|');
    if (parties[0].toUpperCase() !== 'QUESTION' || parties.length < 4) {
      await sms.envoyerSMS(from,
        `Karambig Roogo - Format incorrect.\nEnvoyez: QUESTION|Matiere|Niveau|Votre question\nEx: QUESTION|Informatique|Licence 2|Comment fonctionne TCP?`
      );
      return;
    }

    const matiereTexte = parties[1].trim();
    const niveauTexte  = parties[2].trim();
    const contenu      = parties.slice(3).join('|').trim();

    const rMat = await pool.query(
      `SELECT id, libelle FROM matieres WHERE LOWER(libelle) LIKE LOWER($1) LIMIT 1`,
      [`%${matiereTexte}%`]
    );
    const rNiv = await pool.query(
      `SELECT id, libelle FROM niveaux WHERE LOWER(libelle) LIKE LOWER($1) LIMIT 1`,
      [`%${niveauTexte}%`]
    );

    await content.enregistrerQuestion(from, contenu, rMat.rows[0]?.id || null, rNiv.rows[0]?.id || null);

    await sms.envoyerSMS(from,
      `Karambig Roogo - Question recue !\nMatiere: ${rMat.rows[0]?.libelle || matiereTexte}\nNiveau: ${rNiv.rows[0]?.libelle || niveauTexte}\nReponse sous 48h par SMS.`
    );
  } catch (err) {
    logger.error(`SMS handler error: ${err.message}`);
  }
}

module.exports = { handleSMS };
