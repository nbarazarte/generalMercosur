import { useState, useEffect } from "react";
import Logo from "../components/Logo";
import axios from "axios";
import { getDeviceInfo } from "../../helper/getDeviceInfo"; // Importa la función desde el helper

const Login = () => {
  // ===== ESTADOS GENERALES =====
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );
  const [currentView, setCurrentView] = useState("login"); // 'login' | 'register'
  const [toasts, setToasts] = useState([]);

  // ===== ESTADOS DE LOGIN =====
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({
    email: false,
    password: false,
  });
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const API_URL = import.meta.env.VITE_URL_API_LOCAL_SEGURIDAD;
  const API_TOKEN = import.meta.env.VITE_TOKEN;

  // ===== EFECTO DE TEMA =====
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // ===== SISTEMA DE TOASTS =====
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3300);
  };

  // ===== MANEJO DE LOGIN =====
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    let valid = true;
    const errors = { email: false, password: false };

    // Expresión regular estándar para formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!loginEmail || !emailRegex.test(loginEmail.trim())) {
      errors.email = true;
      valid = false;
    }

    if (!loginPassword) {
      errors.password = true;
      valid = false;
    }

    setLoginErrors(errors);
    if (!valid) return;

    setIsLoginLoading(true);

    try {
      // 1. Obtener la identificación del dispositivo
      const { deviceId, deviceName } = getDeviceInfo();

      // 2. Realizar la petición POST enviando datos de login + dispositivo
      const response = await axios.post(
        `${API_URL}/login`,
        {
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
          device_id: deviceId,
          device_name: deviceName,
        },
        { headers: { Authorization: `Bearer ${API_TOKEN}` } },
      );

      console.log("Respuesta del backend:", response.data);

      // 3. Guardar datos de autenticación en localStorage
      localStorage.setItem("cl_userId", String(response.data.id));
      localStorage.setItem("cl_token", response.data.token);
      localStorage.setItem("cl_userEmail", response.data.email);
      localStorage.setItem("cl_username", response.data.username);

      // 4. Feedback visual
      showToast("¡Sesión iniciada correctamente!", "success");

      // Redirección o actualización de estado global aquí si aplica...
    } catch (error) {
      // 5. Manejo de errores devueltos por el backend
      const errorMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message || "No hay conexión con el servidor.";

      showToast(errorMessage, "error");
    } finally {
      // 6. Finalizar el estado de carga
      setIsLoginLoading(false);
    }
  };

  return (
    <>
      {/* TOAST CONTAINER */}
      <div className="toast-container" id="toastContainer">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>

      {/* THEME TOGGLE BUTTON */}
      <button className="theme-toggle" onClick={toggleTheme} id="themeToggle">
        {theme === "dark" ? (
          <svg
            id="sunIcon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        ) : (
          <svg
            id="moonIcon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
        <span id="themeLabel">{theme === "dark" ? "Oscuro" : "Claro"}</span>
      </button>

      {/* MAIN GRID CONTAINER */}
      <div className="page-grid">
        {/* ASIDE PANEL */}
        <aside className="aside-panel">
          <div className="overlay-top"></div>
          <div className="overlay-bottom"></div>

          <div className="aside-logo">
            <Logo />
          </div>

          <div className="aside-content">
            <h1>
              Mercosur
              <br />
              Enterprise Portal
            </h1>
            <p className="subtitle">
              Tu portal unificado de acceso centralizado para la gestión de
              sistemas.
            </p>

            <ul className="feature-list">
              {/* Sistema de RRHH */}
              <li className="feature-item">
                <span className="feature-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <polyline points="16 11 18 13 22 9" />
                  </svg>
                </span>
                <div className="feature-text">
                  <p>Sistema de RRHH</p>
                  <p>Gestiona tu ficha de empleado</p>
                </div>
              </li>

              {/* Sistema de Canales de Atención */}
              <li className="feature-item">
                <span className="feature-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </span>
                <div className="feature-text">
                  <p>Sistema de Canales de Atención</p>
                  <p>Atiende a tus clientes de manera eficiente</p>
                </div>
              </li>

              {/* Base de datos de Conocimiento */}
              <li className="feature-item">
                <span className="feature-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </span>
                <div className="feature-text">
                  <p>Base de datos de Conocimiento</p>
                  <p>Accede a información valiosa para nuestros clientes</p>
                </div>
              </li>
            </ul>
          </div>

          <p className="aside-footer">
            &copy; 2026 MERCOSUR Casa de Bolsa C.A.
            <br />
            GCIA. General de Tecnología de la Información
          </p>
        </aside>

        {/* MAIN PANEL */}
        <main className="main-panel">
          <div className="form-wrapper">
            <div className="mobile-logo">
              <Logo />
            </div>

            {/* VISTA LOGIN */}
            {currentView === "login" && (
              <div className="view-login active" id="viewLogin">
                <div className="form-header">
                  <h2>Iniciar sesión</h2>
                  <p>Accede a tu portal interno de MERCOSUR</p>
                </div>

                <div className="glass-card">
                  <form onSubmit={handleLoginSubmit} noValidate>
                    <div className="form-group">
                      <label htmlFor="loginEmail">Correo electrónico</label>
                      <input
                        type="email"
                        id="loginEmail"
                        className={`form-input ${loginErrors.email ? "error" : ""}`}
                        placeholder="correo@ejemplo.com"
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value.toLowerCase());
                          setLoginErrors((prev) => ({ ...prev, email: false }));
                        }}
                        required
                      />
                      <div
                        className={`error-message ${loginErrors.email ? "visible" : ""}`}
                      >
                        Ingresa un correo válido
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="loginPassword">Contraseña</label>
                      <div className="password-wrapper">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          id="loginPassword"
                          className={`form-input ${loginErrors.password ? "error" : ""}`}
                          placeholder="Contraseña"
                          autoComplete="current-password"
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            setLoginErrors((prev) => ({
                              ...prev,
                              password: false,
                            }));
                          }}
                          required
                        />
                        <button
                          type="button"
                          className="toggle-password-btn"
                          onClick={() =>
                            setShowLoginPassword(!showLoginPassword)
                          }
                          aria-label="Mostrar u ocultar contraseña"
                        >
                          {showLoginPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ width: "1.25rem", height: "1.25rem" }}
                            >
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                              <line x1="1" x2="23" y1="1" y2="23" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ width: "1.25rem", height: "1.25rem" }}
                            >
                              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div
                        className={`error-message ${loginErrors.password ? "visible" : ""}`}
                      >
                        La contraseña es requerida
                      </div>
                    </div>

                    <div className="forgot-link">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          showToast(
                            "Función de recuperación próximamente",
                            "info",
                          );
                        }}
                      >
                        ¿Olvidó su contraseña?
                      </a>
                    </div>

                    <button
                      type="submit"
                      className={`btn-primary ${isLoginLoading ? "loading" : ""}`}
                      disabled={isLoginLoading}
                    >
                      <span className="btn-label">Iniciar sesión</span>
                      <div className="spinner"></div>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Login;
