from utils.db import users
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from datetime import datetime

print("🔧 Nettoyage et création admin...")

# Optionnel : Supprime TOUS users (pour clean ; skip si prod)
result_delete = users.delete_many({})
print(f"✅ {result_delete.deleted_count} utilisateur(s) supprimé(s)")

# Crée admin avec hash built-in
try:
    # Vérifie si admin existe déjà
    existing_admin = users.find_one({"username": "admin"})
    if existing_admin:
        print("⚠️ Admin existe ; update password seulement")
        new_hash = generate_password_hash(Config.DEFAULT_ADMIN_PASSWORD, method='pbkdf2:sha256')
        update_result = users.update_one(
            {"username": "admin"},
            {"$set": {"password": new_hash}}
        )
        if update_result.modified_count > 0:
            print("✅ Password admin mis à jour !")
        else:
            print("⚠️ Pas de changement (déjà hashé)")
    else:
        # Crée nouveau
        admin_data = {
            "username": Config.DEFAULT_ADMIN_USERNAME,
            "email": Config.DEFAULT_ADMIN_EMAIL,
            "password": generate_password_hash(Config.DEFAULT_ADMIN_PASSWORD, method='pbkdf2:sha256'),
            "role": "admin",
            "created_at": datetime.utcnow().isoformat()
        }
        insert_result = users.insert_one(admin_data)
        print(f"✅ Admin créé (ID: {insert_result.inserted_id})")

    # Vérif final
    admin = users.find_one({"username": "admin"})
    if admin:
        print(f"Admin: {admin['username']} (email: {admin['email']}, role: {admin['role']})")
        print(f"Hash preview: {admin['password'][:30]}...")  # Tronqué sécurité
        if check_password_hash(admin['password'], Config.DEFAULT_ADMIN_PASSWORD):
            print(f"✅ Vérif OK pour '{Config.DEFAULT_ADMIN_PASSWORD}' !")
        else:
            raise Exception("❌ Vérif password fail ; check hash")
    else:
        raise Exception("❌ Admin non trouvé après création")

except Exception as e:
    print(f"❌ Erreur création/update: {e}")

print("🎉 Fix admin fini. Test login maintenant.")
