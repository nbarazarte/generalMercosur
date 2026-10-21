import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export const useSocket = (serverUrl) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    let baseUrl = serverUrl;
    let socketPath = "/socket.io/";

    // Extrae automáticamente el subdirectorio si existe (ej: /apimep)
    try {
      const urlObj = new URL(serverUrl);
      if (urlObj.pathname && urlObj.pathname !== "/") {
        baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        socketPath = `${urlObj.pathname.replace(/\/$/, "")}/socket.io/`;
      }
    } catch (e) {
      // Si la URL es relativa o formato simple, usa valores por defecto
    }

    socketRef.current = io(baseUrl, {
      path: socketPath,
      autoConnect: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [serverUrl]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};