const { sms }                = require('../config/africasTalking');
const { tronquer, nettoyer } = require('../utils/formatSMS');
const logger                 = require('../utils/logger');

// Validation du numéro de téléphone (format international Burkina Faso)
function validerTelephone(telephone) {
  const phone = telephone.trim();
  // Accepte formats: +226XXXXXXXX, 00226XXXXXXXX, 226XXXXXXXX
  const regex = /^(\+226|00226|226)?[0-9]{8}$/;
  if (!regex.test(phone.replace(/\s/g, ''))) {
    return false;
  }
  // Normaliser au format +226XXXXXXXX
  if (phone.startsWith('+226')) return phone;
  if (phone.startsWith('00226')) return '+226' + phone.substring(5);
  if (phone.startsWith('226')) return '+226' + phone.substring(3);
  return '+226' + phone;
}

// Limite de longueur SMS (160 caractères pour un SMS standard)
const SMS_MAX_LENGTH = 160;
const SMS_MULTI_MAX_LENGTH = 459; // 3 SMS max pour éviter les coûts excessifs

async function envoyerSMS(telephone, message) {
  // Vérifier la configuration Africa's Talking
  if (!process.env.AT_USERNAME || !process.env.AT_API_KEY) {
    logger.error('Configuration Africa\'s Talking manquante: AT_USERNAME ou AT_API_KEY non defini');
    throw new Error('Configuration SMS manquante');
  }

  // Valider et normaliser le numéro
  const telephoneValide = validerTelephone(telephone);
  if (!telephoneValide) {
    logger.error(`Numero de telephone invalide: ${telephone}`);
    throw new Error('Numero de telephone invalide');
  }

  // Nettoyer et tronquer le message
  const texteNettoye = nettoyer(message);
  const texte = tronquer(texteNettoye, SMS_MULTI_MAX_LENGTH);

  logger.info(`SMS preparation - Telephone: ${telephoneValide}, Contenu: "${texte}" (${texte.length} caracteres)`);

  try {
    const result = await sms.send({
      to: [telephoneValide],
      message: texte,
      from: process.env.AT_SENDER_ID || 'KarambigRoogo',
    });

    // Vérifier la réponse
    if (result && result.SMSMessageData && result.SMSMessageData.Recipients && result.SMSMessageData.Recipients.length > 0) {
      const recipient = result.SMSMessageData.Recipients[0];
      if (recipient.status === 'Success') {
        logger.info(`SMS envoye avec succes a ${telephoneValide} - MessageID: ${recipient.messageId}, Cout: ${recipient.cost}`);
      } else if (recipient.status === 'Failed') {
        logger.error(`SMS echoue a ${telephoneValide} - Status: ${recipient.status}, Message: ${recipient.message || 'Unknown'}`);
        throw new Error(`SMS echoue: ${recipient.message || 'Unknown error'}`);
      } else {
        logger.warn(`SMS envoye mais statut inconnu a ${telephoneValide} - Status: ${recipient.status}`);
      }
    } else if (result && result.SMSMessageData && result.SMSMessageData.Message) {
      // Format alternatif de réponse
      logger.info(`SMS envoye avec succes a ${telephoneValide} - Message: ${result.SMSMessageData.Message}`);
    } else {
      logger.warn(`Reponse SMS inattendue pour ${telephoneValide} - Result: ${JSON.stringify(result)}`);
    }

    return result;
  } catch (err) {
    logger.error(`Erreur SMS a ${telephoneValide}: ${err.message} - Contenu: "${texte}" - Stack: ${err.stack}`);
    throw err;
  }
}

module.exports = { envoyerSMS, validerTelephone };
