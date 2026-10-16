import { useCopiaPortapapeles } from "../../../systems/tickets/hooks/useCopiaPortapapeles";
import { DynamicIcon } from "../../../../components/IconCatalog";

export default function CopiableCodigoPartes({ partes, codigo }) {
  const { copiado, copiar } = useCopiaPortapapeles(codigo);

  return (
    <>
      <span>{partes[0]}</span>
      <code
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.25)",
          padding: "2px 6px",
          borderRadius: "4px",
          fontFamily: "monospace",
          fontWeight: "bold",
        }}
      >
        {codigo}
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
          padding: "3px 8px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "600",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          transition: "background 0.2s ease",
        }}
        title="Copiar código al portapapeles"
      >
        <DynamicIcon
          name={copiado ? "FiCheck" : "FiCopy"}
          style={{ fontSize: "12px" }}
        />
        {copiado ? "¡Copiado!" : ""}
      </button>
      <span>{partes[1]}</span>
    </>
  );
}