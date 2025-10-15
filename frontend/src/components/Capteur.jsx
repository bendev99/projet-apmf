import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import GaugeChart from "./GaugeChart";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import toast from "react-hot-toast";
import { RiLogoutCircleLine } from "react-icons/ri";

const socket = io("http://localhost:5000");

function Capteur() {
  const [historique, setHistorique] = useState([]);

  const sortedHistorique = [...historique].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Limite du nombre de données à afficher
  const MAX_HISTORY = 5;

  useEffect(() => {
    // Charger l'historique au démarrage
    axios
      .get("http://localhost:5000/api/history")
      .then((res) => setHistorique(res.data.reverse())) // ordre chronologique
      .catch((err) => console.error(err));

    // Écouter les nouvelles données MQTT en temps réel
    socket.on("mqtt_message", (payload) => {
      const newData = payload.data;
      setHistorique((prev) => {
        const updated = [...prev, newData];
        if (updated.length > MAX_HISTORY) updated.shift();
        return updated;
      });
    });
    return () => socket.off("mqtt_message");
  }, []);

  const telechargerCSV = () => {
    axios({
      url: "http://localhost:5000/api/download",
      method: "GET",
      responseType: "blob",
    })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "historique_capteurs.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => console.error("Erreur téléchargement CSV:", err));
  };

  // Dernière donnée en temps réel
  const latest = historique[historique.length - 1];

  const deconnexion = () => {
    window.localStorage.removeItem("user");
    toast.success("Deconnexion réussi !");

    navigate("/login");
  };

  return (
    <div className="py-5 px-16 w-[80%] items-center justify-center mx-auto">
      <div className="flex w-full justify-between">
        <h1 className="text-xl font-bold uppercase">Tableau de bord</h1>
        <button
          onClick={telechargerCSV}
          className="text-gray-950 bg-green-400 px-2 rounded-2xl cursor-pointer hover:bg-green-500 hover:scale-101 transition-transform duration-300"
        >
          Télécharger l'historique 📥
        </button>
      </div>

      <div className="flex items-center justify-around bg-gray-200 p-2 rounded-4xl mt-3">
        <GaugeChart
          percentage={latest?.temperature}
          label="Température 🌡️"
          unity="°C"
        />
        <GaugeChart
          percentage={latest?.humidity}
          label="Humidité 💧"
          unity="%"
        />
      </div>

      {latest ? (
        <div className="my-2">
          <p className="text-gray-600">
            Dernière mise à jour :{" "}
            {new Date(latest.timestamp).toLocaleTimeString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </p>
        </div>
      ) : (
        <p>En attente de données...</p>
      )}

      <h2 className="text-gray-800">
        📜 Relever du {MAX_HISTORY} derniers mesures
      </h2>

      {/* TABLEAU HISTORIQUE */}
      <div className="">
        <TableContainer component={Paper}>
          <Table className="bg-gray-100">
            <TableHead>
              <TableRow className="bg-gray-300 text-center">
                <TableCell>
                  <p className="font-bold text-center">Date et Heure</p>
                </TableCell>
                <TableCell>
                  <p className="font-bold text-center">Température</p>
                </TableCell>
                <TableCell>
                  <p className="font-bold text-center">Humidité</p>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedHistorique.map((d, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <p className="text-center">
                      {new Date(d.timestamp).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-center">{d.temperature}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-center">{d.humidity}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className="fixed bottom-5 right-0 mr-10 z-30 flex justify-end rounded-full">
        <button
          onClick={deconnexion}
          className="bg-blue-950 rounded-full shadow-lg hover:scale-110 transition-transform rotate-180 duration-300 w-8 h-8 items-center justify-center flex text-white text-2xl cursor-pointer"
        >
          <RiLogoutCircleLine />
        </button>
      </div>
    </div>
  );
}

export default Capteur;
