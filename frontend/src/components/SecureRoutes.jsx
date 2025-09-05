import { Navigate, Outlet } from "react-router-dom";

function SecureRoutes() {
  const user = window.localStorage.getItem("user");
  return user ? <Outlet /> : <Navigate to="/login" />;
}

export default SecureRoutes;
