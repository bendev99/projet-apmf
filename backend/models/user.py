import bcrypt
from db import users
from datetime import datetime

class User:
    @staticmethod
    def create(username, email, password, role="user"):
        """Créer un nouvel utilisateur"""
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        user = {
            "username": username,
            "email": email,
            "password": hashed_password.decode('utf-8'),
            "role": role,
            "created_at": datetime.utcnow().isoformat()
        }

        result = users.insert_one(user)
        user["_id"] = str(result.inserted_id)
        return user

    @staticmethod
    def find_by_username(username):
        """Trouver un utilisateur par username"""
        user = users.find_one({"username": username})
        if user:
            user["_id"] = str(user["_id"])
        return user

    @staticmethod
    def verify_password(stored_password, provided_password):
        """Vérifier le mot de passe"""
        return bcrypt.checkpw(
            provided_password.encode('utf-8'),
            stored_password.encode('utf-8')
        )
