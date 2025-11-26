from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.target import Target
from db import metrics

targets_bp = Blueprint('targets', __name__)

@targets_bp.get('')
@jwt_required()
def get_targets():
    """Récupérer toutes les cibles"""
    try:
        all_targets = Target.find_all()

        # Convertir ObjectId en string
        for t in all_targets:
            t['_id'] = str(t['_id'])

        return jsonify(all_targets), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@targets_bp.post('')
@jwt_required()
def add_target():
    """Ajouter une nouvelle cible"""
    data = request.get_json()

    if not data or not data.get('ip'):
        return jsonify({"error": "IP requise"}), 400

    # Vérifier si la cible existe déjà
    if Target.find_by_ip(data['ip']):
        return jsonify({"error": "Cette IP existe déjà"}), 409

    try:
        target = Target.create(
            ip=data['ip'],
            alias=data.get('alias'),
            port=data.get('port', 22),
            enabled=data.get('enabled', True)
        )

        target['_id'] = str(target['_id'])
        return jsonify(target), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@targets_bp.put('/<ip>')
@jwt_required()
def update_target(ip):
    """Mettre à jour une cible"""
    data = request.get_json()

    if not data:
        return jsonify({"error": "Données requises"}), 400

    try:
        result = Target.update(ip, data)

        if result.modified_count == 0:
            return jsonify({"error": "Cible non trouvée"}), 404

        return jsonify({"message": "Cible mise à jour"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@targets_bp.delete('/<ip>')
@jwt_required()
def delete_target(ip):
    """Supprimer une cible et ses métriques"""
    try:
        # Supprimer la cible
        result = Target.delete(ip)

        if result.deleted_count == 0:
            return jsonify({"error": "Cible non trouvée"}), 404

        # Supprimer les métriques associées
        metrics.delete_many({"server_id": ip})

        return jsonify({"message": "Cible et métriques supprimées"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
