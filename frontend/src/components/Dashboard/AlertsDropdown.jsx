import { useEffect, useRef, useState } from "react";
import {
  getActiveAlerts,
  acknowledgeAlert,
  deleteAlert,
  clearAllAlerts,
} from "../../services/api";
import { FiCheck, FiTrash2, FiClock, FiAlertTriangle } from "react-icons/fi";
import toast from "react-hot-toast";
import { ImFire } from "react-icons/im";
import { BiMemoryCard } from "react-icons/bi";
import { BsDisc } from "react-icons/bs";
import { FaTemperatureHigh } from "react-icons/fa";
import { AiOutlineWarning } from "react-icons/ai";

export default function AlertsDropdown({ anchorRef, onClose }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchAlerts();

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await getActiveAlerts();
      setAlerts(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des alertes");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAlert(id);
      toast.success("Alerte acquittée");
      fetchAlerts();
    } catch {
      toast.error("Erreur lors de l'acquittement");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id);
      toast.success("Alerte supprimée");
      fetchAlerts();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await clearAllAlerts();
      toast.success(response.data.message);
      fetchAlerts();
    } catch {
      toast.error("Erreur lors du nettoyage");
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
    return icons[type] || <AiOutlineWarning />;
  };

  const formatToTimezone = (isoDate, offsetHours = 3) => {
    // Crée la date puis applique un décalage horaire en heures (ex: +3 pour UTC+3)
    const d = new Date(isoDate);
    const shifted = new Date(d.getTime() + offsetHours * 60 * 60 * 1000);

    const datePart = shifted.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timePart = shifted.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return `${datePart} - ${timePart}`;
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-96 max-h-[70vh] overflow-auto bg-white border border-gray-200 shadow-2xl rounded-xl z-100"
      style={{ backdropFilter: "blur(10px)" }}
    >
      {/* Header avec bouton nettoyage */}
      <div className="sticky top-0 bg-white border-b p-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <FiAlertTriangle className="text-red-500 text-xl" />
            <h3 className="font-bold text-gray-800">Alertes Actives</h3>
          </div>

          {/* Bouton Nettoyer Tout */}
          {alerts.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-xs font-medium"
              title="Supprimer toutes les alertes"
            >
              <FiTrash2 />
              <span>Tout nettoyer</span>
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {alerts.length} alerte{alerts.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <FiCheck className="text-6xl mx-auto mb-4 opacity-50" />
          <p className="font-medium">Aucune alerte active</p>
          <p className="text-sm mt-2">
            Tous les serveurs fonctionnent normalement
          </p>
        </div>
      ) : (
        <div className="p-3 space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`border rounded-lg p-3 ${getSeverityColor(
                alert.severity
              )}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                  <div>
                    <p className="font-semibold text-sm">{alert.server_id}</p>
                    <p className="text-xs opacity-75">
                      {alert.type.toUpperCase()}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-xs font-bold bg-red-500 text-white">
                  {alert.severity.toUpperCase()}
                </span>
              </div>

              <p className="text-sm mb-3">{alert.message}</p>

              <div className="flex items-center justify-between text-xs opacity-75 mb-3">
                <span className="flex items-center space-x-1">
                  <FiClock />
                  <span>{formatToTimezone(alert.created_at, 3)}</span>
                </span>
                <span className="font-medium">
                  Seuil: {alert.threshold}
                  {alert.type === "temperature" ? "°C" : "%"}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleAcknowledge(alert._id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-white hover:bg-opacity-80 rounded text-xs font-medium transition"
                >
                  <FiCheck />
                  <span>Acquitter</span>
                </button>
                <button
                  onClick={() => handleDelete(alert._id)}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-white hover:bg-opacity-80 rounded text-xs font-medium transition"
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
  );
}
