import {
  FiServer,
  FiTrash2,
  FiPower,
  FiActivity,
  FiBarChart2,
  FiEdit2,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function ServerCard({
  server,
  metric,
  onDelete,
  onToggle,
  onViewHistory,
  onEdit,
}) {
  const getStatusColor = () => {
    if (!server.enabled) return "bg-gray-400";
    if (!metric) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (!server.enabled) return "Désactivé";
    if (!metric) return "En attente...";
    return "En ligne";
  };

  const formatMetricValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    return `${value.toFixed(1)}%`;
  };

  const getMetricColor = (value) => {
    if (!value) return "text-gray-500";
    if (value < 50) return "text-green-600";
    if (value < 80) return "text-yellow-600";
    return "text-red-600";
  };

  // NOUVEAU : Fonction pour la couleur de la température
  const getTemperatureColor = (temp) => {
    if (!temp) return "bg-gray-500";
    if (temp < 60) return "bg-green-500";
    if (temp < 70) return "bg-yellow-500";
    if (temp < 80) return "bg-orange-500";
    return "bg-red-500";
  };

  // NOUVEAU : Fonction pour calculer le pourcentage de la température (0-100°C)
  const getTemperaturePercentage = (temp) => {
    if (!temp) return 0;
    return Math.min((temp / 100) * 100, 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}
          ></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {server.alias}
            </h3>
            <p className="text-sm text-gray-500">
              {server.ip}:{server.port}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            server.enabled
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {getStatusText()}
        </span>
      </div>

      {/* Metrics */}
      {metric && server.enabled ? (
        <div className="space-y-3">
          {/* CPU */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">CPU</span>
              <span
                className={`font-semibold ${getMetricColor(metric.cpu_usage)}`}
              >
                {formatMetricValue(metric.cpu_usage)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  metric.cpu_usage < 50
                    ? "bg-green-500"
                    : metric.cpu_usage < 80
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${metric.cpu_usage}%` }}
              ></div>
            </div>
          </div>

          {/* RAM */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">RAM</span>
              <span
                className={`font-semibold ${getMetricColor(
                  metric.memory_usage
                )}`}
              >
                {formatMetricValue(metric.memory_usage)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  metric.memory_usage < 50
                    ? "bg-green-500"
                    : metric.memory_usage < 80
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${metric.memory_usage}%` }}
              ></div>
            </div>
          </div>

          {/* Disk */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Disque</span>
              <span
                className={`font-semibold ${getMetricColor(metric.disk_usage)}`}
              >
                {formatMetricValue(metric.disk_usage)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  metric.disk_usage < 50
                    ? "bg-green-500"
                    : metric.disk_usage < 80
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${metric.disk_usage}%` }}
              ></div>
            </div>
          </div>

          {/* Temperature - NOUVELLE VERSION AVEC JAUGE */}
          {metric.cpu_temperature && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">🌡️ Température</span>
                <span className="font-semibold text-gray-800">
                  {metric.cpu_temperature.toFixed(1)}°C
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getTemperatureColor(
                    metric.cpu_temperature
                  )}`}
                  style={{
                    width: `${getTemperaturePercentage(
                      metric.cpu_temperature
                    )}%`,
                  }}
                ></div>
              </div>
              {/* Légende de température */}
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0°C</span>
                <span
                  className={
                    metric.cpu_temperature >= 80
                      ? "text-red-600 font-semibold"
                      : metric.cpu_temperature >= 70
                      ? "text-orange-600 font-semibold"
                      : metric.cpu_temperature >= 60
                      ? "text-yellow-600 font-semibold"
                      : "text-green-600 font-semibold"
                  }
                >
                  {metric.cpu_temperature >= 80
                    ? "Chaud !"
                    : metric.cpu_temperature >= 70
                    ? "Attention"
                    : metric.cpu_temperature >= 60
                    ? "Normal"
                    : "Optimal"}
                </span>
                <span>100°C</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FiActivity className="mx-auto text-4xl mb-2 opacity-50" />
          <p className="text-sm">
            {server.enabled ? "En attente de données..." : "Serveur désactivé"}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col space-y-2">
        {/* Bouton Historique */}
        {server.enabled && metric && (
          <button
            onClick={onViewHistory}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
          >
            <FiBarChart2 />
            <span className="text-sm">Voir l'historique</span>
          </button>
        )}

        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <FiEdit2 />
            <span className="text-sm">Modifier</span>
          </button>

          <button
            onClick={onToggle}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition ${
              server.enabled
                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            <FiPower />
            <span className="text-sm">
              {server.enabled ? "Désactiver" : "Activer"}
            </span>
          </button>

          <button
            onClick={onDelete}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
          >
            <FiTrash2 />
            <span className="text-sm">Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
