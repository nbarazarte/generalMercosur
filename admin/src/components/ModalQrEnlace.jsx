import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { DynamicIcon } from "./IconCatalog";

export function ModalQrEnlace({
  abierto,
  onClose,
  titulo,
  urlCorta,
  isDarkMode = false,
}) {
  const canvasWrapperRef = useRef(null);

  if (!abierto || !urlCorta) return null;

  const descargarPng = () => {
    const canvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const nombreSanitizado = (titulo || "qr-enlace")
      .trim()
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g, "_");

    link.href = pngUrl;
    link.download = `QR_${nombreSanitizado}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        zIndex: 10001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: isDarkMode ? "#1e1e1e" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#333333",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          width: "100%",
          maxWidth: "380px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
            Código QR del Enlace
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "18px",
              display: "inline-flex",
            }}
          >
            <DynamicIcon name="FiX" />
          </button>
        </div>

        <div
          style={{
            fontSize: "12px",
            opacity: 0.75,
            textAlign: "center",
            wordBreak: "break-word",
          }}
        >
          <b>{titulo}</b>
        </div>

        {/* Contenedor del QR: fondo blanco y margen quiet-zone para lectura rápida en cámara */}
        <div
          ref={canvasWrapperRef}
          style={{
            background: "#ffffff",
            padding: "16px",
            borderRadius: "10px",
            border: "1px solid var(--merco-border, #ddd)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <QRCodeCanvas
            value={urlCorta}
            size={200}
            bgColor="#ffffff"
            fgColor="#111111"
            level="M"
            marginSize={2}
          />
        </div>

        <div
          style={{
            width: "100%",
            fontSize: "11px",
            fontFamily: "monospace",
            padding: "8px 10px",
            borderRadius: "6px",
            background: isDarkMode ? "#2a2a2a" : "#f3f4f6",
            wordBreak: "break-all",
            textAlign: "center",
          }}
        >
          {urlCorta}
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            marginTop: "4px",
          }}
        >
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            style={{ padding: "6px 14px", fontSize: "12px" }}
          >
            Cerrar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={descargarPng}
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <DynamicIcon name="FiDownload" />
            Descargar PNG
          </button>
        </div>
      </div>
    </div>
  );
}
