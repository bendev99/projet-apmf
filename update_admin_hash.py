from werkzeug.security import generate_password_hash
from utils.db import users  # Ou from models.user import User si besoin
from config import Config
import os

# Charge env si besoin (mais docker a déjà)
os.environ.setdefault('FLASK_ENV', 'development')

print("🔧 Update hash admin password...")

# Cherche admin
admin = users.find_one({"username": "admin"})

if not admin:
    print("❌ Pas d'admin trouvé ; création...")
    admin = {
        "username": "admin",
        "email": Config.DEFAULT_ADMIN_EMAIL,
        "password": generate_password_hash(Config.DEFAULT_ADMIN_PASSWORD, method='bcrypt'),
        "role": "admin",
        "created_at": datetime.utcnow().isoformat()
    }
    result = users.insert_one(admin)
    print(f"✅ Admin créé (ID: {result.inserted_id})")
else:
    # Update password seulement
    new_hash = generate_password_hash("admin123", method='bcrypt')
    result = users.update_one(
        {"username": "admin"},
        {"$set": {"password": new_hash}}
    )
    if result.modified_count > 0:
        print("✅ Password admin hashé avec succès !")
    else:
        print("⚠️ Pas de update (déjà hashé ?)")

# Vérif
admin = users.find_one({"username": "admin"})
print(f"Admin password hash: {admin['password'][:20]}...")  # Truncate pour sécurité
from werkzeug.security import check_password_hash
if check_password_hash(admin['password'], "admin123"):
    print("✅ Vérif OK : admin123 valide !")
else:
    print("❌ Erreur vérif ; re-run ou check DB")

print("🎉 Update fini. Relance login.")
