import { useLogin } from "../auth/hooks/useLogin";

const Login = () => {
  const { toasts, handleMicrosoftLogin, isLoginLoading } = useLogin();

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
          <p className="text-sm text-gray-500 mt-2">Portal de Acceso Unificado - Mercosur</p>
        </div>

        <div className="glass-card flex flex-col items-center justify-center p-8 mt-6">
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            className={`btn-primary flex items-center justify-center gap-3 w-full py-3 ${isLoginLoading ? "loading" : ""}`}
            disabled={isLoginLoading}
          >
            {/* Icono opcional de Microsoft */}
            <svg className="w-5 h-5" viewBox="0 0 23 23" fill="currentColor">
              <path fill="#f3f3f3" d="M0 0h11v11H0z"/>
              <path fill="#f3f3f3" d="M12 0h11v11H12z"/>
              <path fill="#f3f3f3" d="M0 12h11v11H0z"/>
              <path fill="#f3f3f3" d="M12 12h11v11H12z"/>
            </svg>
            <span className="btn-label">Iniciar sesión con Microsoft Entra ID</span>
            <div className="spinner"></div>
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;