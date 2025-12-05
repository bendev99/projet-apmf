import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        // Essayer de parser comme JSON d'abord
        let userData;

        if (userStr.startsWith("{")) {
          // C'est du JSON
          userData = JSON.parse(userStr);
        } else {
          // C'est juste un username en string
          userData = { username: userStr };
        }

        setUser({ ...userData, token });
      } catch (error) {
        console.error("Erreur parsing user data:", error);
        // Nettoyer les données corrompues
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    const token = userData.access_token;
    const username = userData.username;

    localStorage.setItem("token", token);
    localStorage.setItem("user", username);

    setUser({ username, token, role: userData.role });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return context;
};

export default AuthContext;
