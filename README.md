# Karambig Roogo - Système USSD/SMS

Système éducatif USSD/SMS pour le partage de cours et corrigés académiques au Burkina Faso.

## Déploiement sur Render

### 1. Créer un compte Render
- Allez sur https://render.com
- Créez un compte gratuit avec GitHub

### 2. Push le code sur GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/karambig-ussd.git
git push -u origin main
```

### 3. Créer une base de données PostgreSQL sur Render
- Dashboard → New → PostgreSQL
- Configurez la base de données
- Copiez le **Internal Database URL** (format : `postgresql://user:password@host/database`)

### 4. Initialiser la base de données
Exécutez localement un script pour initialiser la base avec le schema et les données :
```bash
node -e "
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: 'VOTRE_DATABASE_URL', ssl: { rejectUnauthorized: false } });
(async () => {
  await pool.query(fs.readFileSync('./db/schema.sql', 'utf8'));
  await pool.query(fs.readFileSync('./db/seed.sql', 'utf8'));
  console.log('Base de données initialisée');
  await pool.end();
})();
"
```

### 5. Créer un Web Service sur Render
- Dashboard → New → Web Service
- Connectez votre repository GitHub
- Configurez :
  - **Name**: karambig-ussd
  - **Branch**: main
  - **Runtime**: Node
  - **Build Command**: `npm install`
  - **Start Command**: `node index.js`

### 6. Configurer les variables d'environnement
Dans Render → Web Service → Environment, ajoutez :

```
AT_USERNAME=sandbox
AT_API_KEY=votre_cle_api_africastalking
AT_SENDER_ID=KarambigRoogo
PORT=3000
DATABASE_URL=postgresql://user:password@host/database
ADMIN_USERNAME=admin
ADMIN_PASSWORD=votre_mot_de_passe_admin
SESSION_SECRET=votre_cle_secrete_session
```

### 7. Configurer AfricasTalking
- Allez sur https://sandbox.africastalking.com
- Configurez l'URL de callback USSD : `https://votre-app-render.onrender.com/ussd`
- Configurez l'URL de callback SMS : `https://votre-app-render.onrender.com/sms`

## Fonctionnalités

- Interface d'administration complète
- Gestion des cours et corrigés
- Système USSD interactif
- Envoi de SMS automatique
- Base de données PostgreSQL
- Historique des SMS envoyés

## Support

Pour toute question, contactez : ibrahimforgo59@gmail.com
