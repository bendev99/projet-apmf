"""
Script exécuté à distance sur les serveurs Linux pour collecter les métriques.
Ce script est autonome et ne nécessite aucune dépendance externe.
"""

REMOTE_SCRIPT = r"""
import os
import time
import json
import subprocess
from datetime import datetime, timezone

def cpu_percent(interval=0.7):
    '''Calculer l'utilisation CPU'''
    def read_cpu():
        with open("/proc/stat") as f:
            for line in f:
                if line.startswith("cpu "):
                    parts = line.split()
                    # user, nice, system, idle, iowait, irq, softirq, steal
                    return {
                        'user': int(parts[1]),
                        'nice': int(parts[2]),
                        'system': int(parts[3]),
                        'idle': int(parts[4]),
                        'iowait': int(parts[5]) if len(parts) > 5 else 0,
                    }
        return None

    cpu1 = read_cpu()
    time.sleep(interval)
    cpu2 = read_cpu()

    if not cpu1 or not cpu2:
        return 0.0

    total1 = sum(cpu1.values())
    total2 = sum(cpu2.values())

    idle_delta = cpu2['idle'] - cpu1['idle']
    total_delta = total2 - total1

    if total_delta == 0:
        return 0.0

    usage = 100.0 * (1.0 - idle_delta / total_delta)
    return round(usage, 2)

def memory_percent():
    '''Calculer l'utilisation mémoire'''
    with open("/proc/meminfo") as f:
        meminfo = {}
        for line in f:
            parts = line.split()
            if len(parts) >= 2:
                key = parts[0].rstrip(':')
                value = int(parts[1])
                meminfo[key] = value

    total = meminfo.get('MemTotal', 1)
    available = meminfo.get('MemAvailable', meminfo.get('MemFree', 0))

    used = total - available
    percent = (used / total) * 100 if total > 0 else 0

    return round(percent, 2)

def disk_usage(path='/'):
    '''Calculer l'utilisation disque'''
    try:
        stat = os.statvfs(path)
        total = stat.f_blocks * stat.f_frsize
        free = stat.f_bavail * stat.f_frsize
        used = total - free
        percent = (used / total) * 100 if total > 0 else 0
        return round(percent, 2)
    except Exception:
        return 0.0

def cpu_temperature():
    '''Lire la température CPU'''
    temp = None

    # Méthode 1: hwmon (la plus fiable)
    hwmon_base = "/sys/class/hwmon"
    if os.path.exists(hwmon_base):
        for hwmon in os.listdir(hwmon_base):
            hwmon_path = os.path.join(hwmon_base, hwmon)

            # Vérifier le nom du capteur
            name_file = os.path.join(hwmon_path, "name")
            if os.path.exists(name_file):
                with open(name_file) as f:
                    name = f.read().strip()

                # Chercher les capteurs CPU
                if any(x in name.lower() for x in ['coretemp', 'k10temp', 'cpu', 'package']):
                    # Chercher temp1_input ou temp2_input
                    for temp_file in ['temp1_input', 'temp2_input', 'temp3_input']:
                        temp_path = os.path.join(hwmon_path, temp_file)
                        if os.path.exists(temp_path):
                            try:
                                with open(temp_path) as f:
                                    temp = int(f.read().strip()) / 1000.0
                                    if 0 < temp < 150:  # Validation
                                        return round(temp, 1)
                            except Exception:
                                continue

    # Méthode 2: thermal_zone
    thermal_base = "/sys/class/thermal"
    if os.path.exists(thermal_base):
        for zone in os.listdir(thermal_base):
            if zone.startswith('thermal_zone'):
                type_file = os.path.join(thermal_base, zone, "type")
                temp_file = os.path.join(thermal_base, zone, "temp")

                if os.path.exists(type_file) and os.path.exists(temp_file):
                    try:
                        with open(type_file) as f:
                            zone_type = f.read().strip().lower()

                        if any(x in zone_type for x in ['cpu', 'x86_pkg', 'package', 'core']):
                            with open(temp_file) as f:
                                temp = int(f.read().strip()) / 1000.0
                                if 0 < temp < 150:
                                    return round(temp, 1)
                    except Exception:
                        continue

    # Méthode 3: lm-sensors (via commande)
    try:
        result = subprocess.run(
            ['sensors', '-A'],
            capture_output=True,
            text=True,
            timeout=2
        )

        if result.returncode == 0:
            for line in result.stdout.split('\n'):
                if 'Package id 0:' in line or 'Tdie:' in line or 'Core 0:' in line:
                    parts = line.split('+')
                    if len(parts) > 1:
                        temp_str = parts[1].split('°')[0].strip()
                        try:
                            temp = float(temp_str)
                            if 0 < temp < 150:
                                return round(temp, 1)
                        except ValueError:
                            continue
    except Exception:
        pass

    return None

def network_stats():
    '''Lire les statistiques réseau'''
    stats = {}
    try:
        with open("/proc/net/dev") as f:
            lines = f.readlines()[2:]  # Skip headers

            for line in lines:
                parts = line.split()
                if len(parts) >= 10:
                    iface = parts[0].rstrip(':')

                    # Ignorer loopback
                    if iface == 'lo':
                        continue

                    rx_bytes = int(parts[1])
                    tx_bytes = int(parts[9])

                    stats[iface] = {
                        'rx_bytes': rx_bytes,
                        'tx_bytes': tx_bytes
                    }
    except Exception:
        pass

    return stats

def get_uptime():
    '''Obtenir l'uptime en secondes'''
    try:
        with open("/proc/uptime") as f:
            uptime_seconds = float(f.read().split()[0])
            return int(uptime_seconds)
    except Exception:
        return 0

def collect_metrics():
    '''Collecter toutes les métriques'''
    return {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'cpu_usage': cpu_percent(interval=0.7),
        'memory_usage': memory_percent(),
        'disk_usage': disk_usage('/'),
        'cpu_temperature': cpu_temperature(),
        'network': network_stats(),
        'uptime': get_uptime()
    }

# Point d'entrée
if __name__ == '__main__':
    metrics = collect_metrics()
    print(json.dumps(metrics))
"""
