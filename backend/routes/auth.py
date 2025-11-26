from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from db import users
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.post('/login')
def login():
    """Connexion utilisateur"""
    try:
        data = request.get_json()

        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"error": "Nom d'utilisateur et mot de passe requis"}), 400

        username = data['username']
        password = data['password']

        # Chercher l'utilisateur
        user = users.find_one({"username": username})

        if not user:
            # NE PAS dire "utilisateur n'existe pas" (sécurité)
            return jsonify({"error": "Identifiants incorrects"}), 401

        # Vérifier le mot de passe
        if not check_password_hash(user['password'], password):
            return jsonify({"error": "Identifiants incorrects"}), 401

        # Créer le token JWT
        access_token = create_access_token(
            identity=username,
            additional_claims={"role": user.get('role', 'user')},
            expires_delta=timedelta(days=1)
        )

        return jsonify({
            "access_token": access_token,
            "username": username,
            "role": user.get('role', 'user')
        }), 200

    except Exception as e:
        print(f"Erreur login: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Erreur serveur"}), 500


@auth_bp.post('/register')
def register():
    """Inscription utilisateur"""
    try:
        data = request.get_json()

        required = ['username', 'password', 'email']
        if not all(field in data for field in required):
            return jsonify({"error": "Champs manquants"}), 400

        # Vérifier si l'utilisateur existe déjà
        if users.find_one({"username": data['username']}):
            return jsonify({"error": "Nom d'utilisateur déjà utilisé"}), 409

        if users.find_one({"email": data['email']}):
            return jsonify({"error": "Email déjà utilisé"}), 409

        # Créer l'utilisateur
        user = {
            "username": data['username'],
            "email": data['email'],
            "password": generate_password_hash(data['password']),
            "role": data.get('role', 'user'),
            "created_at": datetime.utcnow().isoformat()
        }

        users.insert_one(user)

        return jsonify({"message": "Utilisateur créé avec succès"}), 201

    except Exception as e:
        print(f"Erreur register: {e}")
        return jsonify({"error": "Erreur serveur"}), 500


@auth_bp.get('/me')
@jwt_required()
def get_current_user():
    """Obtenir l'utilisateur connecté"""
    try:
        username = get_jwt_identity()
        user = users.find_one({"username": username}, {"password": 0})

        if not user:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        user['_id'] = str(user['_id'])
        return jsonify(user), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
