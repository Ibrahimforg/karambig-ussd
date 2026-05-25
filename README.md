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

### 3. Créer un Web Service sur Render
- Dashboard → New → Web Service
- Connectez votre repository GitHub
- Configurez :
  - **Name**: karambig-ussd
  - **Branch**: main
  - **Runtime**: Node
  - **Build Command**: `npm install`
  - **Start Command**: `node index.js`

### 4. Configurer les variables d'environnement
Dans Render → Web Service → Environment, ajoutez :

```
AT_USERNAME=sandbox
AT_API_KEY=votre_cle_api_africastalking
AT_SENDER_ID=KarambigRoogo
PORT=3000
DB_HOST=votre_host_postgresql
DB_PORT=5432
DB_NAME=karambig_ussd
DB_USER=votre_user_postgresql
DB_PASSWORD=votre_password_postgresql
ADMIN_USERNAME=admin
ADMIN_PASSWORD=votre_mot_de_passe_admin
SESSION_SECRET=votre_cle_secrete_session
```

### 5. Configurer PostgreSQL sur Render
- Créez une base de données PostgreSQL sur Render
- Copiez les informations de connexion
- Mettez à jour les variables d'environnement

### 6. Initialiser la base de données
Une fois déployé, exécutez les commandes SQL dans la base de données Render :
- Contenu de `db/schema.sql`
- Contenu de `db/seed.sql`

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

## Support

Pour toute question, contactez : ibrahimforgo59@gmail.com
