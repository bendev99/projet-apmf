// Esp32Panel.jsx
import { useEffect, useState } from "react";
import { FiActivity } from "react-icons/fi";
// à adapter selon ta structure de services
// import { getEsp32Latest } from "../../services/api";

const ESP_DEVICE_ID = "esp32-salon"; // à adapter
const ESP_STREAM_URL = "http://192.168.1.50:81/stream"; // URL du stream ESP32

export default function Esp32Panel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Exemple sans service dédié :
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
          }/api/esp32/${ESP_DEVICE_ID}/latest`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        if (!res.ok) throw new Error("Erreur API ESP32");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Carte capteurs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Mesures DHT22 - {ESP_DEVICE_ID}
        </h2>
        {data ? (
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-sm">Température</p>
              <p className="text-3xl font-bold">
                {data.temperature.toFixed(1)}°C
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Humidité</p>
              <p className="text-3xl font-bold">{data.humidity.toFixed(1)}%</p>
            </div>
            <p className="text-xs text-gray-400">
              Dernière mise à jour : {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 py-8">
            <FiActivity className="text-4xl mb-2" />
            <p>Aucune donnée pour le moment…</p>
          </div>
        )}
      </div>

      {/* Stream vidéo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Caméra ESP32-S3</h2>
        <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden">
          {/* MJPEG : un simple <img> suffit souvent */}
          <img
            src={ESP_STREAM_URL}
            alt="Stream ESP32"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          URL du stream : {ESP_STREAM_URL}
        </p>
      </div>
    </div>
  );
}
