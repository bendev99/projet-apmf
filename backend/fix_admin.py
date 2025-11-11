from utils.db import users
from models.user import User

print("🔧 Nettoyage de la collection users...")

# Supprimer TOUS les utilisateurs
result = users.delete_many({})
print(f"✅ {result.deleted_count} utilisateur(s) supprimé(s)")

# Recréer l'admin
print("\n👤 Création du nouvel admin...")
try:
    admin = User.create(
        username="admin",
        email="admin@example.com",
        password="admin123",
        role="admin"
    )
    print(f"✅ Admin créé avec succès!")
    print(f"   Username: {admin['username']}")
    print(f"   Email: {admin['email']}")
    print(f"   Role: {admin['role']}")

    # Test de connexion
    print("\n🧪 Test de connexion...")
    test_user = User.find_by_username("admin")

    if test_user:
        print(f"✅ Admin trouvé: {test_user['username']}")

        # Test du mot de passe
        if User.verify_password(test_user['password'], "admin123"):
            print("✅ Mot de passe 'admin123' vérifié avec succès!")
        else:
            print("❌ Erreur: Mot de passe incorrect")
    else:
        print("❌ Erreur: Admin non trouvé après création")

except Exception as e:
    print(f"❌ Erreur lors de la création: {e}")
    import traceback
    traceback.print_exc()
