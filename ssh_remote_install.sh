#!/bin/bash
set -euo pipefail

# ========================================
#  Configuration
# ========================================
MONITORING_USER="apmf"
SSH_KEY_PATH="$HOME/.ssh/apmf_key"

echo "=== Configuration de la supervision APMF ==="

# ========================================
#  Fonction : installation de sshpass
# ========================================
install_sshpass() {
    if command -v sshpass >/dev/null 2>&1; then
        echo "sshpass est déjà installé"
        return
    fi

    echo "sshpass n'est pas installé. Installation en cours..."

    if [ -f /etc/os-release ]; then
        . /etc/os-release

        case "${ID:-}" in
            debian|ubuntu|linuxmint|trixie|bookworm)
                sudo apt-get update -qq
                sudo apt-get install -y sshpass
                ;;
            fedora)
                sudo dnf install -y sshpass || sudo yum install -y sshpass
                ;;
            rhel|centos|rocky|almalinux)
                sudo yum install -y epel-release || true
                sudo yum install -y sshpass
                ;;
            arch|manjaro)
                sudo pacman -Sy --noconfirm sshpass
                ;;
            opensuse*|sles)
                sudo zypper install -y sshpass
                ;;
            *)
                echo "Distribution non supportée pour l'installation automatique de sshpass."
                echo "Installe sshpass manuellement puis relance le script."
                exit 1
                ;;
        esac
    else
        echo "/etc/os-release introuvable. Impossible de détecter la distribution."
        echo "Installe sshpass manuellement puis relance le script."
        exit 1
    fi

    echo "sshpass installé avec succès"
}

# ========================================
#  Étape 0 : Vérifier / installer sshpass
# ========================================
install_sshpass

# ========================================
#  Étape 1 : Demande d'informations
# ========================================
read -rp "» Entrez le nom d'utilisateur du serveur distant : " REMOTE_USER
read -rp "» Entrez l'adresse IP du serveur distant : " REMOTE_IP
read -srp "» Entrez le mot de passe pour ${REMOTE_USER}@${REMOTE_IP} : " REMOTE_PASSWORD
echo ""

if [ -z "$REMOTE_USER" ] || [ -z "$REMOTE_IP" ] || [ -z "$REMOTE_PASSWORD" ]; then
    echo "× Utilisateur, IP ou mot de passe vide. Abandon."
    exit 1
fi

# ========================================
#  Étape 2 : Génération / vérification de la clé SSH locale
# ========================================
mkdir -p "$(dirname "$SSH_KEY_PATH")"

if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "» Génération de la clé SSH pour l'utilisateur de supervision..."
    ssh-keygen -t ed25519 -C "apmf-collector" -f "$SSH_KEY_PATH" -N ""
    echo "» Clé générée : $SSH_KEY_PATH"
else
    echo "ø Clé déjà existante : $SSH_KEY_PATH"
fi

chmod 600 "$SSH_KEY_PATH"

if [ ! -f "${SSH_KEY_PATH}.pub" ]; then
    echo "ø Clé publique introuvable : ${SSH_KEY_PATH}.pub"
    echo "» Supprimez la clé privée et relancez : rm -f '$SSH_KEY_PATH'"
    exit 1
fi

# Encoder avec gestion d'erreur
if ! SSH_PUBKEY_B64=$(base64 -w0 "${SSH_KEY_PATH}.pub" 2>/dev/null); then
    echo "× Erreur lors de l'encodage de la clé publique"
    exit 1
fi

# ========================================
#  Étape 3 : Configuration sur le serveur distant
# ========================================
echo "» Configuration du serveur distant ${REMOTE_IP}..."

sshpass -p "$REMOTE_PASSWORD" \
  ssh -o StrictHostKeyChecking=no "${REMOTE_USER}@${REMOTE_IP}" \
  "MONITORING_USER='$MONITORING_USER' SUDO_PASSWORD='$REMOTE_PASSWORD' SSH_PUBKEY_B64='$SSH_PUBKEY_B64' bash -s" <<'EOF'
set -euo pipefail

: "${MONITORING_USER:?MONITORING_USER non défini}"
: "${SUDO_PASSWORD:?SUDO_PASSWORD non défini}"
: "${SSH_PUBKEY_B64:?SSH_PUBKEY_B64 non défini}"

run_sudo() {
    echo "$SUDO_PASSWORD" | sudo -S "$@"
}

echo "=== Configuration côté serveur ==="

# 0. S'assurer que /home est correct (StrictModes de sshd)
if [ -d /home ]; then
    run_sudo chown root:root /home || true
    run_sudo chmod 755 /home || true
fi

# 1. Créer l'utilisateur de monitoring s'il n'existe pas
if id "$MONITORING_USER" >/dev/null 2>&1; then
    echo "Utilisateur ${MONITORING_USER} existe déjà"
else
    echo "Création de l'utilisateur ${MONITORING_USER}..."
    run_sudo adduser --disabled-password --gecos "APMF Monitoring User" "$MONITORING_USER"
    echo "Utilisateur ${MONITORING_USER} créé"
fi

# 2. S'assurer que le home de l'utilisateur existe et a les bons droits
USER_HOME=$(getent passwd "$MONITORING_USER" | cut -d: -f6)
if [ -z "$USER_HOME" ]; then
    USER_HOME="/home/${MONITORING_USER}"
fi

run_sudo mkdir -p "$USER_HOME"
run_sudo chown "$MONITORING_USER:$MONITORING_USER" "$USER_HOME"
run_sudo chmod 700 "$USER_HOME"

# 3. Créer le dossier .ssh avec les bons droits
SSH_DIR="${USER_HOME}/.ssh"
run_sudo mkdir -p "$SSH_DIR"
run_sudo chown "$MONITORING_USER:$MONITORING_USER" "$SSH_DIR"
run_sudo chmod 700 "$SSH_DIR"

# 4. Décoder la clé publique et l'écrire dans authorized_keys
echo "» Ajout de la clé publique dans authorized_keys..."

TMPFILE=$(mktemp)
echo "$SSH_PUBKEY_B64" | base64 -d > "$TMPFILE"

# Créer .ssh si besoin (au cas où)
run_sudo mkdir -p "$SSH_DIR"
run_sudo chown "$MONITORING_USER:$MONITORING_USER" "$SSH_DIR"
run_sudo chmod 700 "$SSH_DIR"

# Installer la clé avec les bons droits
run_sudo install -o "$MONITORING_USER" -g "$MONITORING_USER" -m 600 "$TMPFILE" "${SSH_DIR}/authorized_keys"
rm -f "$TMPFILE"

# 6. Ajuster la configuration sshd pour accepter les clés
SSHD_CONFIG="/etc/ssh/sshd_config"

# Activer PubkeyAuthentication
if run_sudo grep -qE '^[# ]*PubkeyAuthentication' "$SSHD_CONFIG"; then
    run_sudo sed -i -E 's/^[# ]*PubkeyAuthentication.*/PubkeyAuthentication yes/' "$SSHD_CONFIG"
else
    echo "PubkeyAuthentication yes" | run_sudo tee -a "$SSHD_CONFIG" >/dev/null
fi

# S'assurer que AuthorizedKeysFile pointe vers .ssh/authorized_keys
if ! run_sudo grep -qE '^AuthorizedKeysFile' "$SSHD_CONFIG"; then
    echo "AuthorizedKeysFile .ssh/authorized_keys" | run_sudo tee -a "$SSHD_CONFIG" >/dev/null
fi

# (optionnel) laisser PasswordAuthentication tel quel, on ne touche pas pour éviter de se couper l'accès

# 7. Recharger le service SSH
if run_sudo systemctl status ssh >/dev/null 2>&1; then
    run_sudo systemctl reload ssh || run_sudo systemctl restart ssh
elif run_sudo systemctl status sshd >/dev/null 2>&1; then
    run_sudo systemctl reload sshd || run_sudo systemctl restart sshd
else
    echo "Attention: impossible de recharger ssh/sshd via systemctl (système non systemd ?)"
fi

# 8. Afficher un petit récap de debug
echo " "
echo "=== VERIFICATION DES AUTORISATION ==="
run_sudo ls -ld "$USER_HOME" "$SSH_DIR"
run_sudo ls -l "$SSH_DIR"
echo "Contenu de authorized_keys :"
run_sudo head -n 5 "${SSH_DIR}/authorized_keys" || true
echo "==========================="

echo "» Configuration SSH du compte ${MONITORING_USER} terminée"
EOF

# ========================================
#  Étape 4 : Test de connexion
# ========================================
echo "» Test de la connexion SSH avec la clé..."

if ssh -i "$SSH_KEY_PATH" \
       -o IdentitiesOnly=yes \
       -o StrictHostKeyChecking=no \
       "${MONITORING_USER}@${REMOTE_IP}" \
       "echo '» Connexion OK'; whoami; hostname; uptime"; then
    echo "» Configuration réussie pour ${MONITORING_USER}@${REMOTE_IP} !"
else
    echo "× Erreur lors de la connexion à ${MONITORING_USER}@${REMOTE_IP}"
    echo "ø Astuce: lance aussi cette commande pour voir les détails côté client:"
    echo "» ssh -vvv -i \"$SSH_KEY_PATH\" -o IdentitiesOnly=yes ${MONITORING_USER}@${REMOTE_IP}"
    exit 1
fi

# ========================================
#  Nettoyage
# ========================================
unset REMOTE_PASSWORD

echo "=== Fin de la configuration APMF ==="
