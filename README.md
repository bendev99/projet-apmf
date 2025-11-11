# 🖥️ APMF Monitoring - Supervision d'un ou plusieurs serveur à distance

Une plateforme web complète de monitoring en temps réel pour serveurs Linux avec interface moderne, alertes intelligentes et historique détaillé des performances.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.13-blue.svg)
![React](https://img.shields.io/badge/react-18.3-blue.svg)
![Flask](https://img.shields.io/badge/flask-3.0-green.svg)

---

## 📋 Table des Matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Déploiement](#-déploiement)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contribution](#-contribution)
- [License](#-license)

---

## 🎯 Aperçu

APMF est une solution de monitoring complète permettant de surveiller en temps réel les performances de vos serveurs Linux distants via SSH. Le système collecte automatiquement les métriques (CPU, RAM, disque, température, réseau) et génère des alertes intelligentes lorsque des seuils critiques sont atteints.

### Cas d'Usage

- Surveillance d'infrastructures multi-serveurs
- Monitoring de serveurs de production en temps réel
- Analyse historique des performances
- Gestion proactive des incidents avec système d'alertes
- Tableaux de bord personnalisables

---

## ✨ Fonctionnalités

### 🔍 Monitoring en Temps Réel

- **Métriques système complètes** : Utilisation CPU (%),Température CPU (°C), Utilisation RAM (%), Utilisatio Disque (%)
- **Graphiques interactifs** : Visualisation en temps réel avec Chart.js
- **Historique détaillé** : Conservation de toutes les métriques avec requêtes personnalisées
- **Collecte automatique** : Intervalle configurable (défaut : 15 secondes)

### 🚨 Système d'Alertes

- **Alertes intelligentes** : Détection automatique des anomalies
- **Seuils configurables** : Personnalisation par serveur
- **Notifications en temps réel** : Badge et dropdown d'alertes
- **Niveaux de sévérité** : Warning, Critical, Info
- **Historique des alertes** : Traçabilité complète

### 🎨 Interface Utilisateur

- **Dashboard moderne** : Interface responsive avec Tailwind CSS
- **Cartes serveurs** : Statut visuel en temps réel
- **Graphiques en temps réel** : Courbes de performance interactives
- **Tableau d'historique** : Filtrage et export des données
- **Authentification sécurisée** : JWT tokens avec refresh automatique

### 🔐 Sécurité

- **Authentification JWT** : Sessions sécurisées avec tokens
- **Connexions SSH chiffrées** : Communication sécurisée avec les serveurs
- **Gestion des rôles** : Admin / User
- **Mots de passe hashés** : bcrypt pour le stockage sécurisé
- **CORS configuré** : Protection contre les attaques XSS

---

### Composants

1. **Frontend** : Application React avec Vite
2. **Backend** : API REST Flask avec JWT
3. **Collector** : Service Python de collecte de métriques via SSH
4. **Database** : MongoDB Atlas pour le stockage des données
5. **Serveurs Monitorés** : Machines Linux accessibles via SSH

---

## 🛠️ Technologies

### Frontend

- **React 18.3** : Framework UI
- **Vite 5.4** : Build tool et dev server
- **Tailwind CSS** : Framework CSS utilitaire
- **Chart.js / Recharts** : Graphiques interactifs
- **Axios** : Client HTTP
- **React Router** : Navigation SPA
- **React Toastify** : Notifications

### Backend

- **Flask 3.0** : Framework web Python
- **Flask-JWT-Extended** : Authentification JWT
- **Flask-CORS** : Gestion des CORS
- **PyMongo** : Driver MongoDB
- **Gunicorn** : Serveur WSGI production
- **python-dotenv** : Gestion des variables d'environnement

### Collector

- **Paramiko** : Connexions SSH
- **psutil** : Collecte de métriques système
- **Requests** : Client HTTP
- **Schedule** : Tâches périodiques

### Database

- **MongoDB Atlas** : Base de données cloud NoSQL

---

## 📦 Prérequis

### Système

- **Python** : 3.11+ (recommandé : 3.13)
- **Node.js** : 18+ (recommandé : 22 LTS)
- **npm** : 9+
- **Git** : Pour cloner le repository

### Services

- **MongoDB Atlas** : Compte gratuit ou compte MongoDB local
- **Serveurs Linux** : Accessibles via SSH avec clés publiques

### Accès SSH

Les serveurs à monitorer doivent :

- Avoir SSH activé (port 22 ou personnalisé)
- Accepter l'authentification par clé publique
- Avoir les commandes système disponibles : `top`, `df`, `free`, `sensors`

---

## 🚀 Installation

### 1. Cloner le Repository

`git clone https://github.com/bendev99/projet-apmf.git`
`cd projet-apmf`

### 2. Configuration Backend

`cd backend`

Créer un environnement virtuel
`python3 -m venv venv`
`source venv/bin/activate`

Installer les dépendances
`pip install -r requirements.txt`

### 3. Configuration Collector

`cd collector`

Créer un environnement virtuel
`python3 -m venv venv`
`source venv/bin/activate`

Installer les dépendances
`pip install -r requirements.txt`

### 4. Configuration Frontend

`cd frontend`

Installer les dépendances
`npm install`

---

## ⚙️ Configuration

### 1. Variables d'Environnement

Créez 3 fichier `.env` :

1. `backend/.env` :
   `
   **# MongoDB**
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/db-name?retryWrites=true&w=majority

   **# JWT**
   JWT_SECRET_KEY=votre_cle_secrete_jwt_32_caracteres_minimum
   <!-- # Générer des clés sécurisées :
         `openssl rand -hex 32` -->

   **# API**
   PORT=5000
   ALLOWED_ORIGINS=http://localhost:5173

   **# Admin par défaut**
   DEFAULT_ADMIN_USERNAME=username
   DEFAULT_ADMIN_PASSWORD=password
   DEFAULT_ADMIN_EMAIL=exemple@email.com
   `

2. `collector/.env` :
   `
   **# MongoDB Atlas**
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/db-name?retryWrites=true&w=majority

   **# Backend API**
   BACKEND_URL=http://localhost:5000

   **# SSH Configuration**
   SSH_USER=apmf
   SSH_KEY_PATH=~/.ssh/apmf_key

   **# Collector Settings**
   POLL_INTERVAL_SECONDS=15
   POLL_MAX_WORKERS=4

   **# Logging**
   LOG_LEVEL=INFO
   `

3. `frontend/.env` :
   **# Backend API**
   VITE_API_URL=http://localhost:5000

### 2. Configuration MongoDB

#### MongoDB Atlas

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un cluster gratuit
3. Créer un utilisateur de base de données
4. Ajouter votre IP à la whitelist
5. Copier l'URI de connexion dans `.env`

---

### 3. Configuration de l'admin

1. Ouvrez le fichier `backend/fix_admin.py`
2. Reperer la ligne `Création nouvel admin...`
3. Changer `username` et `password`
4. Execute la commande :
   `source venv/bin/activate`
   `python fix_admin.py`
5. Si tout va bien, vous devriez voir un message : `✅ Admin créé avec succès!`

---

## Connexion SSH

### Pour un serveur distant

#### 1. Création de l'utilisateur de supervision

1. Connecter au serveur distant via ssh :
   `ssh debian@<ip-du-serveur-distant>` <!-- Puis entrer le mot de passe de l'utilsateur  -->
2. Créer un utilisateur unique pour la supervision (sur tout les serveur à surveiller)
   `sudo adduser --disabled-password --gecos "APMF Monitoring User" apmf`
3. Ajouter l'utilisateur au groupe sudo
   `sudo usermod -aG sudo apmf`

#### 2. Création d'une clée SSH pour le collecteur (sur la machine de supervision)

4. Générer un clé SSH sur la machine locale (machine de supervision)
   `ssh-keygen -t ed25519 -C "apmf-collector" -f ~/.ssh/apmf_key`
5. Afficher la clée SSH pour la copier
   `cat ~/.ssh/apmf_key.pub`
   <!-- Copier tout le code, ex : "ssh-ed25519 AAAC3NzaC1lZDI1NTE5AAAAIPO2blKLXamhVoCYkLTdYyWcX9lWcsKWgTmAE8v6idhe apmf-collector" -->

#### 3. Connecter sur le serveur distant à surveiller pour coller la clée

6. Connexion SSH
   `ssh debian@<ip-serveur-distant>`
7. Créer le dossier .ssh pour l'utilisateur apmf
   `sudo mkdir -p /home/apmf/.ssh`
   `sudo chmod 700 /home/apmf/.ssh`
8. Ajouter la clé publique dans `authorized_keys`
   `sudo nano /home/apmf/.ssh/authorized_keys`
9. Colle le contenu de ta clé publique (copié à l'étape 5) dans ce fichier, puis sauvegarde et ferme :
   `ctrl+o` : pour sauvegarder
   `Entrer` : pour confirmer
   `ctrl+x` : pour quitter l'editeur
10. Donner les permissions nécessaire
    `sudo chmod 600 /home/apmf/.ssh/authorized_keys`
    `sudo chown -R apmf:apmf /home/apmf/.ssh`
11. Quitter la connexion SSH
    `exit`
12. Tester la connexion SSH sans mot de passe
    `ssh -i ~/.ssh/apmf_key apmf@<ip-serveur-distant> "uptime"`
    <!-- Si la sortie de la commande uptime apparaît sans qu'aucun mot de passe ne soit demandé -->
    <!-- Ca veut dire que la connexion a réussi ! -->

### Pour le PC locale (PC de supervision)

#### Création de l'utilisateur de supervision

1. Créer un utilisateur unique pour la supervision (sur tout les serveur à surveiller)
   `sudo adduser --disabled-password --gecos "APMF Monitoring User" apmf`
2. Ajouter l'utilisateur au groupe sudo
   `sudo usermod -aG sudo apmf`
3. Générer un clé SSH sur la machine de supervision (ne plus faire si vous l'avez déjà executer avant)
   `ssh-keygen -t ed25519 -C "apmf-collector" -f ~/.ssh/apmf_key`
4. Afficher la clée SSH pour la copier
   `cat ~/.ssh/apmf_key.pub`
   <!-- Copier tout le code, ex : "ssh-ed25519 AAAC3NzaC1lZDI1NTE5AAAAIPO2blKLXamhVoCYkLTdYyWcX9lWcsKWgTmAE8v6idhe apmf-collector" -->
5. Créer le dossier .ssh pour l'utilisateur apmf
   `sudo mkdir -p /home/apmf/.ssh`
   `sudo chmod 700 /home/apmf/.ssh`
6. Ajouter la clé publique dans `authorized_keys`
   `sudo nano /home/apmf/.ssh/authorized_keys`
7. Colle le contenu de ta clé publique (copié à l'étape 5) dans ce fichier, puis sauvegarde et ferme :
   `ctrl+o` : pour sauvegarder
   `Entrer` : pour confirmer
   `ctrl+x` : pour quitter l'editeur
8. Donner les permissions nécessaire
   `sudo chmod 600 /home/apmf/.ssh/authorized_keys`
   `sudo chown -R apmf:apmf /home/apmf/.ssh`

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créer une branche** : `git checkout -b feature/AmazingFeature`
3. **Commit** vos changements : `git commit -m 'Add some AmazingFeature'`
4. **Push** vers la branche : `git push origin feature/AmazingFeature`
5. **Ouvrir une Pull Request**

### Guidelines

- Suivre les conventions de code Python (PEP 8) et JavaScript (ESLint)
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation si nécessaire
- Décrire clairement les changements dans la PR

---

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Auteurs

- **BenDev** - _Développeur Principal_ - [BenDev](https://github.com/bendev99/)

---

## 🙏 Remerciements

- [Flask](https://flask.palletsprojects.com/) - Framework web Python
- [React](https://react.dev/) - Bibliothèque UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [MongoDB](https://www.mongodb.com/) - Base de données NoSQL
- [Chart.js](https://www.chartjs.org/) - Bibliothèque de graphiques
- [Paramiko](https://www.paramiko.org/) - Implémentation SSH Python

---

## 📞 Contact

Pour toute question ou suggestion :

- **Email** : [benbenedictin@gmail.com](mailto:benbenedictin@gmail.com)
- **WhatsApp** : [+261343786570](http://wa.me/+261343786570)
- **Telegram** : [+261343786570](http://t.me/+261343786570)

---

<div align="center">

**⭐ Si ce projet vous a aidé, n'hésitez pas à lui donner une étoile ! ⭐**

</div>

### Un petit cadeau m'aiderai également

**AirtelMoney** : 0331725084 (Tsahatsy Benedictin)
**Mvola** : 0343786570 (Tsahatsy Benedictin)

<div align="center">

Made with ❤️ by [BenDev]

</div>
