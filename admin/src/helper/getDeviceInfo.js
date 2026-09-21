// Helper para obtener/generar el ID y nombre del dispositivo
export const getDeviceInfo = () => {
  // 1. Obtener o generar un UUID persistente para este navegador
  let deviceId = localStorage.getItem("cl_deviceId");
  
  if (!deviceId) {
    // Si la API crypto.randomUUID() está disponible (modern browsers)
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      deviceId = crypto.randomUUID();
    } else {
      // Fallback básico para entornos más antiguos
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    localStorage.setItem("cl_deviceId", deviceId);
  }

  // 2. Detectar nombre legible del dispositivo/navegador desde el User-Agent
  const ua = navigator.userAgent;
  let browser = "Navegador Desconocido";
  let os = "OS Desconocido";

  // Detección simple de SO
  if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  // Detección simple de Navegador
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";

  const deviceName = `${browser} en ${os}`;

  return { deviceId, deviceName };
};