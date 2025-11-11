import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Instance axios avec configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Ne PAS rediriger sur les endpoints d'auth
    const isAuthEndpoint =
      url.includes("/api/auth/login") || url.includes("/api/auth/register");

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        // replace évite d'empiler l'historique
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const login = (credentials) => api.post("/api/auth/login", credentials);

export const register = (data) => api.post("/api/auth/register", data);

export const getCurrentUser = () => api.get("/api/auth/me");

// Servers/Targets
export const getServers = () => api.get("/api/targets");

export const addServer = (serverData) => api.post("/api/targets", serverData);

export const updateServer = (ip, updates) =>
  api.put(`/api/targets/${ip}`, updates);

export const deleteServer = (ip) => api.delete(`/api/targets/${ip}`);

// Metrics
export const getLatestMetric = (serverId) =>
  api.get(`/api/metrics/${serverId}/latest`);

export const getMetricHistory = (serverId, limit = 100, page = 1) =>
  api.get(`/api/metrics/${serverId}/history`, { params: { limit, page } });

export const deleteMetrics = (serverId) =>
  api.delete(`/api/metrics/${serverId}`);

// Alerts
export const getActiveAlerts = () => api.get("/api/alerts/active");

export const getAlertsHistory = (limit = 50) =>
  api.get("/api/alerts/history", { params: { limit } });

// Récupérer TOUTES les métriques (pour export complet)
export const getAllMetricHistory = (serverId) =>
  api.get(`/api/metrics/${serverId}/history/all`);

export const acknowledgeAlert = (alertId) =>
  api.post(`/api/alerts/acknowledge/${alertId}`);

export const deleteAlert = (alertId) => api.delete(`/api/alerts/${alertId}`);

export const clearAllAlerts = () => api.delete("/api/alerts/clear-all");

export const getAlertRules = (serverId) =>
  api.get(`/api/alerts/rules/${serverId}`);

export const setAlertRules = (serverId, rules) =>
  api.post(`/api/alerts/rules/${serverId}`, rules);

export default api;
