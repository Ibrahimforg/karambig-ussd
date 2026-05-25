function construireMenu(titre, items) {
  if (!items || items.length === 0) {
    return `END Aucun contenu disponible\npour cette selection.\nReessaie bientot.\nKarambig Roogo`;
  }
  let menu = `CON ${titre}\n`;
  items.forEach((item, i) => { menu += `${i + 1}. ${item.libelle}\n`; });
  menu += `0. Retour`;
  return menu;
}

const menuAccueil = () =>
`CON Karambig Roogo
Le savoir ou que tu sois
1. Consulter un cours
2. Consulter un corrige
3. Poser une question
0. Quitter`;

const menuNiveaux     = (n) => construireMenu('Choisir ton niveau :', n);
const menuMatieres    = (m) => construireMenu('Choisir ta matiere :', m);
const menuTypeCorrige = () =>
`CON Choisir le type :
1. Examen final
2. Partiel / TD
0. Retour`;

const finEnvoiSMS     = (t) => `END ${t} envoye par SMS !\nVerifie tes messages.\nKarambig Roogo`;
const finAucunContenu = (t) => `END Aucun ${t} disponible\npour cette selection.\nKarambig Roogo`;
const finPoserQuestion = () => `END Instructions envoyees par SMS.\nVerifie tes messages.\nKarambig Roogo`;
const menuQuitter      = () => `END Merci d'utiliser Karambig Roogo.\nCompose *305# pour revenir.`;
const menuErreur       = () => `END Erreur technique.\nReessaie dans quelques minutes.\nKarambig Roogo`;

module.exports = {
  menuAccueil, menuNiveaux, menuMatieres, menuTypeCorrige,
  finEnvoiSMS, finAucunContenu, finPoserQuestion, menuQuitter, menuErreur
};
