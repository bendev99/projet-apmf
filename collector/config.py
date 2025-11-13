import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # MongoDB
    MONGODB_URI = os.getenv("MONGODB_URI")
    if not MONGODB_URI:
        raise SystemExit("❌ Erreur: MONGODB_URI manquant dans .env")

    # Backend API
    # BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000").rstrip('/')
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://apmf-backend:5000')

    # SSH
    SSH_USER = os.getenv("SSH_USER", "ben")
    SSH_KEY_PATH = os.path.expanduser(os.getenv("SSH_KEY_PATH", "~/.ssh/apmf_key"))

    # Polling
    POLL_INTERVAL = int(os.getenv("POLL_INTERVAL_SECONDS", "10"))
    MAX_WORKERS = int(os.getenv("POLL_MAX_WORKERS", "8"))

    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
