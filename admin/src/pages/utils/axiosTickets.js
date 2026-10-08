// src/utils/axiosTickets.js
import axios from "axios";
import { store } from "../../store/store";
import { updateAccessToken, logout } from "../../store/authSlice";
import { persistor } from "../../store/store";

const API_URL = import.meta.env.VITE_URL_API_TICKETS;
const SEGURIDAD_URL = import.meta.env.VITE_URL_API_LOCAL_SEGURIDAD;
const API_TOKEN = import.meta.env.VITE_TOKEN;

const axiosTickets = axios.create({
  baseURL: API_URL,
  headers: {
    "x-client-uuid": API_TOKEN,
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Interceptor de Request: Añade el Bearer Token actual de Redux automáticamente
axiosTickets.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token || state.auth.user?.token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Interceptor de Response: Maneja errores 401, 403 y Refresh Token automático
axiosTickets.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 💡 CAMBIO AQUÍ: Añadimos || error.response.status === 403
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosTickets(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const state = store.getState();
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        forceLogout("No hay sesión activa. Inicie sesión nuevamente.");
        return Promise.reject(error);
      }

      try {
        // Petición para refrescar el token usando la API de seguridad
        const response = await axios.post(
          `${SEGURIDAD_URL}/refresh-token`,
          {
            refreshToken,
          },
          {
            headers: { "x-client-uuid": API_TOKEN },
          },
        );

        const newAccessToken = response.data.token;

        // Actualizamos Redux con el nuevo token de acceso
        store.dispatch(updateAccessToken(newAccessToken));

        // Reintentamos la petición original con el nuevo token
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        isRefreshing = false;

        return axiosTickets(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        forceLogout(
          "Su sesión ha expirado por completo. Inicie sesión de nuevo.",
        );
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

function forceLogout(message) {
  store.dispatch(logout());
  persistor.flush().then(() => persistor.purge());
  window.localStorage.removeItem("persist:root");

  if (!window.location.pathname.includes("/login")) {
    window.location.href = `/login?expired=true&msg=${encodeURIComponent(message)}`;
  }
}

export default axiosTickets;
