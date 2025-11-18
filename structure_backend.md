<!--  -->

backend/
├── app.py --> Point d'entré
├── config.py --> Configuration
├── Dockerfile --> Configuration Docker
├── entrypoint.sh --> Point d'entée pour la collecte des métriques
├── models
│   ├── target.py --> Modèle des serveurs enregistré dans la base de donner
│   └── user.py --> Modèle utilisateur
├── requirements.txt --> Paquage nécessaire pour le fonctionnement du projet
├── routes
│   ├── alerts.py |
│   ├── auth.py | Configuration des routes API
│   ├── metrics.py |
│   └── targets.py |
├── ssh_install.sh --> Fichier d'nstallation de ssh sur le serveur distant
├── ssh_keys --> Dossier contenant la clé ssh à installer
└── utils
└── db.py --> Configuration de la base de donner
