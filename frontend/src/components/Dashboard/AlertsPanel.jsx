import { FaTemperatureHigh } from "react-icons/fa";
import { BsDisc } from "react-icons/bs";
import { BiMemoryCard } from "react-icons/bi";
import { ImFire } from "react-icons/im";
import { useState, useEffect } from "react";
import {
  FiX,
  FiAlertTriangle,
  FiCheck,
  FiTrash2,
  FiClock,
} from "react-icons/fi";
import {
  getActiveAlerts,
  acknowledgeAlert,
  deleteAlert,
  getAlertsHistory,
} from "../../services/api";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

export default function AlertsPanel({ isOpen, onClose }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active"); // active | all

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen, filter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      if (filter === "active") {
        const response = await getActiveAlerts();
        setAlerts(response.data);
      } else {
        const response = await getAlertsHistory(50);
        setAlerts(response.data);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des alertes");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
      toast.success("Alerte acquittée");
      fetchAlerts();
    } catch (error) {
      toast.error("Erreur lors de l'acquittement");
    }
  };

  const handleDelete = async (alertId) => {
    try {
      await deleteAlert(alertId);
      toast.success("Alerte supprimée");
      fetchAlerts();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: "bg-red-100 text-red-800 border-red-300",
      high: "bg-orange-100 text-orange-800 border-orange-300",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      low: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return colors[severity] || colors.low;
  };

  const getTypeIcon = (type) => {
    const icons = {
      cpu: <ImFire />,
      memory: <BiMemoryCard />,
      disk: <BsDisc />,
      temperature: <FaTemperatureHigh />,
    };
    return icons[type] || <FiAlertTriangle />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Alertes</h2>
            <p className="text-sm text-gray-600 mt-1">
              {alerts.length} alerte{alerts.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex space-x-2">
          <button
            onClick={() => setFilter("active")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "active"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Actives
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Historique
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiCheck className="text-6xl mx-auto mb-4 opacity-50" />
              <p>Aucune alerte</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`border rounded-lg p-4 ${getSeverityColor(
                    alert.severity
                  )}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {getTypeIcon(alert.type)}
                      </span>
                      <div>
                        <p className="font-semibold text-sm">
                          {alert.server_id}
                        </p>
                        <p className="text-xs opacity-75">
                          {alert.type.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.status === "active"
                          ? "bg-red-500 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {alert.status === "active" ? "Active" : "Acquittée"}
                    </span>
                  </div>

                  <p className="text-sm mb-2">{alert.message}</p>

                  <div className="flex items-center justify-between text-xs opacity-75 mb-3">
                    <span className="flex items-center space-x-1">
                      <FiClock />
                      <span>
                        {formatDistanceToNow(new Date(alert.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </span>
                    <span>
                      Seuil: {alert.threshold}
                      {alert.type === "temperature" ? "°C" : "%"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {alert.status === "active" && (
                      <button
                        onClick={() => handleAcknowledge(alert._id)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-white bg-opacity-50 hover:bg-opacity-100 rounded text-xs font-medium transition"
                      >
                        <FiCheck />
                        <span>Acquitter</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(alert._id)}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-white bg-opacity-50 hover:bg-opacity-100 rounded text-xs font-medium transition"
                    >
                      <FiTrash2 />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
