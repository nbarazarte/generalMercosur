import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

// Material UI (opcional por si necesitas un loader interno)
import Box from "@mui/material/Box";

// Layout y Páginas BackOffice
import Layout from "./pages/layout/Layout";
import EntrarBo from "./pages/auth/entrarBo/SignIn";
import RegistrarBo from "./pages/auth/registrarBo/SignUp";
import ResetPasswordBo from "./pages/auth/entrarBo/components/ResetPassword";

const AppBo = () => {
  // Obtenemos el token específico de BackOffice
  const token = localStorage.getItem("bo_token");

  return (
    <Router basename="/">
      <Routes>
        {/* ==========================================
            RUTAS PÚBLICAS BACKOFFICE
            ========================================== */}
        <Route path="/bo-entrar" element={<EntrarBo />} />
        <Route path="/bo-registrar" element={<RegistrarBo />} />
        <Route path="/bo-completar-registro" element={<RegistrarBo />} />
        <Route path="/bo-reset-password" element={<ResetPasswordBo />} />

        {/* ==========================================
            RUTAS PRIVADAS BACKOFFICE 
            (Inmunes al mantenimiento)
            ========================================== */}
        <Route 
          path="/bo-inicio" 
          element={token ? <Layout /> : <Navigate to="/bo-entrar" replace />} 
        />
        <Route 
          path="/bo-fichas-incompletas" 
          element={token ? <Layout /> : <Navigate to="/bo-entrar" replace />} 
        />
        <Route 
          path="/bo-verificar-documentos" 
          element={token ? <Layout /> : <Navigate to="/bo-entrar" replace />} 
        />
        <Route 
          path="/bo-verificar-en-agile-check" 
          element={token ? <Layout /> : <Navigate to="/bo-entrar" replace />} 
        />
        <Route 
          path="/bo-fichas-para-firmar" 
          element={token ? <Layout /> : <Navigate to="/bo-entrar" replace />} 
        />
        <Route 
          path="/bo-formato" 
          element={token ? <Layout /> : <Navigate to="/bo-entrar" replace />} 
        />

        {/* Fallback: Cualquier ruta de BO no definida redirige al login de BO */}
        <Route path="*" element={<Navigate to="/bo-entrar" replace />} />
      </Routes>
    </Router>
  );
};

export default AppBo;