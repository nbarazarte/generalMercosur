// src/helper/getDeviceInfo.js

const getDeviceInfo = async () => {
  let deviceId = localStorage.getItem("cl_deviceId");

  if (!deviceId) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      deviceId = crypto.randomUUID();
    } else {
      deviceId =
        "dev_" +
        Math.random().toString(36).substring(2, 15) +
        Date.now().toString(36);
    }
    localStorage.setItem("cl_deviceId", deviceId);
  }

  const ua = navigator.userAgent;
  let browser = "Chrome";
  let os = "Dispositivo Desconocido";

  // 1. Detectar Navegador
  if (ua.includes("Chrome") && !ua.includes("Edg") && !ua.includes("OPR")) {
    browser = "Chrome";
  } else if (ua.includes("Edg")) {
    browser = "Edge";
  } else if (ua.includes("Firefox")) {
    browser = "Firefox";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browser = "Safari";
  }

  // 2. Intentar API moderna (Client Hints en HTTPS para Android)
  let detectedModel = null;
  if (navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === "function") {
    try {
      const hints = await navigator.userAgentData.getHighEntropyValues(["model", "platform"]);
      if (hints.model) {
        detectedModel = hints.model; // ej. "SM-A546B"
      }
    } catch (e) {
      // Ignorar error en HTTP
    }
  }

  // 3. Evaluar Sistema Operativo y Dispositivo
  if (detectedModel) {
    os = `Android (${detectedModel})`;
  } else if (/Win/i.test(ua)) {
    os = "Windows PC";
  } else if (/Mac/i.test(ua) && !/iPhone|iPad/i.test(ua)) {
    os = "macOS";
  } else if (/Linux/i.test(ua) && !/Android/i.test(ua)) {
    os = "Linux PC";
  } else if (/iPhone/i.test(ua)) {
    os = "iPhone (iOS)";
  } else if (/iPad/i.test(ua)) {
    os = "iPad (iPadOS)";
  } else if (/Android/i.test(ua)) {
    os = "Android Móvil";
  }

  return {
    deviceId,
    deviceName: `${browser} en ${os}`,
  };
};

export default getDeviceInfo;