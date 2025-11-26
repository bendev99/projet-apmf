from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from db import db

alerts_bp = Blueprint('alerts', __name__)

alerts_collection = db["alerts"]
alert_rules_collection = db["alert_rules"]

@alerts_bp.get('/active')
@jwt_required()
def get_active_alerts():
    """Récupérer toutes les alertes actives"""
    try:
        alerts = list(alerts_collection.find(
            {"status": "active"},
            sort=[("created_at", -1)]
        ))

        for alert in alerts:
            alert['_id'] = str(alert['_id'])

        return jsonify(alerts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@alerts_bp.get('/history')
@jwt_required()
def get_alerts_history():
    """Récupérer l'historique des alertes"""
    try:
        limit = request.args.get('limit', 50, type=int)

        alerts = list(alerts_collection.find(
            sort=[("created_at", -1)],
            limit=limit
        ))

        for alert in alerts:
            alert['_id'] = str(alert['_id'])

        return jsonify(alerts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@alerts_bp.post('/acknowledge/<alert_id>')
@jwt_required()
def acknowledge_alert(alert_id):
    """Marquer une alerte comme acquittée"""
    try:
        from bson.objectid import ObjectId

        result = alerts_collection.update_one(
            {"_id": ObjectId(alert_id)},
            {
                "$set": {
                    "status": "acknowledged",
                    "acknowledged_at": datetime.utcnow().isoformat()
                }
            }
        )

        if result.modified_count == 0:
            return jsonify({"error": "Alerte non trouvée"}), 404

        return jsonify({"message": "Alerte acquittée"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@alerts_bp.delete('/<alert_id>')
@jwt_required()
def delete_alert(alert_id):
    """Supprimer une alerte"""
    try:
        from bson.objectid import ObjectId

        result = alerts_collection.delete_one({"_id": ObjectId(alert_id)})

        if result.deleted_count == 0:
            return jsonify({"error": "Alerte non trouvée"}), 404

        return jsonify({"message": "Alerte supprimée"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@alerts_bp.delete('/clear-all')
@jwt_required()
def clear_all_alerts():
    """Supprimer toutes les alertes (actives et historique)"""
    try:
        result = alerts_collection.delete_many({})

        return jsonify({
            "message": f"{result.deleted_count} alerte(s) supprimée(s)",
            "count": result.deleted_count
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@alerts_bp.get('/rules/<server_id>')
def get_alert_rules(server_id):
    """Récupérer les règles d'alerte pour un serveur"""
    try:
        rules = alert_rules_collection.find_one({"server_id": server_id})

        if rules:
            rules['_id'] = str(rules['_id'])
            return jsonify(rules), 200
        else:
            # Règles par défaut
            default_rules = {
                "server_id": server_id,
                "cpu_threshold": 80,
                "memory_threshold": 85,
                "disk_threshold": 90,
                "temperature_threshold": 85,
                "enabled": True
            }
            return jsonify(default_rules), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@alerts_bp.post('/rules/<server_id>')
@jwt_required()
def set_alert_rules(server_id):
    """Configurer les règles d'alerte pour un serveur"""
    try:
        data = request.get_json()

        rules = {
            "server_id": server_id,
            "cpu_threshold": data.get('cpu_threshold', 80),
            "memory_threshold": data.get('memory_threshold', 85),
            "disk_threshold": data.get('disk_threshold', 90),
            "temperature_threshold": data.get('temperature_threshold', 85),
            "enabled": data.get('enabled', True),
            "updated_at": datetime.utcnow().isoformat()
        }

        result = alert_rules_collection.update_one(
            {"server_id": server_id},
            {"$set": rules},
            upsert=True
        )

        return jsonify(rules), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@alerts_bp.post('/create')
def create_alert():
    """Créer une nouvelle alerte (utilisé par le collector)"""
    try:
        data = request.get_json()

        # Vérifier si une alerte similaire existe déjà (dernières 5 minutes)
        from datetime import datetime, timedelta
        five_minutes_ago = (datetime.utcnow() - timedelta(minutes=5)).isoformat()

        existing = alerts_collection.find_one({
            "server_id": data['server_id'],
            "type": data['type'],
            "status": "active",
            "created_at": {"$gte": five_minutes_ago}
        })

        if existing:
            # Mise à jour de l'alerte existante
            alerts_collection.update_one(
                {"_id": existing['_id']},
                {"$set": {
                    "value": data['value'],
                    "message": data['message'],
                    "updated_at": datetime.utcnow().isoformat()
                }}
            )
            return jsonify({"message": "Alerte mise à jour"}), 200
        else:
            # Création d'une nouvelle alerte
            result = alerts_collection.insert_one(data)
            data['_id'] = str(result.inserted_id)
            return jsonify(data), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
