const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');
const { requireAuth } = require('../utils/auth');
const path    = require('path');

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

// Pages HTML
router.get('/cours',      requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../admin/views/cours.html')));
router.get('/corriges',   requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../admin/views/corriges.html')));
router.get('/matieres',   requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../admin/views/matieres.html')));
router.get('/niveaux',    requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../admin/views/niveaux.html')));
router.get('/questions',  requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../admin/views/questions.html')));

// Redirection racine admin
router.get('/', (req, res) => res.redirect('/admin/login'));

module.exports = router;
