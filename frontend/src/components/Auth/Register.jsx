import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { hasUsers, register as registerAPI } from "../../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allowLogin, setAllowLogin] = useState(false);

  useEffect(() => {
    const check = async () => {
      const res = await hasUsers();
      const count = res.data.count;

      setAllowLogin(count > 0);

      if (count >= 2) {
        navigate("/login");
      }
    };
    check();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      await registerAPI(form);
      toast.success("Compte créé avec succès !");
      navigate("/login");
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      toast.error(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-200 via-blue-400 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4">
            <img src="/logo.png" alt="Logo APMF" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-gray-700 mt-2">
            Ajouter votre compte de Supervision
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Nom d'utilisateur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 inset-y-3 text-gray-400" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  placeholder="Votre nom d'utilisateur"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 inset-y-3 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="exemple@mail.com"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 inset-y-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Votre mot de passe"
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 inset-y-0 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Bouton inscription */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Création du compte...</span>
                </>
              ) : (
                <span>S'inscrire</span>
              )}
            </button>
          </form>
        </div>

        {/* Redirection vers connexion */}
        {allowLogin && (
          <div className="text-center mt-6">
            <p className="text-gray-600">Déjà un compte ?</p>
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-800 font-semibold mt-1 cursor-pointer"
            >
              Se connecter
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

export default Register;
