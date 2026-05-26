const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Formats supportés pour l'upload
const SUPPORTED_FORMATS = ['.txt', '.csv', '.json'];

// Parser un fichier texte pour extraire le contenu
function parseTextFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.trim();
  } catch (err) {
    logger.error(`Erreur parsing fichier texte: ${err.message}`);
    throw new Error('Impossible de lire le fichier');
  }
}

// Parser un fichier CSV pour extraire les données
function parseCSVFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const parts = line.split(',');
      return parts.map(part => part.trim());
    });
  } catch (err) {
    logger.error(`Erreur parsing fichier CSV: ${err.message}`);
    throw new Error('Impossible de lire le fichier CSV');
  }
}

// Parser un fichier CSV avec en-têtes
function parseCSVWithHeaders(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((h, i) => obj[h] = values[i] || '');
      return obj;
    });
  } catch (err) {
    logger.error(`Erreur parsing fichier CSV avec headers: ${err.message}`);
    throw new Error('Impossible de lire le fichier CSV');
  }
}

// Parser un fichier JSON pour extraire les données
function parseJSONFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    logger.error(`Erreur parsing fichier JSON: ${err.message}`);
    throw new Error('Impossible de lire le fichier JSON');
  }
}

// Nettoyer le fichier temporaire après traitement
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Fichier temporaire supprimé: ${filePath}`);
    }
  } catch (err) {
    logger.error(`Erreur suppression fichier: ${err.message}`);
  }
}

// Formater le contenu pour SMS (gérer les formules scientifiques)
function formatForSMS(content) {
  // Remplacer les formules mathématiques complexes par des versions SMS-friendly
  let formatted = content;
  
  // Fractions: a/b → a sur b
  formatted = formatted.replace(/(\d+)\/(\d+)/g, '$1 sur $2');
  
  // Puissances: x^2 → x²
  formatted = formatted.replace(/(\w+)\^(\d+)/g, '$1²');
  
  // Racines: √ → racine de
  formatted = formatted.replace(/√(\d+)/g, 'racine de $1');
  
  // Multiplication: × → x
  formatted = formatted.replace(/×/g, 'x');
  
  // Division: ÷ → divisé par
  formatted = formatted.replace(/÷/g, ' divise par ');
  
  // Inférieur/supérieur ou égal: ≤, ≥
  formatted = formatted.replace(/≤/g, '<=');
  formatted = formatted.replace(/≥/g, '>=');
  
  // Différent: ≠ → !=
  formatted = formatted.replace(/≠/g, '!=');
  
  // Flèches: → → ->
  formatted = formatted.replace(/→/g, '->');
  
  // Symboles grecs communs
  formatted = formatted.replace(/π/g, 'pi');
  formatted = formatted.replace(/α/g, 'alpha');
  formatted = formatted.replace(/β/g, 'beta');
  formatted = formatted.replace(/γ/g, 'gamma');
  formatted = formatted.replace(/θ/g, 'theta');
  formatted = formatted.replace(/λ/g, 'lambda');
  formatted = formatted.replace(/μ/g, 'mu');
  formatted = formatted.replace(/σ/g, 'sigma');
  formatted = formatted.replace(/φ/g, 'phi');
  formatted = formatted.replace(/ω/g, 'omega');
  
  return formatted;
}

module.exports = {
  SUPPORTED_FORMATS,
  parseTextFile,
  parseCSVFile,
  parseCSVWithHeaders,
  parseJSONFile,
  cleanupFile,
  formatForSMS
};
