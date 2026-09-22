import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login, { LoginAside } from "./pages/auth/login";
import Home, { getMainAside } from "./pages/systems/home/home";

//Rutas de los sistemas:
import Admin from "./pages/systems/admin/admin";
import RRHH from "./pages/systems/rrhh/rrhh";
import Tickets from "./pages/systems/tickets/tickets";
import KCS from "./pages/systems/kcs/kcs";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login: Sin botón de salir */}
      <Route
        element={<AuthLayout asideContent={LoginAside} showLogout={false} />}
      >
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Vista principal: Con botón de salir activado */}
      <Route
        element={<AuthLayout asideContent={getMainAside()} showLogout={true} />}
      >
        <Route path="/home" element={<Home />} />
      </Route>

      {/* Rutas para las páginas de los sistemas */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/rrhh" element={<RRHH />} />
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/kcs" element={<KCS />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
