from flask import Flask, jsonify
from flask_cors import CORS
import requests
import time
from threading import Thread

app = Flask(__name__)
CORS(app)

SERVER_API_URL = 'http://localhost:5001/api/metrics'

metrics = {
    'cpu_temperature': [],
    'cpu_usage': [],
    'memory_usage': [],
    'disk_usage': [],
}

def fetch_server_data():
    while True:
        try:
            response = requests.get(SERVER_API_URL)
            if response.status_code == 200:
                data = response.json()
                metrics['cpu_temperature'] = data['cpu_temperature']
                metrics['cpu_usage'] = data['cpu_usage']
                metrics['memory_usage'] = data['memory_usage']
                metrics['disk_usage'] = data['disk_usage']
            else:
                print(f"Erreur lors de la récupération des données : {response.status_code}")
        except Exception as e:
            print(f"Erreur: {e}")
        time.sleep(5)

Thread(target=fetch_server_data).start()

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    return jsonify(metrics)

@app.route('/')
def index():
    return "API de supervision du serveur est en cours d'exécution."

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)