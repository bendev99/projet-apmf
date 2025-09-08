import os
from flask import Flask, jsonify, request
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
CORS(app)

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("Erreur : MONGODB_URI n'est pas défini.")

client = MongoClient(MONGODB_URI)
db = client['apmf-db']
collection = db['metrics']

def collect_data():
    server_id = os.getenv("SERVER_ID", "server1")  # Default to server1
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
                'server_id': server_id  # Add server_id
            }
            temps = psutil.sensors_temperatures()
            if 'coretemp' in temps:
                metrics['cpu_temperature'] = temps['coretemp'][0].current
            collection.insert_one(metrics)
        except Exception as e:
            print(f"Erreur: {e}")
        time.sleep(5)

Thread(target=collect_data).start()

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    try:
        server_id = request.args.get("server_id", "server1")
        recent_metrics = list(collection.find({"server_id": server_id}).sort('timestamp', -1).limit(50))
        recent_metrics = sorted(recent_metrics, key=lambda x: x['timestamp'])
        formatted_metrics = {
            'cpu_temperature': [m['cpu_temperature'] for m in recent_metrics if m['cpu_temperature'] is not None],
            'cpu_usage': [m['cpu_usage'] for m in recent_metrics],
            'memory_usage': [m['memory_usage'] for m in recent_metrics],
            'disk_usage': [m['disk_usage'] for m in recent_metrics],
            'timestamps': [m['timestamp'] for m in recent_metrics]
        }
        return jsonify(formatted_metrics)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/all_data', methods=['GET'])
def get_all_data():
    try:
        server_id = request.args.get("server_id", "server1")
        all_data = list(collection.find({"server_id": server_id}))
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)