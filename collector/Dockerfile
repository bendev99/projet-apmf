FROM python:3.11-slim

WORKDIR /app

# Dépendances système : Accélérer avec --no-install-recommends
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Créer dossier SSH sécurisé
RUN mkdir -p /root/.ssh && rm -rf /root/.ssh/apmf_key

# Installer Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier code
COPY . .

# Exposer port healthcheck (optionnel)
EXPOSE 8080

# Lancer collector (ajuste si c'est metrics_script.py)
CMD ["python", "-u", "collector.py"]
