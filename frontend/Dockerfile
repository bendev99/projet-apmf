# Dockerfile de développement

# # Build stage
# FROM node:22-alpine AS build

# WORKDIR /app

# # Copier package.json et installer deps (npm ci pour lockfile)
# COPY package.json package-lock.json* ./
# RUN npm ci --prefer-offline --no-audit --no-fund

# # Copier source code
# COPY . .

# # Build Vite (génère /app/dist)
# RUN npm run build

# # Debug : Vérifier que dist existe (retire cette ligne en prod)
# RUN ls -la /app && ls -la /app/dist

# # Serve stage avec Nginx
# FROM nginx:alpine

# # Copier le build Vite (dist au lieu de build)
# COPY --from=build /app/dist /usr/share/nginx/html

# # Config Nginx pour proxy API
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Permissions pour SPA routing
# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 3000

# CMD ["nginx", "-g", "daemon off;"]



# Dockerfile optimisé pour la production

# === Build stage ===
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --no-fund

COPY . .
RUN npm run build

# === Serve stage (Nginx) ===
FROM nginx:alpine

# Supprimer la config par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier le build Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Copier notre config Nginx custom (voir plus bas)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
