import requests
from datetime import datetime
from config import Config

def check_alerts(server_id, metrics, alert_rules):
    """Vérifier si les métriques dépassent les seuils et créer des alertes"""

    if not alert_rules or not alert_rules.get('enabled'):
        print(f"⚠️ Règles d'alerte désactivées pour {server_id}")
        return

    alerts = []

    # Vérifier CPU
    cpu_usage = metrics.get('cpu_usage', 0)
    cpu_threshold = alert_rules.get('cpu_threshold', 80)
    if cpu_usage > cpu_threshold:
        alerts.append({
            'type': 'cpu',
            'message': f"CPU élevé: {cpu_usage:.1f}%",
            'value': cpu_usage,
            'threshold': cpu_threshold
        })
        print(f"🔥 ALERTE CPU: {cpu_usage:.1f}% > {cpu_threshold}%")

    # Vérifier RAM
    memory_usage = metrics.get('memory_usage', 0)
    memory_threshold = alert_rules.get('memory_threshold', 85)
    if memory_usage > memory_threshold:
        alerts.append({
            'type': 'memory',
            'message': f"RAM élevée: {memory_usage:.1f}%",
            'value': memory_usage,
            'threshold': memory_threshold
        })
        print(f"💾 ALERTE RAM: {memory_usage:.1f}% > {memory_threshold}%")

    # Vérifier Disque
    disk_usage = metrics.get('disk_usage', 0)
    disk_threshold = alert_rules.get('disk_threshold', 90)
    if disk_usage > disk_threshold:
        alerts.append({
            'type': 'disk',
            'message': f"Disque plein: {disk_usage:.1f}%",
            'value': disk_usage,
            'threshold': disk_threshold
        })
        print(f"💿 ALERTE DISQUE: {disk_usage:.1f}% > {disk_threshold}%")

    # Vérifier Température (si disponible)
    temp = metrics.get('cpu_temperature')
    if temp is not None:
        temp_threshold = alert_rules.get('temperature_threshold', 85)
        if temp > temp_threshold:
            alerts.append({
                'type': 'temperature',
                'message': f"Température élevée: {temp:.1f}°C",
                'value': temp,
                'threshold': temp_threshold
            })
            print(f"🌡️ ALERTE TEMPÉRATURE: {temp:.1f}°C > {temp_threshold}°C")

    # Envoyer les alertes au backend
    if alerts:
        print(f"🔔 {len(alerts)} alerte(s) détectée(s) pour {server_id}")
        for alert in alerts:
            send_alert(server_id, alert)
    else:
        print(f"✅ Aucune alerte pour {server_id}")


def send_alert(server_id, alert_data):
    """Envoyer une alerte au backend"""
    try:
        alert_payload = {
            'server_id': server_id,
            'type': alert_data['type'],
            'severity': get_severity(alert_data['value'], alert_data['threshold']),
            'message': alert_data['message'],
            'value': float(alert_data['value']),
            'threshold': float(alert_data['threshold']),
            'status': 'active',
            'created_at': datetime.utcnow().isoformat()
        }

        response = requests.post(
            f"{Config.BACKEND_URL}/api/alerts/create",
            json=alert_payload,
            timeout=5
        )

        if response.status_code in [200, 201]:
            print(f"✅ Alerte {alert_data['type']} envoyée au backend")
        else:
            print(f"⚠️ Erreur envoi alerte: {response.status_code}")

    except Exception as e:
        print(f"❌ Erreur envoi alerte: {e}")


def get_severity(value, threshold):
    """Déterminer la sévérité de l'alerte"""
    excess = value - threshold

    if excess > 20:
        return 'critical'
    elif excess > 10:
        return 'high'
    elif excess > 5:
        return 'medium'
    else:
        return 'low'


def get_alert_rules(server_id):
    """Récupérer les règles d'alerte d'un serveur"""
    try:
        response = requests.get(
            f"{Config.BACKEND_URL}/api/alerts/rules/{server_id}",
            timeout=5
        )

        if response.status_code == 200:
            rules = response.json()
            print(f"📋 Règles d'alerte pour {server_id}: CPU>{rules.get('cpu_threshold')}%, RAM>{rules.get('memory_threshold')}%, Disque>{rules.get('disk_threshold')}%, Temp>{rules.get('temperature_threshold')}°C")
            return rules
        else:
            print(f"⚠️ Impossible de récupérer les règles pour {server_id}")
            return None
    except Exception as e:
        print(f"❌ Erreur récupération règles: {e}")
        return None
