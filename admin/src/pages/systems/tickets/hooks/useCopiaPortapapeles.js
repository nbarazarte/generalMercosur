import { useState } from "react";

export function useCopiaPortapapeles(textoACopiar, tiempoFeedback = 2000) {
  const [copiado, setCopiado] = useState(false);

  const copiar = () => {
    if (!textoACopiar) return;
    navigator.clipboard.writeText(textoACopiar);
    setCopiado(true);
    setTimeout(() => {
      setCopiado(false);
    }, tiempoFeedback);
  };

  return { copiado, copiar };
}
