import { useState } from "react";

export const useLogin = () => {
  const [toasts, setToasts] = useState([]);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3300);
  };

  const handleMicrosoftLogin = () => {
    setIsLoginLoading(true);
    const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
    const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
    const redirectUri = encodeURIComponent(import.meta.env.VITE_AZURE_REDIRECT_URI);
    
    // Construir la URL de autorización OIDC de Microsoft
    const microsoftLoginUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid%20profile%20email%20User.Read&response_mode=query`;

    // Redirigir al usuario al portal de Microsoft
    window.location.href = microsoftLoginUrl;
  };

  return {
    toasts,
    showToast,
    isLoginLoading,
    handleMicrosoftLogin,
  };
};

export default useLogin;