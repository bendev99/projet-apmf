import { useEffect, useState } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { getMetricHistory } from "../../services/api";
import { format, addHours } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { FiRefreshCw } from "react-icons/fi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

export default function HistoryBoard({ servers }) {
  const [selectedServer, setSelectedServer] = useState(servers?.[0]?.ip || "");
  const [period, setPeriod] = useState("1h");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Timezone EAT = UTC+3
  const TIMEZONE_OFFSET_HOURS = 3;

  // Fonction pour convertir UTC vers EAT (UTC+3)
  const convertToLocalTime = (utcDateString) => {
    const utcDate = new Date(utcDateString);
    return addHours(utcDate, TIMEZONE_OFFSET_HOURS);
  };

  // Rafraîchissement automatique toutes les 10 secondes
  useEffect(() => {
    if (selectedServer) {
      fetchHistory();
      const interval = setInterval(fetchHistory, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedServer, period]);

  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].ip);
    }
  }, [servers]);

  const fetchHistory = async () => {
    if (!loading) setLoading(true);

    try {
      const limits = { "1h": 240, "6h": 1440, "24h": 5760 };
      const limit = limits[period] || 240;
      const response = await getMetricHistory(selectedServer, limit);

      const allData = response.data.data || [];
      const sortedData = allData.reverse();

      const last10Measures = sortedData.slice(-10);

      setHistory(last10Measures);
      setLastUpdate(new Date());

      console.log(
        `✅ [${format(new Date(), "HH:mm:ss")}] Affichage des ${
          last10Measures.length
        } dernières mesures`
      );
    } catch (error) {
      console.error("Erreur historique:", error);
      if (loading) {
        toast.error("Erreur lors du chargement de l'historique");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    setLoading(true);
    fetchHistory();
  };

  // Données pour le graphique en ligne - AVEC CONVERSION TIMEZONE
  const lineData = {
    labels: history.map((h) => {
      const localTime = convertToLocalTime(h.timestamp);
      return format(localTime, "HH:mm", { locale: fr });
    }),
    datasets: [
      {
        label: "CPU %",
        data: history.map((h) => h.cpu_usage || 0),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
      {
        label: "RAM %",
        data: history.map((h) => h.memory_usage || 0),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 12, weight: "bold" },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          title: function (context) {
            // Afficher l'heure locale dans le tooltip
            const index = context[0].dataIndex;
            const localTime = convertToLocalTime(history[index].timestamp);
            return format(localTime, "HH:mm:ss", { locale: fr });
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + "%",
        },
      },
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
    },
  };

  // Données pour le donut (dernière mesure)
  const lastMetric = history[history.length - 1] || {};
  const donutData = {
    labels: ["CPU", "RAM", "Disque"],
    datasets: [
      {
        data: [
          lastMetric.cpu_usage || 0,
          lastMetric.memory_usage || 0,
          lastMetric.disk_usage || 0,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: { size: 11 } },
      },
    },
  };

  if (servers.length === 0) return null;

  // Afficher les dernières 30 mesures dans le tableau
  const recentMeasures = history.slice(-30).reverse();

  return (
    <div className="mt-8">
      {/* Header avec sélecteurs */}
      <div className="bg-white rounded-t-lg p-4 border-b flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-gray-800">
            Analyse et Historique
          </h3>

          {lastUpdate && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>
                Mis à jour il y a {Math.floor((new Date() - lastUpdate) / 1000)}
                s
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 flex items-center space-x-2"
            title="Rafraîchir"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>

          <select
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {servers.map((server) => (
              <option key={server.ip} value={server.ip}>
                {server.alias || server.ip}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-b-lg p-6 shadow-lg">
        {loading && history.length === 0 ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-gray-500">
            <p className="text-lg font-semibold">Aucune donnée disponible</p>
            <p className="text-sm mt-2">
              Les métriques apparaîtront ici une fois collectées
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Grand graphique en ligne (2/3) */}
            <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Évolution CPU & RAM ({period})
                </h4>
                <span className="text-xs text-gray-500">
                  {history.length} mesures • EAT (UTC+3)
                </span>
              </div>
              <div className="h-96">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>

            {/* Colonne droite (1/3) */}
            <div className="space-y-4">
              {/* Donut */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Répartition Actuelle
                </h4>
                <div className="h-48">
                  <Doughnut data={donutData} options={donutOptions} />
                </div>

                {/* Valeurs textuelles sous le donut */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="font-semibold text-blue-600">
                      {(lastMetric.cpu_usage || 0).toFixed(1)}%
                    </div>
                    <div className="text-gray-500">CPU</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-600">
                      {(lastMetric.memory_usage || 0).toFixed(1)}%
                    </div>
                    <div className="text-gray-500">RAM</div>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-600">
                      {(lastMetric.disk_usage || 0).toFixed(1)}%
                    </div>
                    <div className="text-gray-500">Disque</div>
                  </div>
                </div>
              </div>

              {/* Tableau compact - AVEC CONVERSION TIMEZONE */}
              <div
                className="bg-gray-50 rounded-lg p-4 flex flex-col"
                style={{ height: "calc(24rem - 15rem)" }}
              >
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Dernières Mesures
                </h4>
                <div className="flex-1 overflow-y-auto">
                  {recentMeasures.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-4">
                      Aucune mesure récente
                    </p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-gray-100">
                        <tr className="text-gray-600">
                          <th className="text-left py-2 px-2">Heure (EAT)</th>
                          <th className="text-right py-2">CPU</th>
                          <th className="text-right py-2">RAM</th>
                          <th className="text-right py-2">Disk</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentMeasures.map((h, idx) => {
                          const localTime = convertToLocalTime(h.timestamp);
                          return (
                            <tr
                              key={idx}
                              className="border-t border-gray-200 hover:bg-white"
                            >
                              <td className="py-2 px-2 text-gray-700">
                                {format(localTime, "HH:mm:ss", { locale: fr })}
                              </td>
                              <td className="text-right text-blue-600 font-medium">
                                {(h.cpu_usage || 0).toFixed(1)}%
                              </td>
                              <td className="text-right text-green-600 font-medium">
                                {(h.memory_usage || 0).toFixed(1)}%
                              </td>
                              <td className="text-right text-purple-600 font-medium">
                                {(h.disk_usage || 0).toFixed(1)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
