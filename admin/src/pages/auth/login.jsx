import { useLogin } from "../auth/hooks/useLogin";
import { DynamicIcon } from "../../components/IconCatalog";

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
        </div>

        <div className="glass-card flex flex-col items-center justify-center p-8 mt-6">
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            className={`btn-primary flex items-center justify-center gap-3 w-full py-3 ${isLoginLoading ? "loading" : ""}`}
            disabled={isLoginLoading}
          >
            <DynamicIcon name="BsWindows" />
            <span className="btn-label">Microsoft Entra ID</span>
            <div className="spinner"></div>
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
