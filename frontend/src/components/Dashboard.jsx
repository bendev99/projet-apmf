import { RiLogoutCircleLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import toast from "react-hot-toast";
import {
  lineChartData,
  lineChartOptions,
  pieChartData,
  pieChartOptions,
} from "./utils";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import Tableau from "./Tableau";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    cpu_temperature: [],
    cpu_usage: [],
    memory_usage: [],
    disk_usage: [],
    timestamps: [],
  });
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState("");

  const navigate = useNavigate();

  // Récupérer la liste des serveurs
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/servers");
        const data = await response.json();
        setServers(data.servers || []);
        if (data.servers && data.servers.length > 0) {
          setSelectedServer(data.servers[0]); // Sélectionne le premier par défaut
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des serveurs:", error);
        toast.error("Erreur lors du chargement des serveurs");
      }
    };

    fetchServers();
  }, []);

  // Récupérer les données pour les graphiques (avec server_id)
  useEffect(() => {
    if (!selectedServer) return;

    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/metrics?server_id=${selectedServer}`
        );
        const data = await response.json();
        setMetrics(data);
        const newLabels =
          data.timestamps?.map((t) => {
            const date = new Date(t);
            return date.toLocaleTimeString("fr-FR");
          }) || [];
        setLabels(newLabels);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [selectedServer]);

  // Fonction pour télécharger l'historique (avec server_id)
  const getHistorique = async () => {
    if (!selectedServer) {
      toast.error("Sélectionnez un serveur d'abord");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/all_data?server_id=${selectedServer}`
      );
      const data = await res.json();

      console.log("Données reçues pour historique : ", data);

      if (!data.timestamps || data.timestamps.length === 0) {
        toast.error("Aucune donnée disponible pour l'exportation");
        return;
      }

      // Générer le contenu CSV
      let csvContent =
        "Date et Heure,Température CPU,Utilisation CPU,Utilisation mémoire,Utilisation disque\n";
      data.timestamps.forEach((timestamp, index) => {
        const date = new Date(timestamp);

        // Formater la date et l'heure en français :
        const formattedTimestamp = date
          .toLocaleString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
          .replace(",", " - ");

        const temp = data.cpu_temperature[index] || "";
        const cpu = data.cpu_usage[index] || "";
        const memory = data.memory_usage[index] || "";
        const disk = data.disk_usage[index] || "";
        csvContent += `${formattedTimestamp},${temp},${cpu},${memory},${disk}\n`;
      });

      // Créer un Blob CSV et télécharger
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `historique_metrics_${selectedServer}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Historique téléchargé avec succès !");
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'historique :", error);
      toast.error("Erreur lors du téléchargement de l'historique");
    } finally {
      setLoading(false);
    }
  };

  const deconnexion = () => {
    window.localStorage.removeItem("user");
    toast.success("Deconnexion réussi !");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="flex justify-between items-center bg-white shadow p-3 rounded-md mb-6 w-full max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-800 text-start">
          Tableau de bord
        </h1>
        <div className="flex items-center gap-4">
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel id="server-select-label">Serveur</InputLabel>
            <Select
              labelId="server-select-label"
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              label="Serveur"
            >
              {servers.map((server) => (
                <MenuItem key={server} value={server}>
                  {server}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <button
            onClick={getHistorique}
            className="bg-green-500 p-2 px-5 rounded-2xl hover:bg-green-600 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                Téléchargement... <CircularProgress size={15} color="inherit" />
              </div>
            ) : (
              "Télécharger l'historique"
            )}
          </button>
        </div>
      </div>

      {selectedServer ? (
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="bg-white p-6 rounded-lg shadow-lg"
            style={{ height: "400px" }}
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
              Température CPU : {metrics.cpu_temperature.at(-1) ?? "N/A"}°C
            </h2>
            <Line
              data={lineChartData(
                labels,
                metrics.cpu_temperature,
                "Température CPU (°C)",
                "rgba(230, 57, 70, 1)"
              )}
              options={lineChartOptions("Température (°C)")}
              height={300}
            />
          </div>
          <div
            className="bg-white p-6 rounded-lg shadow-lg"
            style={{ height: "400px" }}
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
              Utilisation CPU : {metrics.cpu_usage.at(-1) ?? "N/A"}%
            </h2>
            <Line
              data={lineChartData(
                labels,
                metrics.cpu_usage,
                "Utilisation CPU (%)",
                "rgba(46, 134, 222, 1)"
              )}
              options={lineChartOptions("Utilisation (%)")}
              height={300}
            />
          </div>
          <div
            className="bg-white p-6 rounded-lg shadow-lg"
            style={{ height: "400px" }}
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
              Utilisation de la mémoire : {metrics.memory_usage.at(-1) ?? "N/A"}
              %
            </h2>
            <Line
              data={lineChartData(
                labels,
                metrics.memory_usage,
                "Utilisation Mémoire (%)",
                "rgba(61, 193, 211, 1)"
              )}
              options={lineChartOptions("Utilisation (%)")}
              height={300}
            />
          </div>

          <div
            className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center"
            style={{ height: "400px" }}
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
              Utilisation du disque : {metrics.disk_usage.at(-1) ?? "N/A"}%
            </h2>
            <div
              className="flex justify-center items-center"
              style={{ height: "400px", width: "100%" }}
            >
              <Pie
                data={pieChartData({ disk_usage: metrics.disk_usage.at(-1) })}
                options={pieChartOptions}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-700">
          Aucun serveur disponible. Vérifiez la base de données.
        </p>
      )}

      {/* Tableau des derniers relevés avec pagination */}
      <Tableau serverId={selectedServer} />

      <div className="fixed bottom-5 right-0 mr-10 z-30 flex justify-end rounded-full">
        <button
          onClick={deconnexion}
          className="bg-blue-950 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 w-8 h-8 items-center justify-center flex text-white text-2xl cursor-pointer"
        >
          <RiLogoutCircleLine />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
