import os
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import logging
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configurer les logs pour débogage
# logging.basicConfig(level=logging.DEBUG)

# Vérifier MONGODB_URI
MONGODB_URI = os.getenv("MONGODB_URI")
print("Connecter à MongoDB avec URI:", MONGODB_URI)
if not MONGODB_URI:
    raise ValueError("Erreur : MONGODB_URI n'est pas défini dans les variables d'environnement.")

# Connexion à MongoDB
client = MongoClient(MONGODB_URI)
db = client['apmf-db']
collection = db['metrics']

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    try:
        # Récupérer les 50 dernières entrées, triées par timestamp décroissant
        recent_metrics = list(collection.find().sort('timestamp', -1).limit(50))

        # Re-trier par timestamp croissant pour le frontend
        recent_metrics = sorted(recent_metrics, key=lambda x: x['timestamp'])

        # Log des timestamps pour débogage
        app.logger.debug(f"Timestamps récupérés : {[m['timestamp'] for m in recent_metrics]}")
        # Formater pour compatibilité avec le frontend
        formatted_metrics = {
            'cpu_temperature': [m['cpu_temperature'] for m in recent_metrics if m['cpu_temperature'] is not None],
            'cpu_usage': [m['cpu_usage'] for m in recent_metrics],
            'memory_usage': [m['memory_usage'] for m in recent_metrics],
            'disk_usage': [m['disk_usage'] for m in recent_metrics],
            'timestamps': [m['timestamp'] for m in recent_metrics]
        }
        app.logger.debug(f"Réponse envoyée : {formatted_metrics}")
        return jsonify(formatted_metrics)
    except Exception as e:
        app.logger.error(f"Erreur lors de la récupération des métriques : {e}")
        return jsonify({"error": str(e)}), 500
    
# Route pour recuperer tout les donner du base de donner
@app.route('/api/all_data', methods=['GET'])
def get_all_data():
    try:
        # Fonction pour recuperer tout les donner dans la base de donner
        all_data = list(collection.find())

        # Configuration pour le frontend
        formatted_data = {
            'cpu_temperature': [m['cpu_temperature'] for m in all_data if m['cpu_temperature'] is not None],
            'cpu_usage': [m['cpu_usage'] for m in all_data],
            'memory_usage': [m['memory_usage'] for m in all_data],
            'disk_usage': [m['disk_usage'] for m in all_data],
            'timestamps': [m['timestamp'] for m in all_data]
        }
        return jsonify(formatted_data)
    except Exception as e:
        return jsonify({"Erreur ": str(e)}), 500

@app.route('/')
def index():
    return "API de supervision du serveur est en cours d'exécution."

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)