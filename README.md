# Projet de supervision de Serveurs à distance et à temps réel 🖥️

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/bendev99/projet-apmf)](https://github.com/bendev99/projet-apmf)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/bendev99/projet-apmf)

Bienvenue dans **APMF Monitoring** (Application de Monitoring de Performance d'un Serveur, càs de l'APMF), une solution open-source pour superviser les performances de vos serveurs en temps réel ! 🌟 Collectez, stockez et visualisez les métriques système (CPU, mémoire, disque, température) avec une interface moderne et des services backend robustes.

---

## Introduction 🚀

C'est une application modulaire conçue pour surveiller un ou plusieurs serveurs, qu'ils soient locaux ou distants. Avec un frontend React intuitif, un backend Flask performant et des collecteurs de métriques légers, ce projet vous permet de garder un œil sur vos systèmes en quelques clics. 📊

- **Frontend** : Visualisez les métriques via des graphiques interactifs, un tableau paginé et un export CSV.
- **Backend** : Une API REST Flask connectée à MongoDB pour stocker et servir les données.
- **Collecteurs** : Scripts Python déployés sur chaque serveur pour collecter les métriques en temps réel.

C'est **open-source**, alors n'hésitez pas à contribuer ou personnaliser selon vos besoin ! 🙌

---

## ⚙️ Architecture

Ce projet repose sur trois piliers :

- **Frontend React** : Interface utilisateur avec authentification, graphiques (Chart.js), et tableau historique.
- **Backend Flask** : API REST pour récupérer les métriques depuis MongoDB.
- **Collecteurs de métriques** : Scripts Python utilisant `psutil` pour collecter les données système.

### Technologies utilisées

- **Frontend** : React 19, Vite, Tailwind CSS, Material-UI, Chart.js, React Router, React Hot Toast
- **Backend** : Flask, PyMongo, psutil, python-dotenv
- **Base de données** : MongoDB
- **Conteneurisation** : Docker, Docker Compose
- **Déploiement** : Nginx (frontend), Python 3.12 (backend/collecteurs)

---

## 📁 Structure du Projet

```plaintext
projet-apmf/
├── backend/
│   ├── app.py                 # API Flask principale
│   ├── server.py              # Collecteur local (optionnel)
│   ├── requirements.txt       # Dépendances Python
│   ├── Dockerfile             # API Flask
│   └── Dockerfile.server      # Collecteur local
├── frontend/
│   ├── public/                # Fichiers statiques
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx  # Tableau de bord (graphiques, export)
│   │   │   ├── Login.jsx      # Page de connexion
│   │   │   ├── SecureRoutes.jsx # Protection des routes
│   │   │   ├── Tableau.jsx    # Tableau paginé
│   │   │   └── utils.jsx      # Configurations Chart.js
│   │   ├── App.jsx            # Routage
│   │   └── main.jsx           # Point d'entrée
│   ├── package.json           # Dépendances frontend
│   └── Dockerfile             # Build React + Nginx
├── server_collector/
│   ├── .env                   # MONGODB_URI
│   ├── server.py              # Collecteur distant
│   ├── requirements.txt       # Dépendances Python
│   ├── docker-compose.yml     # Orchestration distants
│   └── Dockerfile             # Collecteur distant
├── docker-compose.yml         # Orchestration globale
└── .env                       # MONGODB_URI global
```

---

## ✨ Fonctionnalités

- **Collecte en temps réel** : Métriques (CPU, mémoire, disque, température) collectées toutes les 5 secondes. ⏱️
- **Visualisation** : Graphiques en ligne (CPU/mémoire) et camembert (disque), tableau paginé (7 lignes/page). 📈
- **Export CSV** : Téléchargez l'historique des métriques en format CSV (dates en français). 📄
- **Multi-serveurs** : Supervisez plusieurs serveurs avec des `SERVER_ID` uniques définis dans `docker-compose.yml`. 🌐
- **Authentification** : Connexion basique (`admin`/`admin`) avec routes protégées. 🔒
- **Conteneurisation** : Déploiement facile avec Docker Compose. 🐳

---

## 📋 Prérequis

- **Docker** et **Docker Compose** (pour conteneurisation)
- **Node.js 18** (développement local frontend)
- **Python 3.12** (développement local backend/collecteurs)
- **MongoDB** (instance locale ou cloud, ex. : MongoDB Atlas)
- Compte par défaut : `admin`/`admin` (configurable dans `frontend/src/components/Login.jsx`)

---

## 🛠️ Instructions

1. **Cloner le dépôt** :

   ```bash
   git clone https://github.com/bendev99/projet-apmf.git
   cd projet-apmf
   ```

2. **Configurer les variables d'environnement** :

   - À la racine (`projet-apmf/.env`) :
     ```plaintext
     MONGODB_URI=<votre-uri-mongodb>
     ```
   - Dans `server_collector/.env` :
     ```plaintext
     MONGODB_URI=<votre-uri-mongodb>
     ```
   - ⚠️ **Ne définissez pas `SERVER_ID` dans `.env`** : Il est configuré dans les fichiers `docker-compose.yml`.

3. **Configurer les identifiants de serveurs** :

   - **Collecteur local** (optionnel, pour superviser le serveur hébergeant l'API) :
     Modifiez `projet-apmf/docker-compose.yml` :
     ```yaml
     services:
       collector:
         environment:
           - MONGODB_URI=${MONGODB_URI}
           - SERVER_ID=server1 # ID unique pour le collecteur local
     ```
     _Note_ : Si vous ne supervisez pas le serveur local, supprimez le service `collector`, `backend/server.py`, et `backend/Dockerfile.server`.
   - **Collecteurs distants** :
     Modifiez `server_collector/docker-compose.yml` pour chaque serveur distant :
     ```yaml
     services:
       collector:
         environment:
           - MONGODB_URI=${MONGODB_URI}
           - SERVER_ID=server2 # ID unique pour chaque serveur distant
     ```

4. **Démarrer les services** :

   - Frontend, backend, et collecteur local (si utilisé) :
     ```bash
     cd projet-apmf
     docker-compose up --build
     ```
   - Collecteur distant (sur une autre machine) :
     ```bash
     cd projet-apmf/server_collector
     docker-compose up --build
     ```

5. **Accéder à l'application** :
   - Frontend : `http://localhost:80`
   - API : `http://localhost:5000`
   - Connectez-vous avec `admin`/`admin`.

---

## 🖥️ Utilisation

1. **Connexion** : Utilisez `admin`/`admin` pour accéder au tableau de bord. 🔑
2. **Supervision** :
   - Choisissez un serveur dans le menu déroulant. 🖱️
   - Visualisez les graphiques (CPU, mémoire, disque) mis à jour toutes les 5 secondes. 📊
   - Parcourez l'historique dans le tableau paginé. 📋
3. **Export** : Cliquez sur "Télécharger l'historique" pour un CSV. 📥
4. **Déconnexion** : Utilisez l'icône en bas à droite. 🚪

### Apercu de la tableau de bord de l'application

![Screenshot](https://imgur.com/a/xHaFt5d)

---

## 🔧 Développement Local

### Frontend

1. Accédez au dossier :
   ```bash
   cd frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

### Backend

1. Accédez au dossier :
   ```bash
   cd backend
   ```
2. Créez un environnement virtuel et installez les dépendances :
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   .\venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   ```
3. Lancez l'API :
   ```bash
   python app.py
   ```

### Collecteur

1. Accédez au dossier `server_collector` (ou `backend` pour le collecteur local) :
   ```bash
   cd server_collector
   ```
2. Configurez `.env` (seulement `MONGODB_URI`) et installez les dépendances.
3. Définissez `SERVER_ID` et lancez :
   ```bash
   export SERVER_ID=server2  # Linux/Mac, ID unique
   python server.py
   ```
   Ou, pour Windows :
   ```bash
   set SERVER_ID=server2
   python server.py
   ```

---

## ⚠️ Problèmes Connus

- **Authentification** : Basée sur localStorage (`admin`/`admin`), vulnérable. Envisagez une authentification JWT.
- **Collecteurs** : Les scripts `server.py` incluent une instance Flask inutile (port 5001, sans routes). Simplifiez-les pour réduire les ressources.
- **Performance** : L'endpoint `/api/all_data` peut être lent avec beaucoup de données. Ajoutez une pagination optionnelle.

---

## 🌟 Fonctionnalités à Implémenter

- Implémenter une authentification JWT. 🔐
- Ajouter des alertes (ex. : toast si CPU > 90%). 🚨
- Supporter des graphiques multi-serveurs comparatifs. 📈
- Indexer `server_id` et `timestamp` dans MongoDB pour des requêtes plus rapides. ⚡
- Ajouter des tests unitaires (Jest pour frontend, pytest pour backend). ✅

---

## 🤝 Contribuer

1. Forkez le dépôt. 🍴
2. Créez une branche : `git checkout -b feature/nouvelle-fonctionnalite`. 🌿
3. Soumettez une pull request avec une description claire. 📬

---

## 📜 Licence

Ce projet est sous licence ![MIT](https://img.shields.io/badge/license-MIT-blue.svg). Vous êtes libre de l’utiliser, modifier et distribuer selon les termes de cette licence.

---

## ❤️ Soutenir le Projet

Si ce projet vous aide, partagez-le ou contribuez ! Des idées ou du feedback ? Contactez-moi sur :

- [WhatsApp](https://wa.me/+261343786570)
- [Telegram](https://t.me/+261343786570)
- [Gmail](mailto:benbenedictin@gmail.com)

Pour un petit geste de soutien, vous pouvez envoyer un don à :

```plaintext
0331725084 (Airtel Money)
0343786570 (Mvola)
Tsahatsy Benedictin
```

Merci beaucoup pour votre attention ! 🙏
