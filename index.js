require('dotenv').config();
const express      = require('express');
const bodyParser   = require('body-parser');
const session      = require('express-session');
const path         = require('path');
const ussdRoute    = require('./routes/ussd');
const smsRoute     = require('./routes/sms');
const adminRoute   = require('./routes/admin');
const logger       = require('./utils/logger');

const app  = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret:            process.env.SESSION_SECRET || 'karambig_secret',
  resave:            false,
  saveUninitialized: false,
  cookie:            { maxAge: 24 * 60 * 60 * 1000 } // 24h
}));

// Fichiers statiques admin
app.use('/admin/public', express.static(path.join(__dirname, 'admin/public')));

// Routes
app.use('/ussd',  ussdRoute);
app.use('/sms',   smsRoute);
app.use('/admin', adminRoute);

// Page d'accueil
app.get('/', (req, res) => {
  res.send(`
    <h2>Karambig Roogo — Serveur USSD/SMS</h2>
    <p>Serveur en ligne sur le port ${PORT}</p>
    <p><a href="/admin">Acceder a l'interface d'administration</a></p>
  `);
});

app.listen(PORT, () => {
  logger.info(`Serveur Karambig Roogo demarre sur le port ${PORT}`);
  logger.info(`Interface admin disponible sur http://localhost:${PORT}/admin`);
});
