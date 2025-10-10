import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

function App() {
  const [historique, setHistorique] = useState([]);

  const sortedHistorique = [...historique].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Limite du nombre de données à afficher
  const MAX_HISTORY = 50;

  useEffect(() => {
    // Charger l'historique au démarrage
    axios
      .get("http://localhost:5000/api/history")
      .then((res) => setHistorique(res.data.reverse())) // ordre chronologique
      .catch((err) => console.error(err));

    // Écouter les nouvelles données MQTT en temps réel
    socket.on("mqtt_message", (payload) => {
      const newData = payload.data; // parce que backend envoie {topic, data}
      setHistorique((prev) => {
        const updated = [...prev, newData];
        if (updated.length > MAX_HISTORY) updated.shift(); // garder MAX_HISTORY dernières valeurs
        return updated;
      });
    });

    return () => socket.off("mqtt_message");
  }, []);

  const telechargerCSV = () => {
    axios({
      url: "http://localhost:5000/api/download",
      method: "GET",
      responseType: "blob", // important pour récupérer un fichier
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

  // Dernière donnée temps réel
  const latest = historique[historique.length - 1];

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h1>🌡️ Température & Humidité en temps réel</h1>
      <button
        onClick={telechargerCSV}
        style={{ marginBottom: 20, padding: "8px 12px" }}
      >
        📥 Télécharger l'historique
      </button>

      {latest ? (
        <div style={{ marginBottom: 20 }}>
          <p>
            <strong>Température :</strong> {latest.temperature} °C
          </p>
          <p>
            <strong>Humidité :</strong> {latest.humidity} %
          </p>
          <p style={{ color: "#666" }}>
            Dernière mise à jour :{" "}
            {new Date(latest.timestamp).toLocaleTimeString()}
          </p>
        </div>
      ) : (
        <p>En attente de données...</p>
      )}

      <h2>📜 Historique (dernier {MAX_HISTORY} mesures)</h2>
      <table
        border="1"
        cellPadding="6"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th>Date</th>
            <th>Température (°C)</th>
            <th>Humidité (%)</th>
          </tr>
        </thead>
        <tbody>
          {sortedHistorique.map((d, i) => (
            <tr key={i}>
              <td>{new Date(d.timestamp).toLocaleString()}</td>
              <td>{d.temperature}</td>
              <td>{d.humidity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
