from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, datetime
from db import users
import bcrypt
import random
import smtplib
from email.message import EmailMessage
from flask_cors import cross_origin
from config import Config
from bson.objectid import ObjectId

auth_bp = Blueprint("auth", __name__)

# -------------------------
#  Vérification utilisateurs
# -------------------------
@auth_bp.get("/has-users")
def has_users():
    count = users.count_documents({})
    return jsonify({"count": count}), 200


# -----------------
#  INSCRIPTION
# -----------------
@auth_bp.post("/register")
def register():
    data = request.get_json()
    required = ["username", "email", "password"]

    if not all(k in data for k in required):
        return jsonify({"error": "Champs manquants"}), 400

    if users.find_one({"username": data["username"]}):
        return jsonify({"error": "Nom d'utilisateur déjà utilisé"}), 409

    if users.find_one({"email": data["email"]}):
        return jsonify({"error": "Email déjà utilisé"}), 409

    hashed_pw = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()

    users.insert_one({
        "username": data["username"],
        "email": data["email"].lower(),
        "password": hashed_pw,
        "role": "admin",
        "created_at": datetime.utcnow()
    })

    return jsonify({"message": "Compte créé avec succès"}), 201


# -----------------
#  CONNEXION
# -----------------
@auth_bp.post("/login")
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Champs manquants"}), 400

    user = users.find_one({"username": username})

    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"error": "Identifiants incorrects"}), 401

    if not user:
        return jsonify({"error": "Nom d'utilisateur incorrects"}), 401

    if not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"error": "Mot de passe incorrects"}), 401

    token = create_access_token(
        identity=user["username"],
        additional_claims={"role": user.get("role", "user")},
        expires_delta=timedelta(days=1)
    )

    return jsonify({
        "access_token": token,
        "username": user["username"],
        "role": user.get("role", "user")
    }), 200


# ---------------------------------------
#  DEMANDE DE RESET MOT DE PASSE
# ---------------------------------------
@auth_bp.post("/request-reset")
def request_reset():
    try:
        data = request.get_json()
        email = data.get("email", "").lower()

        if not email:
            return jsonify({"error": "Email requis"}), 400

        user = users.find_one({"email": email})
        if not user:
            return jsonify({"error": "Aucun utilisateur trouvé"}), 404

        code = str(random.randint(100000, 999999))

        users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "reset_code": code,
                "reset_expires": datetime.utcnow() + timedelta(minutes=10)
            }}
        )

        msg = EmailMessage()
        msg["Subject"] = "Réinitialisation de votre mot de passe"
        msg["From"] = Config.SMTP_USER
        msg["To"] = email

        # Version texte (fallback)
        msg.set_content("Votre code : {code} — valable 10 minutes.")

        # Version HTML (email professionnel)
        msg.add_alternative(f"""
        <!DOCTYPE html>
        <html lang="fr">
        <body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6; padding:40px 0;">
            <tr>
                <td align="center">

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px; background:white; border-radius:12px; padding:30px; box-shadow:0 6px 16px rgba(0,0,0,0.1);">

                    <tr>
                    <td align="center" style="padding-bottom:20px;">
                        <div style="background:#2563eb; width:70px; height:70px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                        <img src="https://apmfmonitoring.vercel.app/logo.png" alt="Logo" />
                        </div>
                    </td>
                    </tr>

                    <tr>
                    <td align="center" style="color:#1e3a8a; font-size:22px; font-weight:700; padding-bottom:10px;">
                        Réinitialisation du mot de passe
                    </td>
                    </tr>

                    <tr>
                    <td style="color:#374151; font-size:15px; line-height:1.6; padding-bottom:20px;">
                        Bonjour,<br><br>
                        Une demande de réinitialisation de mot de passe a été effectuée pour votre compte de <strong>Supervision</strong> des serveurs.
                        <br><br>
                        Voici votre code de sécurité :
                    </td>
                    </tr>

                    <tr>
                    <td align="center" style="padding:15px 0;">
                        <div style="
                        display:inline-block;
                        padding:14px 32px;
                        background:#2563eb;
                        color:white;
                        font-size:28px;
                        letter-spacing:6px;
                        font-weight:bold;
                        border-radius:8px;">
                        {code}
                        </div>
                    </td>
                    </tr>

                    <tr>
                    <td style="color:#6b7280; font-size:14px; padding:10px 0 25px;">
                        Ce code est valable <strong>10 minutes</strong>.
                        Veillez à ne pas le partager.
                    </td>
                    </tr>

                    <tr>
                    <td align="center" style="padding-bottom:30px;">
                        <a href="https://apmfmonitoring.vercel.app/reset-password?email={email}"
                        style="
                        background:#1d4ed8;
                        color:white;
                        text-decoration:none;
                        padding:12px 28px;
                        font-size:16px;
                        font-weight:bold;
                        border-radius:8px;
                        display:inline-block;">
                        Réinitialiser le mot de passe
                        </a>
                    </td>
                    </tr>

                    <tr>
                    <td align="center" style="border-top:1px solid #e5e7eb; padding-top:20px; color:#9ca3af; font-size:12px;">
                        Server Monitor • Sécurité & Supervision<br>
                        © 2025 Tous droits réservés
                    </td>
                    </tr>

                </table>

                </td>
            </tr>
            </table>
        </body>
        </html>
        """, subtype="html")


        with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT) as server:
            if Config.SMTP_TLS:
                server.starttls()
            server.login(Config.SMTP_USER, Config.SMTP_PASS)
            server.send_message(msg)

        return jsonify({"message": "Code envoyé"}), 200

    except Exception as e:
        print("ERROR SMTP:", e)
        return jsonify({"error": "Erreur interne"}), 500


# ---------------------------------------
#  VERIFICATION CODE
# ---------------------------------------
@auth_bp.post("/verify-reset-code")
def verify_code():
    data = request.get_json()
    email = data.get("email", "").lower()
    code = data.get("code")

    user = users.find_one({"email": email})
    if not user or "reset_code" not in user:
        return jsonify({"error": "Code invalide"}), 400

    if user["reset_code"] != code:
        return jsonify({"error": "Code incorrect"}), 400

    if datetime.utcnow() > user["reset_expires"]:
        return jsonify({"error": "Code expiré"}), 400

    return jsonify({"message": "Code validé"}), 200


# ---------------------------------------
#  RESET FINAL MOT DE PASSE
# ---------------------------------------
@auth_bp.post("/reset-password")
def reset_password():
    data = request.get_json()

    email = data.get("email", "").lower()
    new_password = data.get("password")

    hashed_pw = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()

    users.update_one(
        {"email": email},
        {"$set": {
            "password": hashed_pw,
            "reset_code": None,
            "reset_expires": None
        }}
    )

    return jsonify({"message": "Mot de passe mis à jour"}), 200
