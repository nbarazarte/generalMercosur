// src/utils/axiosDrive.js
import axios from "axios";
import { store } from "../store/store";
import { updateAccessToken, logout } from "../store/authSlice";
import { persistor } from "../store/store";

const API_URL = import.meta.env.VITE_URL_API_DRIVE; // Asegúrate de definir esta variable en tu .env
const SEGURIDAD_URL = import.meta.env.VITE_URL_API_LOCAL_SEGURIDAD;
const API_TOKEN = import.meta.env.VITE_TOKEN;

const axiosDrive = axios.create({
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
axiosDrive.interceptors.request.use(
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
axiosDrive.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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
            return axiosDrive(originalRequest);
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
        const response = await axios.post(
          `${SEGURIDAD_URL}/refresh-token`,
          { refreshToken },
          {
            headers: { "x-client-uuid": API_TOKEN },
          },
        );

        const newAccessToken = response.data.token;
        store.dispatch(updateAccessToken(newAccessToken));

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        isRefreshing = false;

        return axiosDrive(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        forceLogout("Su sesión ha expirado por completo. Inicie sesión de nuevo.");
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

export default axiosDrive;