import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { hasUsers, login as loginAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allowRegister, setAllowRegister] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const res = await hasUsers();
      const count = res.data.count;

      if (count === 0) {
        navigate("/register");
      }

      setAllowRegister(count < 2);
    };
    load();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      const response = await loginAPI({ username, password });

      // Utiliser la fonction login du contexte
      login(response.data);

      toast.success("Connexion réussie !");
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur de connexion:", error);
      const errorMessage = error.response?.data?.error || "Erreur de connexion";
      toast.error(errorMessage);
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-200 via-blue-400 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4">
            <img src="/logo.png" alt="Logo APMF" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Supervision des serveurs
          </h1>
          <p className="text-gray-700 mt-2">Connectez-vous à votre compte</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Champ Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Entrez votre nom d'utilisateur"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Champ Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <span>Se connecter</span>
              )}
            </button>
          </form>
        </div>

        {/* Redirection vers connexion */}
        {allowRegister && (
          <div className="text-center mt-6">
            <p className="text-gray-600">Pas encore de compte ?</p>
            <button
              onClick={() => navigate("/register")}
              className="mt-2 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Créer un compte
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-700 mt-6">
          © 2025 APMF Supervision. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default Login;
