const menu    = require('../services/menuService');
const content = require('../services/contentService');
const sms     = require('../services/smsService');
const session = require('../services/sessionService');
const logger  = require('../utils/logger');

const TYPES_CORRIGES = { '1': 'examen_final', '2': 'partiel_td' };

async function handleUSSD(req, res) {
  const startTime = Date.now();
  logger.info('USSD request received:', JSON.stringify(req.body));
  const { sessionId, phoneNumber, text } = req.body;
  const etapes     = text === '' ? [] : text.split('*');
  const profondeur = etapes.length;
  logger.info(`USSD | ${phoneNumber} | chemin: "${text}" | profondeur: ${profondeur}`);

  if (!session.get(sessionId)) session.set(sessionId, {});
  const s = session.get(sessionId);
  let reponse = '';

  try {
    if (profondeur === 0) {
      reponse = menu.menuAccueil();

    } else if (profondeur === 1) {
      const c = etapes[0];
      if (c === '0') {
        reponse = menu.menuQuitter();
      } else if (c === '3') {
        // Flux de questions via USSD
        const niveaux = await content.getNiveaux();
        session.update(sessionId, { typeContenu: '3', niveaux });
        reponse = menu.menuNiveaux(niveaux);
      } else if (c === '1' || c === '2') {
        const niveaux = await content.getNiveaux();
        session.update(sessionId, { typeContenu: c, niveaux });
        reponse = menu.menuNiveaux(niveaux);
      } else {
        reponse = menu.menuAccueil();
      }

    } else if (profondeur === 2) {
      const c = etapes[1];
      if (c === '0') {
        reponse = menu.menuAccueil();
      } else {
        const niveauChoisi = s.niveaux?.[parseInt(c) - 1];
        if (!niveauChoisi) {
          reponse = menu.menuErreur();
        } else {
          session.update(sessionId, { niveauId: niveauChoisi.id, niveauLibelle: niveauChoisi.libelle });
          if (s.typeContenu === '2') {
            reponse = menu.menuTypeCorrige();
          } else if (s.typeContenu === '3') {
            // Flux de questions : afficher les matières
            const matieres = await content.getMatieresPourNiveau(niveauChoisi.id);
            session.update(sessionId, { matieres });
            reponse = menu.menuMatieres(matieres);
          } else {
            const matieres = await content.getMatieresPourNiveau(niveauChoisi.id);
            session.update(sessionId, { matieres });
            reponse = menu.menuMatieres(matieres);
          }
        }
      }

    } else if (profondeur === 3) {
      const c = etapes[2];
      if (c === '0') {
        const niveaux = await content.getNiveaux();
        session.update(sessionId, { niveaux });
        reponse = menu.menuNiveaux(niveaux);
      } else if (s.typeContenu === '3') {
        // Flux de questions : demander d'écrire la question
        const mat = s.matieres?.[parseInt(c) - 1];
        if (!mat) {
          reponse = menu.menuErreur();
        } else {
          session.update(sessionId, { matiereId: mat.id, matiereLibelle: mat.libelle });
          reponse = `CON Ecrivez votre question pour ${mat.libelle}:\n(Max 160 caracteres)\n0. Retour`;
        }
      } else if (s.typeContenu === '1') {
        const mat = s.matieres?.[parseInt(c) - 1];
        if (!mat) {
          reponse = menu.menuErreur();
        } else {
          const cours = await content.getCours(mat.id, s.niveauId);
          if (cours) {
            try {
              await sms.envoyerSMS(phoneNumber, cours.version_sms);
              await content.logSession({ sessionId, telephone: phoneNumber, chemin: text, action: 'cours', matiereId: mat.id, niveauId: s.niveauId, smsEnvoye: true });
              reponse = menu.finEnvoiSMS('Cours');
            } catch (smsErr) {
              logger.error(`SMS envoi echoue: ${smsErr.message}`);
              await content.logSession({ sessionId, telephone: phoneNumber, chemin: text, action: 'cours', matiereId: mat.id, niveauId: s.niveauId, smsEnvoye: false, erreur: smsErr.message });
              if (smsErr.message === 'Configuration SMS manquante') {
                reponse = `END Service SMS temporairement indisponible.\nContenu disponible.\nContactez l'admin.\nKarambig Roogo`;
              } else {
                reponse = `END Erreur envoi SMS.\nContenu disponible mais SMS non envoye.\nReessaie plus tard.\nKarambig Roogo`;
              }
            }
          } else {
            await content.logSession({ sessionId, telephone: phoneNumber, chemin: text, action: 'cours_vide', matiereId: mat.id, niveauId: s.niveauId, smsEnvoye: false });
            reponse = menu.finAucunContenu('cours');
          }
          session.remove(sessionId);
        }
      } else if (s.typeContenu === '2') {
        const typeCorrige = TYPES_CORRIGES[c];
        if (!typeCorrige) {
          reponse = menu.menuTypeCorrige();
        } else {
          const matieres = await content.getMatieresPourNiveau(s.niveauId);
          session.update(sessionId, { typeCorrige, matieres });
          reponse = menu.menuMatieres(matieres);
        }
      }

    } else if (profondeur === 4) {
      const c = etapes[3];
      if (s.typeContenu === '3') {
        // Flux de questions : enregistrer la question
        if (c === '0') {
          const matieres = await content.getMatieresPourNiveau(s.niveauId);
          session.update(sessionId, { matieres });
          reponse = menu.menuMatieres(matieres);
        } else {
          const questionText = c.trim();
          if (questionText.length === 0) {
            reponse = `CON Veuillez ecrire une question.\n0. Retour`;
          } else if (questionText.length > 160) {
            reponse = `CON Question trop longue (max 160 car).\nReessayez plus court.\n0. Retour`;
          } else {
            // Enregistrer la question
            await content.enregistrerQuestion(phoneNumber, questionText, s.matiereId, s.niveauId);
            await content.logSession({ sessionId, telephone: phoneNumber, chemin: text, action: 'question_ussd', matiereId: s.matiereId, niveauId: s.niveauId });
            reponse = `END Question enregistree !\nMatiere: ${s.matiereLibelle}\nNiveau: ${s.niveauLibelle}\nReponse sous 48h par SMS.\nKarambig Roogo`;
            session.remove(sessionId);
          }
        }
      } else if (c === '0') {
        reponse = menu.menuTypeCorrige();
      } else {
        const mat = s.matieres?.[parseInt(c) - 1];
        if (!mat) {
          reponse = menu.menuErreur();
        } else {
          const corrige = await content.getCorrige(mat.id, s.niveauId, s.typeCorrige);
          if (corrige) {
            try {
              await sms.envoyerSMS(phoneNumber, corrige.version_sms);
              await content.logSession({ sessionId, telephone: phoneNumber, chemin: text, action: 'corrige', matiereId: mat.id, niveauId: s.niveauId, smsEnvoye: true });
              reponse = menu.finEnvoiSMS('Corrige');
            } catch (smsErr) {
              logger.error(`SMS envoi echoue: ${smsErr.message}`);
              await content.logSession({ sessionId, telephone: phoneNumber, chemin: text, action: 'corrige', matiereId: mat.id, niveauId: s.niveauId, smsEnvoye: false, erreur: smsErr.message });
              if (smsErr.message === 'Configuration SMS manquante') {
                reponse = `END Service SMS temporairement indisponible.\nContenu disponible.\nContactez l'admin.\nKarambig Roogo`;
              } else {
                reponse = `END Erreur envoi SMS.\nContenu disponible mais SMS non envoye.\nReessaie plus tard.\nKarambig Roogo`;
              }
            }
          } else {
            await content.logSession({ sessionId, telephone: phoneNumber, chemin: text, action: 'corrige_vide', matiereId: mat.id, niveauId: s.niveauId, smsEnvoye: false });
            reponse = menu.finAucunContenu('corrige');
          }
          session.remove(sessionId);
        }
      }
    } else {
      reponse = menu.menuErreur();
      session.remove(sessionId);
    }
  } catch (err) {
    logger.error(`USSD error: ${err.message}`);
    await content.logSession({ sessionId, telephone: phoneNumber, chemin: text, action: 'erreur', erreur: err.message });
    reponse = menu.menuErreur();
    session.remove(sessionId);
  }

  const duration = Date.now() - startTime;
  logger.info(`USSD response: ${reponse.substring(0, 50)}... | Duration: ${duration}ms`);
  res.set('Content-Type', 'text/plain');
  res.send(reponse);
}

module.exports = { handleUSSD };
