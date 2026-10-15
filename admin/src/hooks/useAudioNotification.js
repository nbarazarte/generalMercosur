import { useEffect, useRef } from "react";

export function useAudioNotification(soundFile) {
  const audioBufferRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioUnlockedRef = useRef(false);

  useEffect(() => {
    const cargarAudioBuffer = async () => {
      try {
        const response = await fetch(soundFile);
        const arrayBuffer = await response.arrayBuffer();

        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
          audioBufferRef.current =
            await audioContextRef.current.decodeAudioData(arrayBuffer);
        }
      } catch (err) {
        console.error("Error al precargar el buffer de audio:", err);
      }
    };
    cargarAudioBuffer();
  }, [soundFile]);

  const desbloquearAudio = () => {
    if (!audioUnlockedRef.current) {
      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;
        if (!audioContextRef.current && AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
        if (audioContextRef.current) {
          if (audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume().then(() => {
              audioUnlockedRef.current = true;
            });
          } else {
            audioUnlockedRef.current = true;
          }
        }
      } catch (err) {
        console.log("Error al desbloquear el AudioContext:", err);
      }
    }
  };

  const reproducirSonidoAlerta = () => {
    try {
      if (audioContextRef.current && audioBufferRef.current) {
        if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume();
        }
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBufferRef.current;
        source.connect(audioContextRef.current.destination);
        source.start(0);
      }
    } catch (err) {
      console.log("Error al reproducir audio mediante Web Audio API:", err);
    }
  };

  return {
    desbloquearAudio,
    reproducirSonidoAlerta,
  };
}
