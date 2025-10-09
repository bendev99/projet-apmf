import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const Capteur = () => {
  const [temperature, setTemperature] = useState("...");
  const [humidity, setHumidity] = useState("...");

  useEffect(() => {
    socket.on("mqtt_message", (data) => {
      try {
        const parsed = JSON.parse(data.value);
        setTemperature(parsed.temperature.toFixed(1));
        setHumidity(parsed.humidity.toFixed(1));
      } catch (e) {
        console.error("Erreur parsing JSON :", e);
      }
    });

    return () => socket.off("mqtt_message");
  }, []);

  return (
    <div className="p-6 bg-gray-800 text-white rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-2">🌡️ Température serveur</h2>
      <p className="text-3xl">{temperature} °C</p>
      <h2 className="text-xl font-semibold mt-4 mb-2">💧 Humidité serveur</h2>
      <p className="text-3xl">{humidity} %</p>
    </div>
  );
};

export default Capteur;
