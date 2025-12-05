import { useEffect, useState } from "react";
import {
  requestReset,
  verifyResetCode,
  resetPassword,
} from "../../services/api";
import toast from "react-hot-toast";
import { FiMail, FiShield, FiLock } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState("email");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email");

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      setStage("code"); // On passe directement à la vérification du code
    }
  }, [emailParam]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await requestReset(email);
      toast.success("Code envoyé à votre adresse email !");
      setStage("code");
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur d’envoi du code");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await verifyResetCode(email, code);
      toast.success("Code vérifié !");
      setStage("reset");
    } catch (err) {
      toast.error(err.response?.data?.error || "Code incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (newPw !== confirmPw)
      return toast.error("Les mots de passe ne correspondent pas");

    setLoading(true);

    try {
      await resetPassword(email, newPw);
      toast.success("Mot de passe modifié !");
      window.location.href = "/login";
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
        {/* Logo section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full shadow-md mb-4">
            <FiShield className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Réinitialisation du mot de passe
          </h1>
          <p className="text-gray-600 mt-1">
            Suivez les étapes pour sécuriser votre compte
          </p>
        </div>

        {/* Étape 1 : Email */}
        {stage === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>

            <div className="relative">
              <FiMail
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Entrez votre email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition cursor-pointer"
            >
              {loading ? (
                <div className="animate-spin h-6 w-6 border-b-2 border-white rounded-full mx-auto"></div>
              ) : (
                "Envoyer le code"
              )}
            </button>
          </form>
        )}

        {/* Étape 2 : Code */}
        {stage === "code" && (
          <form onSubmit={handleCodeSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code de vérification
            </label>

            <div className="relative">
              <FiShield
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                maxLength="6"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500 transition"
                placeholder="000000"
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition cursor-pointer"
            >
              {loading ? (
                <div className="animate-spin h-6 w-6 border-b-2 border-white rounded-full mx-auto"></div>
              ) : (
                "Vérifier le code"
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-3">
              Vous n’avez rien reçu ?{" "}
              <button
                onClick={handleEmailSubmit}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Renvoyer le code
              </button>
            </p>
          </form>
        )}

        {/* Étape 3 : Nouveau mot de passe */}
        {stage === "reset" && (
          <form onSubmit={handleResetSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative mb-4">
              <FiLock
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nouveau mot de passe"
                onChange={(e) => setNewPw(e.target.value)}
              />
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative mb-4">
              <FiLock
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Confirmer le mot de passe"
                onChange={(e) => setConfirmPw(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition cursor-pointer"
            >
              {loading ? (
                <div className="animate-spin h-6 w-6 border-b-2 border-white rounded-full mx-auto"></div>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 Server Monitor. Sécurité renforcée.
        </p>
      </div>
    </div>
  );
}
