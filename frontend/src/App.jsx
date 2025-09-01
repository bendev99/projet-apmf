import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler
);

function App() {
  const [metrics, setMetrics] = useState({
    cpu_temperature: [],
    cpu_usage: [],
    memory_usage: [],
    disk_usage: [],
  });
  const [labels, setLabels] = useState([]);

  // Récupérer les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/metrics");
        const data = await response.json();
        setMetrics(data);
        setLabels(
          Array.from({ length: data.cpu_temperature.length }, (_, i) => i * 5)
        );

        console.log(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Configurations des graphiques
  const createChartData = (data, label, color) => ({
    labels: labels,
    datasets: [
      {
        label: label,
        data: data,
        borderColor: color,
        backgroundColor: color.replace("1)", "0.2)"),
        fill: true,
        tension: 0.4,
      },
    ],
  });

  const chartOptions = (yTitle) => ({
    scales: {
      y: { beginAtZero: false, title: { display: true, text: yTitle } },
      x: { title: { display: true, text: "Temps (s)" } },
    },
    plugins: { legend: { display: true } },
  });

  return (
    <div className="max-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Supervision du serveur
      </h1>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Température CPU (°C)
          </h2>
          <Line
            data={createChartData(
              metrics.cpu_temperature,
              "Température CPU (°C)",
              "rgba(230, 57, 70, 1)"
            )}
            options={chartOptions("Température (°C)")}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Utilisation CPU (%)
          </h2>
          <Line
            data={createChartData(
              metrics.cpu_usage,
              "Utilisation CPU (%)",
              "rgba(46, 134, 222, 1)"
            )}
            options={chartOptions("Utilisation (%)")}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Utilisation Mémoire (%)
          </h2>
          <Line
            data={createChartData(
              metrics.memory_usage,
              "Utilisation Mémoire (%)",
              "rgba(61, 193, 211, 1)"
            )}
            options={chartOptions("Utilisation (%)")}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Utilisation Disque (%)
          </h2>
          <Line
            data={createChartData(
              metrics.disk_usage,
              "Utilisation Disque (%)",
              "rgba(108, 92, 231, 1)"
            )}
            options={chartOptions("Utilisation (%)")}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
