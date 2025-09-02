import os
from flask import Flask, jsonify
from flask_cors import CORS
import psutil
import time
from threading import Thread
from pymongo import MongoClient
from datetime import datetime
import pytz
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
CORS(app)

# Vérifier MONGODB_URI
MONGODB_URI = os.getenv("MONGODB_URI")
print("Connecter à MongoDB avec URI:", MONGODB_URI)
if not MONGODB_URI:
    raise ValueError("Erreur : MONGODB_URI n'est pas défini dans les variables d'environnement.")

# Connexion à MongoDB
client = MongoClient(MONGODB_URI)
db = client['apmf-db']
collection = db['metrics']

def collect_data():
    while True:
        try:
            # Définir le fuseau horaire UTC+3 (Madagascar)
            madagascar_tz = pytz.timezone('Indian/Antananarivo')
            current_time = datetime.now(madagascar_tz)
            # Collecte des métriques
            metrics = {
                'timestamp': current_time.isoformat(),  # Stocker comme chaîne ISO
                'cpu_temperature': None,
                'cpu_usage': psutil.cpu_percent(interval=1),
                'memory_usage': psutil.virtual_memory().percent,
                'disk_usage': psutil.disk_usage('/').percent
            }

            # Température CPU
            temps = psutil.sensors_temperatures()
            if 'coretemp' in temps:
                metrics['cpu_temperature'] = temps['coretemp'][0].current

            # Log pour débogage
            print(f"Insertion timestamp : {current_time.isoformat()} (UTC+3, Indian/Antananarivo)")
            # Insérer dans MongoDB
            collection.insert_one(metrics)

        except Exception as e:
            print(f"Erreur: {e}")
        time.sleep(5)

Thread(target=collect_data).start()

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    try:
        # Récupérer les 50 dernières entrées
        recent_metrics = list(collection.find().sort('timestamp', -1).limit(50))
        # Re-trier par timestamp croissant pour le frontend
        recent_metrics = sorted(recent_metrics, key=lambda x: x['timestamp'])
        # Log pour débogage
        print(f"Timestamps récupérés : {[m['timestamp'] for m in recent_metrics]}")
        # Formater pour compatibilité avec le frontend
        formatted_metrics = {
            'cpu_temperature': [m['cpu_temperature'] for m in recent_metrics if m['cpu_temperature'] is not None],
            'cpu_usage': [m['cpu_usage'] for m in recent_metrics],
            'memory_usage': [m['memory_usage'] for m in recent_metrics],
            'disk_usage': [m['disk_usage'] for m in recent_metrics],
            'timestamps': [m['timestamp'] for m in recent_metrics]
        }
        return jsonify(formatted_metrics)
    except Exception as e:
        print(f"Erreur lors de la récupération des métriques : {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)