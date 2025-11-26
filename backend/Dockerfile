FROM python:3.11-slim

# Install deps système (gcc pour compilation du code)
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements et install Python deps (sans cache pour fraîcheur)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Rend entrypoint exécutable
RUN chmod +x entrypoint.sh

# Expose port Flask
EXPOSE 5000

# Utilise entrypoint pour runtime init + app
ENTRYPOINT ["./entrypoint.sh"]
