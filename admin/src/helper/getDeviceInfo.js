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
  let os = "Android Móvil";

  // Intentar obtener la marca y modelo exacto desde Client Hints
  if (
    navigator.userAgentData &&
    typeof navigator.userAgentData.getHighEntropyValues === "function"
  ) {
    try {
      const hints = await navigator.userAgentData.getHighEntropyValues([
        "model",
        "platform",
        "platformVersion",
      ]);

      // En un Samsung Galaxy A54, hints.model suele retornar "SM-A546B" o "Galaxy A54 5G"
      if (hints.model) {
        os = `Android (${hints.model})`;
      }
    } catch (e) {
      console.warn("Client Hints no permitidos o no soportados", e);
    }
  }

  return {
    deviceId,
    deviceName: `${browser} en ${os}`,
  };
};

export default getDeviceInfo;
