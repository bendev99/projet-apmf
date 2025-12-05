import os
import time
import json
import pytz
import logging
import requests
import paramiko
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed
from pymongo import MongoClient
from config import Config
from metrics_script import REMOTE_SCRIPT
from alert_checker import check_alerts, get_alert_rules

# Configuration du logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('collector.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Connexion MongoDB
try:
    client = MongoClient(Config.MONGODB_URI, connectTimeoutMS=20000, serverSelectionTimeoutMS=20000)
    db = client.get_database()
    targets_collection = db["targets"]
    errors_collection = db["poll_errors"]
    logger.info("Connecté à MongoDB Atlas")
except Exception as e:
    logger.error(f"Erreur de connexion MongoDB: {e}")
    raise SystemExit(1)

def execute_remote_script(ssh_client):
    """Exécuter le script de collecte sur le serveur distant"""
    try:
        # Configuration du stdin
        stdin, stdout, stderr = ssh_client.exec_command('python3', timeout=30)

        # Envoyer le script via stdin
        stdin.write(REMOTE_SCRIPT)
        stdin.channel.shutdown_write()

        output = stdout.read().decode('utf-8').strip()
        error = stderr.read().decode('utf-8').strip()

        if error and not output:
            logger.error(f"Erreur script distant: {error}")
            return None

        if not output:
            logger.error("Aucune sortie du script distant")
            return None

        try:
            metrics = json.loads(output)
            return metrics
        except json.JSONDecodeError as e:
            logger.error(f"Erreur parsing JSON: {e}")
            logger.error(f"Output reçu: {output[:200]}")
            return None

    except Exception as e:
        logger.error(f"Erreur exécution script: {e}")
        return None

def send_metrics_to_backend(server_id, ip, metrics):
    """Envoyer les métriques au backend"""
    try:
        # Préparer les données
        network = metrics.get('network', {})
        total_rx = sum(iface['rx_bytes'] for iface in network.values())
        total_tx = sum(iface['tx_bytes'] for iface in network.values())

        payload = {
            'server_id': server_id,
            'ip': ip,
            'cpu_usage': metrics.get('cpu_usage', 0),
            'memory_usage': metrics.get('memory_usage', 0),
            'disk_usage': metrics.get('disk_usage', 0),
            'cpu_temperature': metrics.get('cpu_temperature'),
            'network_rx': total_rx,
            'network_tx': total_tx,
            'uptime': metrics.get('uptime', 0)
        }

        # Envoyer au backend
        response = requests.post(
            f"{Config.BACKEND_URL}/api/metrics",
            json=payload,
            timeout=10
        )

        response.raise_for_status()
        logger.info(f"Métriques envoyées pour {ip}")
        return True

    except requests.exceptions.RequestException as e:
        logger.error(f"Erreur envoi métriques pour {ip}: {e}")
        return False

def log_error(server_id, ip, error_message):
    """Enregistrer une erreur dans MongoDB"""
    try:
        error_doc = {
            'server_id': server_id,
            'ip': ip,
            'error': error_message,
            'timestamp': datetime.utcnow()
        }
        errors_collection.insert_one(error_doc)
    except Exception as e:
        logger.error(f"Erreur lors de l'enregistrement de l'erreur: {e}")

def collect_from_server(target):
    """Collecter les métriques d'un serveur"""
    ip = target['ip']
    port = target.get('port', 22)
    username = target.get('username', Config.SSH_USER)
    alias = target.get('alias', target.get('description', ip))  # Support alias/description

    logger.info(f"Collecte pour {alias} ({ip}:{port})")

    ssh_client = None
    try:
        # Connexion SSH
        ssh_client = paramiko.SSHClient()
        ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        # Tentative avec clé SSH
        try:
            ssh_client.connect(
                hostname=ip,
                port=port,
                username=username,
                key_filename=Config.SSH_KEY_PATH,
                timeout=15,
                banner_timeout=10
            )
            logger.info(f"Connecté en SSH à {ip}")

        except Exception as ssh_error:
            logger.error(f"Échec connexion SSH à {ip}: {ssh_error}")
            log_error(ip, ip, f"SSH connection failed: {str(ssh_error)}")
            return None

        # VÉRIFIER que ssh_client est bien connecté avant d'exécuter le script
        if ssh_client.get_transport() is None or not ssh_client.get_transport().is_active():
            logger.error(f"SSH transport non actif pour {ip}")
            return None

        # Exécuter le script de collecte
        metrics = execute_remote_script(ssh_client)

        if not metrics:
            logger.warning(f"Aucune métrique collectée pour {ip}")
            log_error(ip, ip, "No metrics collected")
            return None

        # Envoyer au backend
        success = send_metrics_to_backend(ip, ip, metrics)

        if success:
            alert_rules = get_alert_rules(ip)
            if alert_rules:
                check_alerts(ip, metrics, alert_rules)

        return {
            'ip': ip,
            'alias': alias,
            'status': 'success',
            'metrics': metrics
        }

    except Exception as e:
        logger.error(f"Erreur collecte pour {ip}: {e}")
        log_error(ip, ip, str(e))
        return None

    finally:
        if ssh_client:
            try:
                ssh_client.close()
            except Exception:
                pass

def collect_all_targets():
    """Collecter les métriques de tous les serveurs actifs"""
    try:
        # Chercher tous les targets (pas seulement enabled:True)
        targets = list(targets_collection.find({}))

        if not targets:
            logger.warning("Aucun serveur à surveiller")
            return

        logger.info(f"{len(targets)} serveur(s) à surveiller")

        # Collecte parallèle
        with ThreadPoolExecutor(max_workers=Config.MAX_WORKERS) as executor:
            futures = {
                executor.submit(collect_from_server, target): target
                for target in targets
            }

            success_count = 0
            error_count = 0

            for future in as_completed(futures):
                result = future.result()
                if result:
                    success_count += 1
                else:
                    error_count += 1

            logger.info(f"Collecte terminée: {success_count} succès, {error_count} échecs")

    except Exception as e:
        logger.error(f"Erreur lors de la collecte: {e}")

def main():
    """Boucle principale du collector"""
    logger.info("Démarrage du Server Monitor Collector")
    logger.info(f"Intervalle de collecte: {Config.POLL_INTERVAL}s")
    logger.info(f"Workers max: {Config.MAX_WORKERS}")
    logger.info(f"Clé SSH: {Config.SSH_KEY_PATH}")
    logger.info(f"Backend: {Config.BACKEND_URL}")

    try:
        while True:
            start_time = time.time()
            logger.info("=" * 60)
            collect_all_targets()

            elapsed = time.time() - start_time
            sleep_time = max(0, Config.POLL_INTERVAL - elapsed)
            logger.info(f"Pause de {sleep_time:.1f}s avant la prochaine collecte")
            time.sleep(sleep_time)

    except KeyboardInterrupt:
        logger.info("\nArrêt du collector (Ctrl+C)")
    except Exception as e:
        logger.error(f"Erreur fatale: {e}")
        raise

if __name__ == '__main__':
    main()
