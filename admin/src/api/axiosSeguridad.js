// src/utils/axiosSeguridad.js
import axios from "axios";

const API_URL = import.meta.env.VITE_URL_API_LOCAL_SEGURIDAD;
const API_TOKEN = import.meta.env.VITE_TOKEN;

const axiosSeguridad = axios.create({
  baseURL: API_URL,
  headers: {
    "x-client-uuid": API_TOKEN,
  },
});

export default axiosSeguridad;
