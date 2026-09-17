import React, { useState, useEffect, useRef } from "react";

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

  // ===== ESTADOS DE REGISTRO =====
  const [currentStep, setCurrentStep] = useState(1);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regTerms, setRegTerms] = useState(false);
  const [regErrors, setRegErrors] = useState({
    name: false,
    email: false,
    phone: false,
  });
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const otpInputsRef = useRef([]);

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

  // ===== CAMBIO DE VISTA =====
  const handleSwitchView = (view) => {
    setCurrentView(view);
    if (view === "login") {
      resetStepper();
    }
  };

  // ===== MANEJO DE LOGIN =====
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    let valid = true;
    const errors = { email: false, password: false };

    if (!loginEmail || !loginEmail.includes("@")) {
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

    setTimeout(() => {
      setIsLoginLoading(false);
      showToast("¡Sesión iniciada correctamente!", "success");
    }, 1500);
  };

  // ===== MANEJO DEL STEPPER DE REGISTRO =====
  const validateStep = (step) => {
    if (step === 1) {
      let valid = true;
      const errors = { name: false, email: false, phone: false };

      if (!regName.trim()) {
        errors.name = true;
        valid = false;
      }

      if (!regEmail || !regEmail.includes("@")) {
        errors.email = true;
        valid = false;
      }

      if (!regPhone.trim() || regPhone.trim().length < 8) {
        errors.phone = true;
        valid = false;
      }

      setRegErrors(errors);

      if (!regTerms) {
        showToast("Debes aceptar los términos y condiciones", "error");
        valid = false;
      }

      return valid;
    }
    return true;
  };

  const goToStep = (step) => {
    if (step > currentStep) {
      if (!validateStep(currentStep)) return;
    }
    setCurrentStep(step);
  };

  const completeRegistration = () => {
    setIsRegisterLoading(true);

    setTimeout(() => {
      setIsRegisterLoading(false);
      setCurrentStep("success");
    }, 1800);
  };

  const resetStepper = () => {
    setCurrentStep(1);
    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegTerms(false);
    setRegErrors({ name: false, email: false, phone: false });
    setOtpCode(["", "", "", "", "", ""]);
  };

  // ===== MANEJO DE OTP CODE (Móvil / Web) =====
  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (val && /^\d$/.test(val)) {
      const newOtp = [...otpCode];
      newOtp[index] = val;
      setOtpCode(newOtp);

      if (index < 5 && otpInputsRef.current[index + 1]) {
        otpInputsRef.current[index + 1].focus();
      }
    } else if (!val) {
      const newOtp = [...otpCode];
      newOtp[index] = "";
      setOtpCode(newOtp);
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      if (otpInputsRef.current[index - 1]) {
        otpInputsRef.current[index - 1].focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData)
      .getData("text")
      .trim();
    if (/^\d{6}$/.test(paste)) {
      const newOtp = paste.split("");
      setOtpCode(newOtp);
      if (otpInputsRef.current[5]) {
        otpInputsRef.current[5].focus();
      }
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
            <svg
              viewBox="0 0 280 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="40"
                y="40"
                width="200"
                height="8"
                rx="4"
                fill="rgba(255,255,255,0.9)"
              />
              <text
                x="140"
                y="95"
                textAnchor="middle"
                fill="white"
                fontFamily="Poppins, sans-serif"
                fontSize="32"
                fontWeight="700"
                letterSpacing="6"
              >
                MERCOADMIN
              </text>
              <text
                x="140"
                y="130"
                textAnchor="middle"
                fill="rgba(255,255,255,0.7)"
                fontFamily="Inter, sans-serif"
                fontSize="14"
                fontWeight="500"
                letterSpacing="3"
              >
                SISTEMA ADMINISTRATIVO
              </text>
              <rect
                x="60"
                y="155"
                width="160"
                height="4"
                rx="2"
                fill="rgba(255,255,255,0.3)"
              />
            </svg>
          </div>

          <div className="aside-content">
            <h1>
              Tu Casa de Bolsa,
              <br />
              en tu bolsillo.
            </h1>
            <p className="subtitle">
              Opera en la Bolsa de Valores de Caracas, sigue tu portafolio y
              gestiona tus saldos desde un solo lugar.
            </p>

            <ul className="feature-list">
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
                    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </span>
                <div className="feature-text">
                  <p>Mercado en tiempo real</p>
                  <p>Cotizaciones y órdenes al instante</p>
                </div>
              </li>
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
                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                  </svg>
                </span>
                <div className="feature-text">
                  <p>Tu portafolio, claro</p>
                  <p>Saldos y posiciones siempre a la mano</p>
                </div>
              </li>
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
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
                <div className="feature-text">
                  <p>Seguridad primero</p>
                  <p>Acceso biométrico y verificación KYC</p>
                </div>
              </li>
            </ul>
          </div>

          <p className="aside-footer">
            &copy; 2026 MERCOSUR Casa de Bolsa C.A.
          </p>
        </aside>

        {/* MAIN PANEL */}
        <main className="main-panel">
          <div className="form-wrapper">
            <div className="mobile-logo">
              <svg
                viewBox="0 0 280 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <text
                  x="140"
                  y="110"
                  textAnchor="middle"
                  fill="var(--foreground)"
                  fontFamily="Poppins, sans-serif"
                  fontSize="30"
                  fontWeight="700"
                  letterSpacing="5"
                >
                  MERCOADMIN
                </text>
                <text
                  x="140"
                  y="140"
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  fontFamily="Inter, sans-serif"
                  fontSize="12"
                  fontWeight="500"
                  letterSpacing="3"
                >
                  Sistema Administrativo
                </text>
              </svg>
            </div>

            {/* VISTA LOGIN */}
            {currentView === "login" && (
              <div className="view-login active" id="viewLogin">
                <div className="form-header">
                  <h2>Iniciar sesión</h2>
                  <p>Accede a tu portafolio y opera con MERCOSUR.</p>
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
                          setLoginEmail(e.target.value);
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
