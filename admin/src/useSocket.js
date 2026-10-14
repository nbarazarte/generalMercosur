import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export const useSocket = (serverUrl) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Inicializa la conexión con el servidor de WebSockets
    // Si no le pasas URL, por defecto intentará conectarse al dominio actual
    socketRef.current = io(serverUrl, {
      autoConnect: true,
      // Puedes agregar opciones adicionales aquí si las necesitas (ej. auth, transports)
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Limpieza al desmontar el componente
    return () => {
      socket.disconnect();
    };
  }, [serverUrl]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};
