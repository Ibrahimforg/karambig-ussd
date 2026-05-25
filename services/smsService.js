const { sms }                = require('../config/africasTalking');
const { tronquer, nettoyer } = require('../utils/formatSMS');
const logger                 = require('../utils/logger');

async function envoyerSMS(telephone, message) {
  const texte = tronquer(nettoyer(message), 800);
  try {
    const result = await sms.send({
      to: [telephone], message: texte,
      from: process.env.AT_SENDER_ID || 'KarambigRoogo',
    });
    logger.info(`SMS envoye a ${telephone}`);
    return result;
  } catch (err) {
    logger.error(`Erreur SMS a ${telephone}: ${err.message}`);
    throw err;
  }
}

module.exports = { envoyerSMS };
