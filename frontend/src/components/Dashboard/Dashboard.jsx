import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getServers,
  getLatestMetric,
  addServer,
  deleteServer,
  updateServer,
  getActiveAlerts,
} from "../../services/api";
import toast from "react-hot-toast";
import ServerCard from "./ServerCard";
import AddServerModal from "../Servers/AddServerModal";
import HistoryModal from "./HistoryModal";
import HistoryBoard from "./HistoryBoard";
import AlertsDropdown from "./AlertsDropdown";
import ConfirmModal from "../Common/ConfirmModal";
import EditServerModal from "../Servers/EditServerModal";

import { FiPlus, FiLogOut, FiRefreshCw, FiBell } from "react-icons/fi";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [servers, setServers] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);
  const [editingServer, setEditingServer] = useState(null);

  // État pour la modal de confirmation de suppression
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    serverIp: null,
    serverName: null,
  });

  const bellRef = useRef(null);

  // Le dropdown des alertes ne doit PAS être inclus dans overlayOpen
  const overlayOpen =
    showAddModal || !!selectedServer || deleteConfirm.show || !!editingServer;

  const fetchServersAndMetrics = async () => {
    try {
      const response = await getServers();
      const serversList = response.data;
      setServers(serversList);

      const metricsPromises = serversList.map(async (server) => {
        try {
          const metricResponse = await getLatestMetric(server.ip);
          return { ip: server.ip, data: metricResponse.data };
        } catch (error) {
          return { ip: server.ip, data: null };
        }
      });

      const metricsResults = await Promise.all(metricsPromises);
      const metricsMap = {};
      metricsResults.forEach(({ ip, data }) => {
        metricsMap[ip] = data;
      });

      setMetrics(metricsMap);

      try {
        const alertsResponse = await getActiveAlerts();
        setAlertsCount(alertsResponse.data.length);
      } catch (error) {
        console.error("Erreur alertes:", error);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des serveurs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServersAndMetrics();
    const interval = setInterval(fetchServersAndMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchServersAndMetrics();
  };

  const handleAddServer = async (serverData) => {
    try {
      await addServer(serverData);
      toast.success("Serveur ajouté avec succès");
      setShowAddModal(false);
      fetchServersAndMetrics();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de l'ajout");
      throw error; // Afficher l'erreur dans modale
    }
  };

  // Handler pour éditer un serveur
  const handleEditServer = async (serverData) => {
    try {
      // Si l'IP a changé, c'est un nouveau serveur
      if (serverData.ip !== editingServer.ip) {
        await addServer(serverData);
        await deleteServer(editingServer.ip);
        toast.success("Serveur déplacé vers la nouvelle IP");
      } else {
        // Sinon on met à jour
        await updateServer(serverData.ip, {
          alias: serverData.alias,
          port: serverData.port,
          enabled: serverData.enabled,
        });
        toast.success("Serveur mis à jour");
      }

      setEditingServer(null);
      fetchServersAndMetrics();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Erreur lors de la modification"
      );
    }
  };

  const handleDeleteServer = async (ip) => {
    try {
      await deleteServer(ip);
      toast.success("Serveur supprimé");
      fetchServersAndMetrics();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleToggleServer = async (ip, currentStatus) => {
    try {
      await updateServer(ip, { enabled: !currentStatus });
      toast.success(`Serveur ${!currentStatus ? "activé" : "désactivé"}`);
      fetchServersAndMetrics();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Fonction pour ouvrir la modal de confirmation
  const openDeleteConfirm = (server) => {
    setDeleteConfirm({
      show: true,
      serverIp: server.ip,
      serverName: server.alias || server.ip,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Zone principale avec blur conditionnel */}
      <div
        className={`min-h-screen bg-gray-100 transition-all duration-300 ${
          overlayOpen ? "blur-sm" : ""
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <img src="/logo.png" alt="Logo APMF" className="w-15 h-15" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Supervision des serveurs
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    Connecté en tant que{" "}
                    <span className="font-semibold">{user?.username}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 md:space-x-4">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                  title="Actualiser"
                >
                  <FiRefreshCw
                    className={`text-lg ${refreshing ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Actualiser</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  title="Ajouter un serveur"
                >
                  <FiPlus className="text-lg" />
                  <span className="hidden sm:inline">Ajouter</span>
                </button>

                <div className="relative">
                  <button
                    ref={bellRef}
                    onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                    className="relative flex items-center space-x-2 px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    title="Alertes"
                  >
                    <FiBell className="text-lg" />
                    <span className="hidden sm:inline">Alertes</span>
                    {alertsCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {alertsCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown des alertes - z-index élevé pour ne pas être affecté par le blur */}
                  {showAlertsDropdown && (
                    <AlertsDropdown
                      anchorRef={bellRef}
                      onClose={() => {
                        setShowAlertsDropdown(false);
                        fetchServersAndMetrics();
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {servers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">
                Aucun serveur configuré
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FiPlus />
                <span>Ajouter votre premier serveur</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servers.map((server) => (
                  <ServerCard
                    key={server.ip}
                    server={server}
                    metric={metrics[server.ip]}
                    onDelete={() => openDeleteConfirm(server)}
                    onToggle={() =>
                      handleToggleServer(server.ip, server.enabled)
                    }
                    onViewHistory={() => setSelectedServer(server)}
                    onEdit={() => setEditingServer(server)}
                  />
                ))}
              </div>

              <HistoryBoard servers={servers} />
            </>
          )}
        </main>
      </div>

      {/* Bouton Flottant de Déconnexion */}
      <button
        onClick={logout}
        className="fixed bottom-6 right-6 p-4 bg-linear-to-r from-red-500 to-red-600 text-white rounded-full shadow-2xl hover:shadow-red-500/50 hover:scale-110 transition-all duration-300 z-50 group"
        title="Déconnexion"
      >
        <FiLogOut className="text-2xl" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Déconnexion
        </span>
      </button>

      {/* Modales */}
      {showAddModal && (
        <AddServerModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddServer}
        />
      )}

      {selectedServer && (
        <HistoryModal
          server={selectedServer}
          onClose={() => setSelectedServer(null)}
        />
      )}

      {editingServer && (
        <EditServerModal
          server={editingServer}
          onClose={() => setEditingServer(null)}
          onSubmit={handleEditServer}
        />
      )}

      {/* Modal de Confirmation de Suppression */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        onClose={() =>
          setDeleteConfirm({ show: false, serverIp: null, serverName: null })
        }
        onConfirm={() => handleDeleteServer(deleteConfirm.serverIp)}
        title="Supprimer le serveur"
        message={`Êtes-vous sûr de vouloir supprimer le serveur "${deleteConfirm.serverName}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        danger={true}
      />
    </>
  );
}
