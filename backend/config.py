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
    if ALLOWED_ORIGINS_STR:
        try:
            ALLOWED_ORIGINS = json.loads(ALLOWED_ORIGINS_STR)
            if not isinstance(ALLOWED_ORIGINS, list):
                ALLOWED_ORIGINS = [ALLOWED_ORIGINS]
        except Exception:
            ALLOWED_ORIGINS = ["https://apmfmonitoring.vercel.app"]
    else:
        # Valeurs par défaut (local + prod)
        ALLOWED_ORIGINS = [
            "http://localhost:3000",
            "http://localhost:5000",
            "http://127.0.0.1:3000",
            "https://apmfmonitoring.vercel.app"
        ]

    # SMTP pour envoi d'emails
    SMTP_SERVER = os.getenv("SMTP_SERVER")
    SMTP_PORT = os.getenv("SMTP_PORT")
    SMTP_TLS = os.getenv("SMTP_TLS")
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASS = os.getenv("SMTP_PASS")
