#!/bin/bash
set -e  # Arrête sur erreur

# Log pour debug
echo "Démarrage backend : Chargement env et init DB..."

# Init admin si MONGODB_URI existe et fix_admin.py existe (seulement première fois)
if [ -n "$MONGODB_URI" ] && [ -f "fix_admin.py" ]; then
  echo "Initialisation DB : Création admin si absent..."
  python fix_admin.py || echo "Init admin ignoré (déjà existant ou erreur non critique)"
else
  echo "ℹSkip init admin (MONGODB_URI absent ou script manquant)"
fi

# Lance l'app Flask
echo "Lancement Flask sur port 5000..."
exec python app.py
