import { Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import { Toaster } from "react-hot-toast";
import SecureRoutes from "./components/SecureRoutes";
import Capteur from "./components/Capteur";

function App() {
  return (
    <div>
      <Toaster />
      <Routes>
        <Route element={<SecureRoutes />}>
          <Route path="/d" element={<Dashboard />} />
          <Route path="/" element={<Capteur />} />
        </Route>

        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
