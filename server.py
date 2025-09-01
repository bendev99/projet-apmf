from flask import Flask, jsonify
import psutil
import time
from threading import Thread

app = Flask(__name__)

# Stockage des métriques
metrics = {
    'cpu_temperature': [],
    'cpu_usage': [],
    'memory_usage': [],
    'disk_usage': [],
}

def collect_data():
    while True:
        try:
            # Température CPU
            temps = psutil.sensors_temperatures()
            if 'coretemp' in temps:
                cpu_temp = temps['coretemp'][0].current
                metrics['cpu_temperature'].append(cpu_temp)
                # if len(metrics['cpu_temperature']) > 100:
                #     metrics['cpu_temperature'].pop(0)

            # Utilisation CPU (%)
            cpu_usage = psutil.cpu_percent(interval=1)
            metrics['cpu_usage'].append(cpu_usage)
            # if len(metrics['cpu_usage']) > 100:
            #     metrics['cpu_usage'].pop(0)

            # Utilisation mémoire ram (%)
            memory = psutil.virtual_memory()
            memory_usage = memory.percent
            metrics['memory_usage'].append(memory_usage)
            # if len(metrics['memory_usage']) > 100:
            #     metrics['memory_usage'].pop(0)

            # Utilisation du disque dur (%)
            disk = psutil.disk_usage('/')
            disk_usage = disk.percent
            metrics['disk_usage'].append(disk_usage)
            # if len(metrics['disk_usage']) > 100:
            #     metrics['disk_usage'].pop(0)

        except Exception as e:
            print(f"Erreur: {e}")
        time.sleep(5)

Thread(target=collect_data).start()

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    return jsonify(metrics)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)