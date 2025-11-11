from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from utils.db import metrics
from datetime import datetime
import pytz

metrics_bp = Blueprint('metrics', __name__)

@metrics_bp.post('')
def add_metric():
    """Ajouter une nouvelle métrique (appelé par le collector)"""
    data = request.get_json()
    required = ['server_id', 'cpu_usage', 'memory_usage', 'disk_usage']

    if not all(field in data for field in required):
        return jsonify({"error": "Champs manquants"}), 400

    try:
        metric = {
            "server_id": data['server_id'],
            "ip": data.get('ip', data['server_id']),
            "cpu_usage": data['cpu_usage'],
            "memory_usage": data['memory_usage'],
            "disk_usage": data['disk_usage'],
            "cpu_temperature": data.get('cpu_temperature'),
            "network_rx": data.get('network_rx', 0),
            "network_tx": data.get('network_tx', 0),
            "timestamp": datetime.utcnow().isoformat()
        }

        result = metrics.insert_one(metric)
        metric['_id'] = str(result.inserted_id)
        return jsonify(metric), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@metrics_bp.get('/<server_id>/latest')
@jwt_required()
def get_latest_metric(server_id):
    """Obtenir la dernière métrique d'un serveur"""
    try:
        metric = metrics.find_one(
            {"server_id": server_id},
            sort=[("timestamp", -1)]
        )

        if not metric:
            return jsonify({"error": "Aucune métrique trouvée"}), 404

        metric['_id'] = str(metric['_id'])
        return jsonify(metric), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@metrics_bp.get('/<server_id>/history')
@jwt_required()
def get_metric_history(server_id):
    """Obtenir l'historique des métriques"""
    try:
        limit = int(request.args.get('limit', 100))
        page = int(request.args.get('page', 1))
        skip = (page - 1) * limit

        cursor = metrics.find(
            {"server_id": server_id}
        ).sort("timestamp", -1).skip(skip).limit(limit)

        data = list(cursor)

        for item in data:
            item['_id'] = str(item['_id'])

        total = metrics.count_documents({"server_id": server_id})

        return jsonify({
            "data": data,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@metrics_bp.get('/<server_id>/history/all')
@jwt_required()
def get_all_metrics_history(server_id):
    """Récupérer TOUTES les métriques d'un serveur sans limite"""
    try:
        print(f"📦 Récupération de TOUTES les métriques pour {server_id}")

        # ✅ CORRECTION : Renommer la variable locale pour éviter le conflit
        all_metrics = list(metrics.find(
            {"server_id": server_id},
            sort=[("timestamp", -1)]
        ))

        print(f"✅ Trouvé {len(all_metrics)} métriques pour {server_id}")

        # Convertir ObjectId en string pour la sérialisation JSON
        for metric in all_metrics:
            metric['_id'] = str(metric['_id'])

        return jsonify({
            "server_id": server_id,
            "count": len(all_metrics),
            "data": all_metrics
        }), 200

    except Exception as e:
        print(f"❌ Erreur get_all_metrics_history: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@metrics_bp.delete('/<server_id>')
@jwt_required()
def delete_metrics(server_id):
    """Supprimer toutes les métriques d'un serveur"""
    try:
        result = metrics.delete_many({"server_id": server_id})
        return jsonify({
            "message": f"{result.deleted_count} métriques supprimées"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
