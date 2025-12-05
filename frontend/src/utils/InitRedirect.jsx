import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasUsers } from "../services/api";

export default function InitRedirect() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUsers = async () => {
      try {
        const res = await hasUsers();

        if (res.data.hasUsers) {
          navigate("/login");
        } else {
          navigate("/register");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des utilisateurs.");
      } finally {
        setLoading(false);
      }
    };

    checkUsers();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-gray-700 rounded-full mx-auto mb-4"></div>
        Initialisation...
      </div>
    </div>
  );
}
