import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
CORS(app)

# Vérifier MONGODB_URI
MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise ValueError("Erreur : MONGODB_URI n'est pas défini dans les variables d'environnement.")

# Connexion à MongoDB
client = MongoClient(MONGODB_URI)
db = client['apmf-db']
collection = db['metrics']

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    try:
        server_id = request.args.get("server_id")
        filter_query = {"server_id": server_id} if server_id else {}

        # Récupérer les 50 dernières entrées, triées par timestamp décroissant
        recent_metrics = list(collection.find(filter_query).sort('timestamp', -1).limit(50))

        # Re-trier par timestamp croissant pour le frontend
        recent_metrics = sorted(recent_metrics, key=lambda x: x['timestamp'])

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
        return jsonify({"error": str(e)}), 500

# Route pour la pagination (7 par page, tri descendant)
@app.route('/api/paginated_metrics', methods=['GET'])
def get_paginated_metrics():
    try:
        server_id = request.args.get("server_id")
        filter_query = {"server_id": server_id} if server_id else {}

        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 7))
        skip = (page - 1) * limit

        total = collection.count_documents(filter_query)
        metrics = list(collection.find(filter_query).sort('timestamp', -1).skip(skip).limit(limit))

        formatted_metrics = [
            {
                'timestamp': m['timestamp'],
                'cpu_temperature': m['cpu_temperature'],
                'cpu_usage': m['cpu_usage'],
                'memory_usage': m['memory_usage'],
                'disk_usage': m['disk_usage']
            } for m in metrics
        ]

        return jsonify({
            'metrics': formatted_metrics,
            'total': total,
            'page': page,
            'limit': limit
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Route pour récupérer toutes les données (pour export CSV)
@app.route('/api/all_data', methods=['GET'])
def get_all_data():
    try:
        server_id = request.args.get("server_id")
        filter_query = {"server_id": server_id} if server_id else {}

        # Récupérer toutes les données
        all_data = list(collection.find(filter_query).sort('timestamp', 1))  # Tri croissant pour CSV

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

# Nouvelle route pour lister les serveurs uniques
@app.route('/api/servers', methods=['GET'])
def get_servers():
    try:
        servers = collection.distinct("server_id")
        servers.sort()  # Tri alphabétique
        return jsonify({"servers": servers})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return "API de supervision du serveur est en cours d'exécution."

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)