frontend/
├── Dockerfile --> Configuration Docker
├── index.html
├── nginx.conf
├── package.json --> Fichier de configuration de l'application
├── package-lock.json
├── public
│   ├── icon.png
│   └── logo.png
├── README.md
├── src
│   ├── App.jsx --> Route principale de l'application
│   ├── components
│   │   ├── Common
│   │   │   └── ConfirmModal.jsx --> Modale de confirmation
│   │   ├── Dashboard
│   │   │   ├── AlertsDropdown.jsx --> Menu déroulant des alerts de métrique
│   │   │   ├── AlertsPanel.jsx --> Affichage de chaque alert
│   │   │   ├── Dashboard.jsx --> Tableau de bord principale
│   │   │   ├── HistoryBoard.jsx --> Tableau d'historique pour chaque serveur selectionner
│   │   │   ├── HistoryModal.jsx
│   │   │   ├── MetricChart.jsx --> Graphique de chaque serveur selectionner
│   │   │   └── ServerCard.jsx --> Affichage de chaque serveur
│   │   └── Servers
│   │   ├── AddServerModal.jsx --> Modal d'ajout d'un nouveau serveur
│   │   └── EditServerModal.jsx --> Modal d'édition d'un serveur existant
│   ├── main.jsx
│   ├── services
│   │   └── api.js --> Service qui gère les routes
│   └── utils
│   └── dateUtils.js --> Formatage de la date
└── vite.config.js
