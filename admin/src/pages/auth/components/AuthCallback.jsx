import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../../store/authSlice";
import axiosSeguridad from "../../../api/axiosSeguridad";
import getDeviceInfo from "../../../helper/getDeviceInfo";

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hasRequested = useRef(false); // Evita doble ejecución en StrictMode de React

  useEffect(() => {
    const code = searchParams.get("code");
    
    if (code && !hasRequested.current) {
      hasRequested.current = true;
      
      const processLogin = async () => {
        try {
          const { deviceId, deviceName } = await getDeviceInfo();
          
          // Enviar el código al backend que creaste en el Paso 2
          const response = await axiosSeguridad.post("/auth/entra-callback", {
            code,
            device_id: deviceId,
            device_name: deviceName,
          });

          // Guardar usuario y tokens en Redux / Estado global
          dispatch(setUser(response.data));
          navigate("/home");
        } catch (error) {
          console.error("Error al autenticar con Entra ID:", error);
          navigate("/");
        }
      };

      processLogin();
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="spinner mb-4" style={{ width: "2rem", height: "2rem" }}></div>
      <h2 className="text-xl font-semibold">Validando credenciales con Microsoft Entra ID...</h2>
      <p className="text-sm text-gray-500 mt-2">Por favor espere un momento.</p>
    </div>
  );
};

export default AuthCallback;