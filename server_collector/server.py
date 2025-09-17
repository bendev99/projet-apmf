import os
import psutil
import time
from pymongo import MongoClient
from datetime import datetime
import pytz
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("Erreur : MONGODB_URI n'est pas défini.")

SERVER_ID = os.getenv("SERVER_ID", "server1")  # Fallback si non défini

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
                'server_id': SERVER_ID
            }
            temps = psutil.sensors_temperatures()
            if 'coretemp' in temps:
                metrics['cpu_temperature'] = temps['coretemp'][0].current
            collection.insert_one(metrics)
        except Exception as e:
            print(f"Erreur: {e}")
        time.sleep(5)

if __name__ == '__main__':
    collect_data()