# 🖥️ APMF Monitoring
### *Supervision complète de serveurs Linux distants — en temps réel*

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.13-blue.svg)
![React](https://img.shields.io/badge/react-18.3-blue.svg)
![Flask](https://img.shields.io/badge/flask-3.0-green.svg)

<p align="center">
  <img src="./assets/banner.svg" alt="APMF Monitoring Banner" width="100%"/>
</p>

> **APMF Monitoring** est une plateforme web de **monitoring en temps réel** pour serveurs Linux via SSH, avec **alertes intelligentes**, **tableaux de bord modernes** et **historique des performances**.

---

## 📖 Table des matières
- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation rapide](#-installation-rapide)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Déploiement (prod)](#-déploiement-prod)
- [Contribution](#-contribution)
- [License](#-license)
- [Auteur & Contact](#-auteur--contact)

---

## 🎯 Aperçu

- Surveillance multi-serveurs (CPU, RAM, disque, température, réseau)
- Graphiques en temps réel et **historique consultable**
- **Alertes** (Info/Warning/Critical) avec seuils configurables
- **JWT** + rôles *(Admin/User)*, **SSH** par clé, **MongoDB Atlas**

---

## ✨ Fonctionnalités

### 🔍 Monitoring en temps réel
- Mesures système complètes : **CPU / RAM / Disque / Température / Réseau**
- Graphiques dynamiques (**Chart.js / Recharts**)
- Intervalle de collecte configurable (défaut **15 s**)

### 🚨 Alertes intelligentes
- Détection d'anomalies, seuils par serveur
- Notifications instantanées, historique des alertes

### 🎨 Interface moderne
- React + Vite + Tailwind CSS
- Tableaux filtrables, toasts, navigation SPA

### 🔐 Sécurité
- Auth **JWT**, mots de passe **bcrypt**
- Connexions **SSH** chiffrées
- CORS configuré, bonnes pratiques OWASP

---

## 🧩 Architecture

<p align="center">
  <img src="./assets/architecture.svg" alt="Architecture APMF Monitoring" width="85%"/>
</p>

**Composants**
- **Frontend** (React/Vite) : UI & dashboard
- **Backend** (Flask/JWT) : API REST & auth
- **Collector** (Python/Paramiko) : collecte distante via SSH
- **MongoDB Atlas** : stockage métriques & alertes

**Flux**
1. Le *Collector* se connecte en SSH aux serveurs et extrait les métriques
2. Il poste les données sur l’API *Backend*
3. Le *Backend* persiste dans *MongoDB* & diffuse au *Frontend*
4. Le *Frontend* affiche dashboards, historiques & alertes

---

## 🛠️ Technologies

**Frontend** : React 18.3, Vite 5, Tailwind CSS, Chart.js/Recharts, Axios, React Router, React Toastify  
**Backend** : Flask 3, Flask-JWT-Extended, Flask-CORS, PyMongo, Gunicorn, python-dotenv  
**Collector** : Paramiko, psutil, schedule, requests  
**Database** : MongoDB Atlas

---

## ⚡ Installation rapide

```bash
# 1) Cloner
git clone https://github.com/bendev99/projet-apmf.git
cd projet-apmf

# 2) Backend
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# 3) Collector
cd ../collector && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# 4) Frontend
cd ../frontend && npm install
```

---

## ⚙️ Configuration

Créez trois fichiers `.env` (exemples) :

**backend/.env**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET_KEY=change_me_super_secret
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_EMAIL=admin@example.com
```

**collector/.env**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
BACKEND_URL=http://localhost:5000
SSH_USER=apmf
SSH_KEY_PATH=~/.ssh/apmf_key
POLL_INTERVAL_SECONDS=15
POLL_MAX_WORKERS=4
LOG_LEVEL=INFO
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:5000
```

### SSH (recommandé)
- Générer une clé : `ssh-keygen -t ed25519 -C "apmf-collector" -f ~/.ssh/apmf_key`
- Copier la clé publique vers l’utilisateur `apmf` sur chaque serveur distant (dans `~/.ssh/authorized_keys`)

---

## ▶️ Démarrage

**Backend**
```bash
cd backend && source venv/bin/activate
python fix_admin.py      # crée l’admin par défaut
python app.py            # ou: gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

**Collector**
```bash
cd collector && source venv/bin/activate
python collector.py
```

**Frontend**
```bash
cd frontend
npm run dev              # dev
# ou
npm run build && npm run preview
```

---

## 🚀 Déploiement (prod)

### Option A — Docker (exemple docker-compose)
```yaml
version: "3.9"
services:
  backend:
    build: ./backend
    env_file: ./backend/.env
    ports: ["5000:5000"]
  collector:
    build: ./collector
    env_file: ./collector/.env
  frontend:
    build: ./frontend
    ports: ["5173:5173"]
```

### Option B — Systemd (collector)
```
[Unit]
Description=APMF Collector
After=network.target

[Service]
User=apmf
WorkingDirectory=/opt/projet-apmf/collector
Environment="PYTHONUNBUFFERED=1"
ExecStart=/opt/projet-apmf/collector/venv/bin/python /opt/projet-apmf/collector/collector.py
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 🤝 Contribution

1. Fork → `feature/ma-feature` → PR  
2. Respect **PEP8 / ESLint**, tests & docs à jour  
3. Décrivez clairement vos changements

---

## 📜 License

MIT — voir [LICENSE](LICENSE)

---

## 👤 Auteur & Contact

**BenDev** — [@bendev99](https://github.com/bendev99)  
📧 **Email** : benbenedictin@gmail.com  
📱 **WhatsApp / Telegram** : +261 34 37 865 70

> ⭐ Si ce projet vous aide, pensez à lui laisser une étoile !  
> ❤️ *Soutien* : AirtelMoney 033 172 5084 — Mvola 034 378 6570
