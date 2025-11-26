import os
import json
from dotenv import load_dotenv

load_dotenv()

class Config:
    # MongoDB
    MONGODB_URI = os.getenv("MONGODB_URI")
    if not MONGODB_URI:
        raise SystemExit("Erreur: MONGODB_URI manquant dans .env")

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    if not JWT_SECRET_KEY:
        raise SystemExit("Erreur: JWT_SECRET_KEY manquant dans .env")
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 heures

    # API
    PORT = int(os.getenv("PORT", "5000"))

    # CORS Origins (liste pour credentials=True)
    ALLOWED_ORIGINS_STR = os.getenv("ALLOWED_ORIGINS")
    if ALLOWED_ORIGINS_RAW:
        try:
            ALLOWED_ORIGINS = json.loads(ALLOWED_ORIGINS_RAW)
            if not isinstance(ALLOWED_ORIGINS, list):
                ALLOWED_ORIGINS = [ALLOWED_ORIGINS]
        except Exception:
            ALLOWED_ORIGINS = ["https://apmf-monitoring.vercel.app"]
    else:
        # Valeurs par défaut (local + prod)
        ALLOWED_ORIGINS = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://apmf-monitoring.vercel.app"
        ]

    # Admin par défaut
    DEFAULT_ADMIN_USERNAME = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
    DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
    DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "benbenedictin@gmail.com.com")
