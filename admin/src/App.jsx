// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login, { LoginAside } from "./pages/auth/login";
import Main, { getMainAside } from "./pages/main/main";
import RRHH from "./pages/rrhh/rrhh";
import Tickets from "./pages/tickets/tickets";
import KCS from "./pages/kcs/kcs";

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
        <Route path="/main" element={<Main />} />
      </Route>

      <Route path="/rrhh" element={<RRHH />} />
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/kcs" element={<KCS />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
