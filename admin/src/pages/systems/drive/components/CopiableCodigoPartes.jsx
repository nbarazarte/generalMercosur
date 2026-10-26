import { useCopiaPortapapeles } from "../../tickets/hooks/useCopiaPortapapeles";
import { DynamicIcon } from "../../../../components/IconCatalog";

export default function CopiableCodigoPartes({ partes, codigo }) {
  const { copiado, copiar } = useCopiaPortapapeles(codigo);

  // Función para recortar visualmente la URL larga
  const acortarUrlVisual = (url) => {
    if (!url || typeof url !== "string") return "";
    if (url.length <= 45) return url;
    // Muestra el inicio y los primeros caracteres del token con puntos suspensivos
    return url.substring(0, 42) + ".....";
  };

  return (
    <>
      <span>{partes[0]}</span>
      <code
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.25)",
          padding: "3px 8px",
          borderRadius: "4px",
          fontFamily: "monospace",
          fontSize: "12px",
          wordBreak: "break-all",
        }}
        title={codigo} // Muestra la URL completa al pasar el cursor por encima
      >
        {acortarUrlVisual(codigo)}
      </code>
      <button
        type="button"
        onClick={copiar}
        style={{
          background: copiado
            ? "rgba(255, 255, 255, 0.4)"
            : "rgba(255, 255, 255, 0.25)",
          border: "none",
          color: "#ffffff",
          padding: "4px 8px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "600",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          transition: "background 0.2s ease",
          flexShrink: 0,
        }}
        title="Copiar enlace completo al portapapeles"
      >
        <DynamicIcon
          name={copiado ? "FiCheck" : "FiCopy"}
          style={{ fontSize: "12px" }}
        />
        {copiado ? "¡Copiado!" : "Copiar"}
      </button>
      <span>{partes[1]}</span>
    </>
  );
}