const { sms }                = require('../config/africasTalking');
const { tronquer, nettoyer } = require('../utils/formatSMS');
const logger                 = require('../utils/logger');

async function envoyerSMS(telephone, message) {
  const texte = tronquer(nettoyer(message), 800);
  logger.info(`SMS preparation - Telephone: ${telephone}, Contenu: "${texte}"`);
  try {
    const result = await sms.send({
      to: [telephone], message: texte,
      from: process.env.AT_SENDER_ID || 'KarambigRoogo',
    });
    logger.info(`SMS envoye a ${telephone} - Contenu: "${texte}"`);
    return result;
  } catch (err) {
    logger.error(`Erreur SMS a ${telephone}: ${err.message} - Contenu: "${texte}"`);
    throw err;
  }
}

module.exports = { envoyerSMS };
