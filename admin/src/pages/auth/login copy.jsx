import { useLogin } from "../auth/hooks/useLogin";

const Login = () => {
  const {
    toasts,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    showLoginPassword,
    setShowLoginPassword,
    loginErrors,
    setLoginErrors,
    isLoginLoading,
    handleLoginSubmit,
    handleRecoverPassword,
  } = useLogin();

  return (
    <>
      <div className="toast-container" id="toastContainer">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>

      <div className="view-login active" id="viewLogin">
        <div className="flex flex-col w-full items-center justify-center">
          <h2 className="text-3xl font-bold pt-32">Iniciar sesión</h2>
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
                    setLoginErrors((prev) => ({ ...prev, password: false }));
                  }}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
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
              <a href="#" onClick={handleRecoverPassword}>
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
    </>
  );
};

export default Login;