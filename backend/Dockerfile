# Dockerfile de base pour le backend Flask (développement)
# FROM python:3.11-slim

# # Install deps système (gcc pour compilation du code)
# RUN apt-get update && apt-get install -y \
#     gcc \
#     && rm -rf /var/lib/apt/lists/*

# WORKDIR /app

# # Copy requirements et install Python deps (sans cache pour fraîcheur)
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy source code
# COPY . .

# # Rend entrypoint exécutable
# RUN chmod +x entrypoint.sh

# # Expose port Flask
# EXPOSE 5000

# # Utilise entrypoint pour runtime init + app
# ENTRYPOINT ["./entrypoint.sh"]



# Dockerfile optimisé pour la production
FROM python:3.11-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Installer dépendances système minimales
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Installer les dépendances Python en profitant du cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code
COPY . .

# Rendre l'entrypoint exécutable
RUN chmod +x entrypoint.sh

# (Optionnel) créer un user non-root
RUN useradd -m apmf && chown -R apmf:apmf /app
USER apmf

EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]
