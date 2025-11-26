from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from db import init_db, create_default_admin

# Import des routes
from routes.auth import auth_bp
from routes.targets import targets_bp
from routes.metrics import metrics_bp
from routes.alerts import alerts_bp

import os

# Initialisation de l'app
app = Flask(__name__)
app.config.from_object(Config)

# Configuration CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
CORS(app, resources={
    r"/api/*": {
        "origins": Config.ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
}, supports_credentials=True)

# Configuration JWT
jwt = JWTManager(app)

# Enregistrement des blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(targets_bp, url_prefix='/api/targets')
app.register_blueprint(metrics_bp, url_prefix='/api/metrics')
app.register_blueprint(alerts_bp, url_prefix='/api/alerts')

# Route de test
@app.get('/')
def index():
    return jsonify({
        "message": "API Server Monitor v2.0",
        "status": "running"
    })

@app.route('/health')
def health():
    """Health check endpoint for Docker"""
    try:
        # Vérifier MongoDB
        from utils.db import users
        users.find_one()

        return jsonify({
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

# Gestion des erreurs JWT
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Token expiré"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"error": "Token invalide"}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({"error": "Token manquant"}), 401

if __name__ == '__main__':
    # Initialiser la base de données
    print("Initialisation de la base de données...")
    init_db()
    create_default_admin()

    print(f"Démarrage du serveur sur le port {Config.PORT}...")
    app.run(host='0.0.0.0', port=Config.PORT, debug=True)
