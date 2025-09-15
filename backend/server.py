import os
from flask import Flask  # Gardé pour compatibilité, mais pas de routes actives
from flask_cors import CORS
import psutil
import time
from threading import Thread
from pymongo import MongoClient
from datetime import datetime
import pytz
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Optionnel si pas de routes

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("Erreur : MONGODB_URI n'est pas défini.")

SERVER_ID = os.getenv("SERVER_ID", "server1")  # ID unique par serveur

client = MongoClient(MONGODB_URI)
db = client['apmf-db']
collection = db['metrics']

def collect_data():
    while True:
        try:
            mada_tz = pytz.timezone('Indian/Antananarivo')
            current_time = datetime.now(mada_tz)
            metrics = {
                'timestamp': current_time.isoformat(),
                'cpu_temperature': None,
                'cpu_usage': psutil.cpu_percent(interval=1),
                'memory_usage': psutil.virtual_memory().percent,
                'disk_usage': psutil.disk_usage('/').percent,
                'server_id': SERVER_ID  # Ajout de l'ID
            }
            temps = psutil.sensors_temperatures()
            if 'coretemp' in temps:
                metrics['cpu_temperature'] = temps['coretemp'][0].current
            collection.insert_one(metrics)
        except Exception as e:
            print(f"Erreur: {e}")
        time.sleep(5)

# Démarrer la collecte en thread
Thread(target=collect_data).start()

# Pas de routes actives, juste pour run le script
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)  # Port distant, mais Flask n'est pas utilisé