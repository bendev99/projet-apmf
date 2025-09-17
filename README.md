APMF - Application de Supervision de Serveurs
APMF (Application de Monitoring de Performance) est une solution modulaire pour superviser les performances des serveurs en temps réel. Elle permet de collecter, stocker et visualiser les métriques système (CPU, mémoire, disque, température) via une interface utilisateur moderne et des services backend robustes.
📋 Architecture
L'application suit une architecture modulaire avec trois composants principaux :

Frontend React : Interface utilisateur responsive pour visualiser les métriques via des graphiques interactifs, un tableau paginé et un export CSV. Inclut une authentification basique.
Backend Flask : API REST pour gérer les métriques, stockées dans MongoDB, et fournir des données aux clients.
Collecteurs de métriques : Scripts Python déployés sur des serveurs distants pour collecter les données système et les envoyer à la base de données.

Technologies utilisées

Frontend : React 19, Vite, Tailwind CSS, Material-UI, Chart.js, React Router, React Hot Toast
Backend : Flask, MongoDB (via PyMongo), psutil, python-dotenv
Conteneurisation : Docker, Docker Compose
Base de données : MongoDB
Déploiement : Nginx (pour le frontend), Python 3.12 (backend et collecteurs)

📁 Structure du Projet
projet-apmf/
├── backend/
│ ├── app.py # API Flask principale
│ ├── server.py # Collecteur de métriques local
│ ├── requirements.txt # Dépendances Python
│ ├── Dockerfile # Pour l'API Flask
│ └── Dockerfile.server # Pour le collecteur local
├── frontend/
│ ├── public/ # Fichiers statiques
│ ├── src/
│ │ ├── components/
│ │ │ ├── Dashboard.jsx # Tableau de bord avec graphiques et export
│ │ │ ├── Login.jsx # Page de connexion
│ │ │ ├── SecureRoutes.jsx # Protection des routes
│ │ │ ├── Tableau.jsx # Tableau paginé des métriques
│ │ │ └── utils.jsx # Configurations Chart.js
│ │ ├── App.jsx # Routage principal
│ │ └── main.jsx # Point d'entrée React
│ ├── package.json # Dépendances frontend
│ └── Dockerfile # Build React + Nginx
├── server_collector/
│ ├── .env # Variables d'environnement (MONGODB_URI)
│ ├── server.py # Collecteur pour serveurs distants
│ ├── requirements.txt # Dépendances Python
│ ├── docker-compose.yml # Orchestration pour collecteurs distants
│ └── Dockerfile # Pour le collecteur distant
├── docker-compose.yml # Orchestration globale (frontend, backend, collecteur local)
└── .env # Variables d'environnement globales (MONGODB_URI)

🚀 Fonctionnalités

Collecte en temps réel : Les métriques (CPU, mémoire, disque, température) sont collectées toutes les 5 secondes par les collecteurs et stockées dans MongoDB.
Visualisation : Graphiques (lignes pour CPU/mémoire, camembert pour disque) et tableau paginé avec historique.
Export CSV : Téléchargement des données historiques au format CSV avec dates localisées (fr-FR).
Authentification : Connexion basique (admin/admin) avec protection des routes via localStorage.
Multi-serveurs : Supporte plusieurs serveurs via l'identifiant server_id, défini dans docker-compose.yml (local et distant), avec sélecteur dans l'interface.
Conteneurisation : Déploiement simplifié avec Docker et Docker Compose.

📋 Prérequis

Docker et Docker Compose (pour conteneurisation)
Node.js 18 (pour développement local du frontend)
Python 3.12 (pour développement local du backend/collecteurs)
MongoDB (instance locale ou cloud, ex. : MongoDB Atlas)
Compte utilisateur avec admin/admin pour l'authentification (configurable dans frontend/src/components/Login.jsx)

🛠️ Installation

Cloner le dépôt :
git clone <url-du-dépôt>
cd projet-apmf

Configurer les variables d'environnement :

Créez un fichier .env à la racine avec :MONGODB_URI=<votre-uri-mongodb>

Créez un fichier .env dans server_collector/ avec :MONGODB_URI=<votre-uri-mongodb>

Configurer les identifiants de serveurs :

Pour le collecteur local, modifiez projet-apmf/docker-compose.yml :services:
collector:
environment: - MONGODB_URI=${MONGODB_URI} - SERVER_ID=server1 # ID unique pour le collecteur local

Pour les collecteurs distants, modifiez server_collector/docker-compose.yml :services:
collector:
environment: - MONGODB_URI=${MONGODB_URI} - SERVER_ID=server2 # ID unique pour chaque serveur distant

Démarrer les services avec Docker Compose :

Pour le frontend, backend et collecteur local :
cd projet-apmf
docker-compose up --build

Pour un collecteur distant (sur une autre machine) :
cd projet-apmf/server_collector
docker-compose up --build

Accès :

Frontend : http://localhost:80
Backend API : http://localhost:5000
Collecteur : Actif en arrière-plan (port 5001, mais pas de routes actives)

Accéder à l'application :

Ouvrez http://localhost dans un navigateur.
Connectez-vous avec admin/admin.

🖥️ Utilisation

Connexion : Utilisez les identifiants par défaut (admin/admin) pour accéder au tableau de bord.
Supervision :
Sélectionnez un serveur dans le menu déroulant pour filtrer les métriques.
Consultez les graphiques (CPU, mémoire, disque) mis à jour toutes les 5 secondes.
Utilisez le tableau paginé pour explorer l'historique (7 lignes par page).

Export : Cliquez sur "Télécharger l'historique" pour obtenir un CSV des métriques.
Déconnexion : Utilisez l'icône en bas à droite pour vous déconnecter.

🔧 Développement Local
Frontend

Accédez au dossier frontend :cd frontend

Installez les dépendances :npm install

Lancez le serveur de développement :npm run dev

Backend

Accédez au dossier backend :cd backend

Créez un environnement virtuel et installez les dépendances :python -m venv venv
source venv/bin/activate # Linux/Mac
.\venv\Scripts\activate # Windows
pip install -r requirements.txt

Lancez l'API :python app.py

Collecteur

Accédez au dossier server_collector :cd server_collector

Configurez .env (seulement MONGODB_URI) et installez les dépendances (comme pour le backend).
Lancez le Roset avec un identifiant unique :SERVER_ID=server2 python server.py

📈 Améliorations Possibles

Sécurité : Implémenter une authentification JWT via l'API (remplacer localStorage).
Performance : Ajouter des index MongoDB sur server_id et timestamp pour accélérer les requêtes.
UX : Intégrer des alertes (ex. : toast si CPU > 90%) et des graphiques comparatifs multi-serveurs.
Tests : Ajouter des tests unitaires (Jest pour frontend, pytest pour backend).
Déploiement : Configurer un reverse proxy Nginx pour HTTPS et gérer les routes SPA.

🤝 Contributions
Les contributions sont les bienvenues ! Veuillez :

Forker le dépôt.
Créer une branche (git checkout -b feature/nouvelle-fonctionnalite).
Soumettre une pull request avec une description claire.

📜 Licence
Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
