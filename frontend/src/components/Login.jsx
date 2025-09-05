import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import CircularProgress from "@mui/material/CircularProgress";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "" || password === "") {
      toast.error("Tous les champs sont requis");
      return;
    } else if (username === "admin" && password === "admin") {
      setLoading(true);
      toast.success("Connexion réussie");

      window.localStorage.setItem("user", true);

      navigate("/");
      setLoading(false);
    } else {
      toast.error("Nom d'utilisateur ou mot de passe incorrect");
    }
  };

  const togglePassword = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center bg-gradient-to-b from-cyan-900 to-blue-950">
      <form
        onSubmit={handleLogin}
        className="flex flex-col p-5 bg-gray-200 rounded-xl shadow-md shadow-cyan-800"
      >
        <h1 className="text-xl font-bold mb-5 text-center">Authentification</h1>
        <div className="flex flex-col items-center">
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="outline outline-cyan-800 focus:outline-cyan-800 focus:outline-2 rounded-md p-2 mb-3 w-full"
          />
          <div className="flex items-center w-full relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="outline outline-cyan-800 focus:outline-cyan-800 focus:outline-2 rounded-md p-2 mb-5 w-full"
            />

            <button onClick={togglePassword} className="cursor-pointer">
              {showPassword ? (
                <RiEyeOffLine className="absolute items-center inset-y-3.5 end-2 text-gray-800" />
              ) : (
                <RiEyeLine className="absolute items-center inset-y-3.5 end-2 text-gray-800" />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="bg-cyan-800 text-white rounded-md p-2 w-full hover:bg-cyan-900 cursor-pointer"
          >
            {loading ? <CircularProgress color="red" size={15} /> : "Connexion"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
