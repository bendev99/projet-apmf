import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { GoAlertFill } from "react-icons/go";
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
    timestamps: [],
  });
  const [labels, setLabels] = useState([]);

  // Vérifier le fuseau horaire du navigateur
  console.log(
    "Fuseau horaire du navigateur :",
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Récupérer les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/metrics");
        const data = await response.json();
        console.log("Données reçues :", data);
        console.log("Timestamps reçus :", data.timestamps);
        setMetrics(data);
        const newLabels =
          data.timestamps?.map((t) => {
            const date = new Date(t);
            return date.toLocaleTimeString("fr-FR");
          }) || [];
        console.log("Étiquettes générées :", newLabels);
        setLabels(newLabels);
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
      x: { title: { display: true, text: "Heure (UTC+3)" } },
    },
    plugins: { legend: { display: true } },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  });

  const getHistorique = () => {
    toast("Fonctionnalité non encore implémentée !", {
      duration: 4000,
      position: "top-left",
      style: {
        background: "#D4B0A5",
        color: "#F54927",
      },
      icon: <GoAlertFill />,
      ariaProps: {
        role: "status",
        "aria-live": "polite",
      },
    });
  };

  return (
    <div>
      <Toaster />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
        <div className="flex w-full my-auto justify-between items-center bg-amber-200 p-2">
          <h1 className="text-3xl font-bold text-gray-800 text-start">
            Supervision du serveur
          </h1>
          <button
            onClick={getHistorique}
            className="bg-green-500 p-2 rounded-2xl text-white hover:bg-green-600 cursor-pointer"
          >
            Telecharger l'historique
          </button>
        </div>
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
    </div>
  );
}

export default App;
