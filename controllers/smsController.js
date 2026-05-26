const pool    = require('../config/database');
const content = require('../services/contentService');
const sms     = require('../services/smsService');
const logger  = require('../utils/logger');

async function handleSMS(req, res) {
  const startTime = Date.now();
  const { from, text } = req.body;
  
  logger.info(`SMS entrant de ${from}: "${text}" (${text.length} caracteres)`);
  res.sendStatus(200);

  try {
    // Valider le numéro de téléphone
    const telephoneValide = sms.validerTelephone(from);
    if (!telephoneValide) {
      logger.warn(`Numero de telephone invalide: ${from}`);
      return;
    }

    const parties = text.trim().split('|');
    if (parties[0].toUpperCase() !== 'QUESTION' || parties.length < 4) {
      logger.warn(`Format SMS incorrect de ${from}: ${text}`);
      await sms.envoyerSMS(telephoneValide,
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

    await content.enregistrerQuestion(telephoneValide, contenu, rMat.rows[0]?.id || null, rNiv.rows[0]?.id || null);

    await sms.envoyerSMS(telephoneValide,
      `Karambig Roogo - Question recue !\nMatiere: ${rMat.rows[0]?.libelle || matiereTexte}\nNiveau: ${rNiv.rows[0]?.libelle || niveauTexte}\nReponse sous 48h par SMS.`
    );
    
    const duration = Date.now() - startTime;
    logger.info(`SMS traite avec succes pour ${telephoneValide} | Duration: ${duration}ms`);
  } catch (err) {
    logger.error(`SMS handler error: ${err.message}`);
  }
}

module.exports = { handleSMS };
