projet-apmf
├── assets
│   ├── architecture.svg
│   └── banner.svg
├── backend
│   ├── app.py
│   ├── config.py
│   ├── db.py
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── fix_admin.py
│   ├── models
│   │   ├── **init**.py
│   │   ├── **pycache**
│   │   │   ├── **init**.cpython-311.pyc
│   │   │   ├── **init**.cpython-313.pyc
│   │   │   ├── target.cpython-311.pyc
│   │   │   ├── target.cpython-313.pyc
│   │   │   ├── user.cpython-311.pyc
│   │   │   └── user.cpython-313.pyc
│   │   ├── target.py
│   │   └── user.py
│   ├── **pycache**
│   │   ├── config.cpython-311.pyc
│   │   ├── config.cpython-313.pyc
│   │   └── db.cpython-311.pyc
│   ├── requirements.txt
│   ├── routes
│   │   ├── alerts.py
│   │   ├── auth.py
│   │   ├── **init**.py
│   │   ├── metrics.py
│   │   ├── **pycache**
│   │   │   ├── alerts.cpython-311.pyc
│   │   │   ├── alerts.cpython-313.pyc
│   │   │   ├── auth.cpython-311.pyc
│   │   │   ├── auth.cpython-313.pyc
│   │   │   ├── **init**.cpython-311.pyc
│   │   │   ├── **init**.cpython-313.pyc
│   │   │   ├── metrics.cpython-311.pyc
│   │   │   ├── metrics.cpython-313.pyc
│   │   │   ├── targets.cpython-311.pyc
│   │   │   └── targets.cpython-313.pyc
│   │   └── targets.py
│   └── services
│      ├── **init**.py
│      └── **pycache**
│         └── **init**.cpython-311.pyc
├── collector
│   ├── alert_checker.py
│   ├── collector.log
│   ├── collector.py
│   ├── config.py
│   ├── Dockerfile
│   ├── metrics_script.py
│   ├── **pycache**
│   │   ├── alert_checker.cpython-311.pyc
│   │   ├── alert_checker.cpython-313.pyc
│   │   ├── config.cpython-311.pyc
│   │   ├── config.cpython-313.pyc
│   │   ├── metrics_script.cpython-311.pyc
│   │   └── metrics_script.cpython-313.pyc
│   └── requirements.txt
├── docker-compose.yml
├── frontend
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── package-lock.json
│   ├── public
│   │   ├── icon.png
│   │   └── logo.png
│   ├── README.md
│   ├── src
│   │   ├── App.jsx
│   │   ├── components
│   │   │   ├── Auth
│   │   │   ├── Common
│   │   │   ├── Dashboard
│   │   │   └── Servers
│   │   ├── contexts
│   │   │   └── AuthContext.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── services
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   └── utils
│   │   └── dateUtils.js
│   └── vite.config.js
├── LICENSE
├── README.2.md
├── README.md
├── ssh_keys
│   ├── apmf_key
│   └── apmf_key.pub
├── ssh_remote_install.sh
├── structure_backend.md
├── structure_front.md
└── structure.md
