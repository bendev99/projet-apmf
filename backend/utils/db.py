from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime
from config import Config

client = MongoClient(Config.MONGODB_URI, connectTimeoutMS=20000, serverSelectionTimeoutMS=20000)
db = client.get_database()

# Collections
users = db["users"]
targets = db["targets"]
metrics = db["metrics"]
alerts_config = db["alerts_config"]
alerts_history = db["alerts_history"]
poll_errors = db["poll_errors"]

def init_db():
    """Initialiser les index et l'admin par défaut"""
    try:
        # Index pour users
        users.create_index([("username", ASCENDING)], unique=True)
        users.create_index([("email", ASCENDING)], unique=True)

        # Index pour targets
        targets.create_index([("ip", ASCENDING)], unique=True)
        targets.create_index([("enabled", ASCENDING)])

        # Index pour metrics
        metrics.create_index([("server_id", ASCENDING)])
        metrics.create_index([("timestamp", DESCENDING)])
        metrics.create_index([("server_id", ASCENDING), ("timestamp", DESCENDING)])

        # Index pour alerts
        alerts_config.create_index([("server_id", ASCENDING)], unique=True)
        alerts_history.create_index([("server_id", ASCENDING), ("timestamp", DESCENDING)])

        print("✅ Index MongoDB créés avec succès")

    except Exception as e:
        print(f"⚠️  Erreur lors de la création des index: {e}")

def create_default_admin():
    """Créer l'utilisateur admin par défaut s'il n'existe pas"""
    import bcrypt
    from config import Config

    # Vérifier si l'admin existe spécifiquement
    existing_admin = users.find_one({"username": Config.DEFAULT_ADMIN_USERNAME})

    if existing_admin:
        print(f"ℹ️  Admin '{Config.DEFAULT_ADMIN_USERNAME}' déjà existant")
        return

    # Créer l'admin
    hashed_password = bcrypt.hashpw(
        Config.DEFAULT_ADMIN_PASSWORD.encode('utf-8'),
        bcrypt.gensalt()
    )

    admin_user = {
        "username": Config.DEFAULT_ADMIN_USERNAME,
        "email": Config.DEFAULT_ADMIN_EMAIL,
        "password": hashed_password.decode('utf-8'),
        "role": "admin",
        "created_at": datetime.utcnow().isoformat()
    }

    users.insert_one(admin_user)
    print(f"✅ Admin créé: {Config.DEFAULT_ADMIN_USERNAME} / {Config.DEFAULT_ADMIN_PASSWORD}")
