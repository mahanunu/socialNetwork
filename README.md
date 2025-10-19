# Avant de commencer

Nous avons rencontrés des problèmes avec la partie statistiques et consultations, le back fonctionnais de mon côté mais pas celui de mahalia. Sur le vercel front nous avons donc uniquement la premère partie du projet mais nous avons tout de même conservé le code. 

# Social Network - Projet Fullstack

Un réseau social moderne construit avec React, Node.js, Express et MongoDB.

## Fonctionnalités

- **Authentification** : Inscription, connexion et gestion de session avec JWT
- **Gestion de profil** : Visualisation et modification du profil utilisateur
- **Publications** : Création, modification et suppression de posts
- **Interactions** : Système de likes et commentaires sur les posts
- **Commentaires de profil** : Possibilité de commenter sur les profils d'autres utilisateurs
- **Statistiques** : Affichage des statistiques utilisateur (posts, likes, commentaires)

## Technologies utilisées

### Frontend
- **React** 18.3.1 - Bibliothèque UI
- **React Router** 7.1.1 - Navigation
- **Vite** 6.0.1 - Build tool et dev server
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web (via Vercel)
- **MongoDB** - Base de données NoSQL
- **Mongoose** 8.8.4 - ODM pour MongoDB
- **JWT** - Authentification
- **bcryptjs** 2.4.3 - Hashing des mots de passe

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 16 ou supérieure)
- **npm** ou **yarn** ou **pnpm**
- **MongoDB** (local ou Atlas)
- **Git**

## Installation

### 1. Cloner le repository

```bash
git clone <url-du-repo>
cd socialNetwork
```

### 2. Installer les dépendances backend

```bash
cd backend
npm install
```

### 3. Installer les dépendances frontend

```bash
cd ../frontend
npm install
```

### 4. Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend` avec les variables suivantes :

```env
MONGO_URI=<votre-URI-MongoDB>
```

### 5. Démarrer le serveur backend

```bash
cd backend
npm run dev
```

### 6. Démarrer l'application frontend

```bash
cd ../frontend
npm run dev
```

## Configuration

### Variables d'environnement

Le projet utilise des variables d'environnement pour la configuration :

- `MONGO_URI` : URI de connexion à MongoDB

## Démarrage

Une fois l'installation terminée :

1. Démarrez le backend : `npm run dev` dans le dossier `backend`
2. Démarrez le frontend : `npm run dev` dans le dossier `frontend`
3. Accédez à l'application sur `http://localhost:5173`

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur

### Posts
- `GET /api/posts` - Liste des posts
- `POST /api/posts` - Créer un post
- `PUT /api/posts/:id` - Modifier un post
- `DELETE /api/posts/:id` - Supprimer un post
- `POST /api/posts/:id/like` - Liker un post
- `POST /api/posts/:id/comment` - Commenter un post
- `GET /api/users/posts` - statistiques des posts

### Profils
- `GET /api/profiles/:userId` - Profil utilisateur
- `PUT /api/profiles/:userId` - Modifier le profil
- `POST /api/profiles/:userId/comment` - Commenter un profil

## Déploiement

Le projet peut être déployé sur Vercel pour le frontend et le backend.

### Déploiement frontend 
1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Déploiement backend 
1. Configurez le build script dans `package.json`
2. Configurez les variables d'environnement
3. Déployez automatiquement
