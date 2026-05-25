function tronquer(texte, max = 800) {
  if (!texte) return '';
  if (texte.length <= max) return texte;
  return texte.substring(0, max - 3) + '...';
}

function nettoyer(texte) {
  return texte
    .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/[ç]/g, 'c')
    .replace(/[œ]/g, 'oe').replace(/[æ]/g, 'ae');
}

module.exports = { tronquer, nettoyer };
