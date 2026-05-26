const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');
const { requireAuth } = require('../utils/auth');
const path    = require('path');
const multer  = require('multer');
const fs      = require('fs');

// Configuration multer pour les uploads
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.txt', '.csv', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Utilisez .txt, .csv ou .json'));
    }
  }
});

// Auth
router.get( '/login',  ctrl.getLogin);
router.post('/login',  ctrl.postLogin);
router.get( '/logout', ctrl.logout);

// Dashboard
router.get('/dashboard', requireAuth, ctrl.getDashboard);
router.get('/api/stats', requireAuth, ctrl.getStats);

// Niveaux
router.get(   '/api/niveaux',      requireAuth, ctrl.getNiveaux);
router.post(  '/api/niveaux',      requireAuth, ctrl.createNiveau);
router.put(   '/api/niveaux/:id',  requireAuth, ctrl.updateNiveau);
router.delete('/api/niveaux/:id',  requireAuth, ctrl.deleteNiveau);

// Matieres
router.get(   '/api/matieres',     requireAuth, ctrl.getMatieres);
router.post(  '/api/matieres',     requireAuth, ctrl.createMatiere);
router.put(   '/api/matieres/:id', requireAuth, ctrl.updateMatiere);
router.delete('/api/matieres/:id', requireAuth, ctrl.deleteMatiere);

// Liaisons
router.get(   '/api/liaisons',     requireAuth, ctrl.getLiaisons);
router.post(  '/api/liaisons',     requireAuth, ctrl.createLiaison);
router.delete('/api/liaisons/:id', requireAuth, ctrl.deleteLiaison);

// Cours
router.get(   '/api/cours',      requireAuth, ctrl.getCours);
router.post(  '/api/cours',      requireAuth, ctrl.createCours);
router.put(   '/api/cours/:id',  requireAuth, ctrl.updateCours);
router.delete('/api/cours/:id',  requireAuth, ctrl.deleteCours);

// Sujets / Corriges
router.get(   '/api/sujets',      requireAuth, ctrl.getSujets);
router.post(  '/api/sujets',      requireAuth, ctrl.createSujet);
router.put(   '/api/sujets/:id',  requireAuth, ctrl.updateSujet);
router.delete('/api/sujets/:id',  requireAuth, ctrl.deleteSujet);

// Questions USSD
router.get( '/api/questions',             requireAuth, ctrl.getQuestions);
router.post('/api/questions/:id/reponse', requireAuth, ctrl.repondreQuestion);
router.put( '/api/questions/:id/statut',  requireAuth, ctrl.changerStatutQuestion);

// Historique SMS
router.get('/api/sms-history', requireAuth, ctrl.getSMSHistory);
router.get('/sms',            requireAuth, ctrl.getSMSView);

// Upload de fichiers
router.post('/api/upload/cours',    requireAuth, upload.single('file'), ctrl.uploadCours);
router.post('/api/upload/sujet',    requireAuth, upload.single('file'), ctrl.uploadSujet);
router.post('/api/upload/niveaux',  requireAuth, upload.single('file'), ctrl.uploadNiveaux);
router.post('/api/upload/matieres', requireAuth, upload.single('file'), ctrl.uploadMatieres);

// Pages HTML
router.get('/cours',      requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../admin/views/cours.html')));
router.get('/corriges',   requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../admin/views/corriges.html')));
router.get('/matieres',   requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../admin/views/matieres.html')));
router.get('/niveaux',    requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../admin/views/niveaux.html')));
router.get('/questions',  requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../admin/views/questions.html')));

// Redirection racine admin
router.get('/', (req, res) => res.redirect('/admin/login'));

module.exports = router;
