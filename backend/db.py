from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from datetime import datetime
from config import Config

# Connexion MongoDB
client = MongoClient(
    Config.MONGODB_URI,
    connectTimeoutMS=20000,
    serverSelectionTimeoutMS=20000
)
db = client.get_database()

# Collections - NOMS STANDARDISÉS
users_collection = db["users"]
targets_collection = db["targets"]
metrics_collection = db["metrics"]
alerts_collection = db["alerts_history"]
alerts_config_collection = db["alerts_config"]
poll_errors_collection = db["poll_errors"]

# Alias pour rétrocompatibilité
users = users_collection
targets = targets_collection
metrics = metrics_collection
alerts_config = alerts_config_collection
alerts_history = alerts_collection
poll_errors = poll_errors_collection

def check_connection():
    """Vérifie la connexion à MongoDB"""
    try:
        client.admin.command('ping')
        print(f"MongoDB connecté - Base: {db.name}")
        return True
    except ConnectionFailure:
        print("MongoDB: Connexion échouée")
        return False
    except ServerSelectionTimeoutError:
        print("MongoDB: Timeout de sélection du serveur")
        return False
    except Exception as e:
        print(f"MongoDB erreur: {e}")
        return False

def init_db():
    """Initialiser les index et l'admin par défaut"""
    try:
        # Index pour users
        users_collection.create_index([("username", ASCENDING)], unique=True)
        users_collection.create_index([("email", ASCENDING)], unique=True)

        # Index pour targets
        targets_collection.create_index([("ip", ASCENDING)], unique=True)
        targets_collection.create_index([("enabled", ASCENDING)])

        # Index pour metrics
        metrics_collection.create_index([("target_id", ASCENDING)])
        metrics_collection.create_index([("timestamp", DESCENDING)])
        metrics_collection.create_index([("target_id", ASCENDING), ("timestamp", DESCENDING)])

        # Index pour alerts
        alerts_config_collection.create_index([("target_id", ASCENDING)], unique=True)
        alerts_collection.create_index([("target_id", ASCENDING), ("timestamp", DESCENDING)])

        print("Index MongoDB créés avec succès")
    except Exception as e:
        print(f"Erreur lors de la création des index: {e}")
