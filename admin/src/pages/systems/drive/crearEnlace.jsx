import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../../components/IconCatalog";
import { useCrearEnlace } from "./hooks/useCrearEnlace";
import { SelectorArchivosDrive } from "./components/SelectorArchivosDrive";
import { useState } from "react";

export default function CrearEnlace() {
  const {
    strNombreEnlace,
    setStrNombreEnlace,
    fechaExpiracion,
    setFechaExpiracion,
    fechaMinima,
    archivosDrive,
    archivosSeleccionados,
    setArchivosSeleccionados,
    archivosNuevos,
    setArchivosNuevos,
    toast,
    handleCloseToast,
    isDarkMode,
    isSubmitting,
    handleLimpiarTodo,
    handleSubmit,
    obtenerIconoPorTipo,
    inputStyle,
    labelStyle,
  } = useCrearEnlace();

  const [copiado, setCopiado] = useState(false);

  return (
    <SystemLayout identificacion="Merco Drive" opcionMenu="Crear Enlace">
      {/* Toast tradicional solo para alertas y errores cortos */}
      {toast && !toast.message.includes("|||") && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
            backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "#ffffff",
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          <DynamicIcon
            name={
              toast.type === "success" ? "FiCheckCircle" : "FiAlertTriangle"
            }
            style={{ fontSize: "18px", flexShrink: 0 }}
          />
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={handleCloseToast}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "16px",
              marginLeft: "8px",
            }}
          >
            <DynamicIcon name="FiX" />
          </button>
        </div>
      )}

      {/* MODAL / POPUP ELEGANTE DE ENLACE CREADO (En lugar de toast largo) */}
      {toast &&
        toast.message.includes("|||") &&
        (() => {
          const [tituloTexto, linkUrl] = toast.message.split("|||");
          return (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
              }}
            >
              <div
                style={{
                  background: isDarkMode ? "#1e1e1e" : "#ffffff",
                  color: isDarkMode ? "#ffffff" : "#333333",
                  padding: "28px",
                  borderRadius: "12px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                  width: "100%",
                  maxWidth: "500px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  position: "relative",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      padding: "10px",
                      borderRadius: "50%",
                      color: "#10b981",
                      display: "flex",
                    }}
                  >
                    <DynamicIcon
                      name="FiCheckCircle"
                      style={{ fontSize: "24px" }}
                    />
                  </div>
                  <div>
                    <h3
                      style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}
                    >
                      ¡Enlace generado exitosamente!
                    </h3>
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        fontSize: "13px",
                        opacity: 0.7,
                      }}
                    >
                      {tituloTexto}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      opacity: 0.8,
                    }}
                  >
                    Enlace público de descarga:
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      readOnly
                      value={linkUrl}
                      style={{
                        ...inputStyle,
                        background: isDarkMode ? "#2a2a2a" : "#f3f4f6",
                        cursor: "text",
                      }}
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(linkUrl);
                        setCopiado(true);
                        setTimeout(() => setCopiado(false), 2000);
                      }}
                      style={{
                        padding: "8px 16px",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                      }}
                    >
                      <DynamicIcon name={copiado ? "FiCheck" : "FiCopy"} />
                      {copiado ? "¡Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "8px",
                    paddingTop: "14px",
                    borderTop: "1px solid var(--merco-border, #ccc)",
                  }}
                >
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "13px",
                      color: "var(--merco-accent, #f95700)",
                      textDecoration: "none",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <DynamicIcon name="FiExternalLink" /> Probar enlace
                  </a>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleCloseToast}
                    style={{ padding: "6px 16px", fontSize: "13px" }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* LOADER DE CARGA PARA ARCHIVOS PESADOS */}
      {isSubmitting && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              background: isDarkMode ? "#1e1e1e" : "#ffffff",
              color: isDarkMode ? "#ffffff" : "#333333",
              padding: "28px 36px",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <div style={{ animation: "spin 1.5s linear infinite" }}>
              <DynamicIcon
                name="FiLoader"
                style={{
                  fontSize: "40px",
                  color: "var(--merco-accent, #f95700)",
                }}
              />
            </div>
            <div>
              <h3
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Subiendo y procesando archivos...
              </h3>
              <p style={{ margin: 0, fontSize: "13px", opacity: 0.75 }}>
                Esto puede tomar unos momentos dependiendo del peso de los
                archivos adjuntos. Por favor, no cierres la ventana.
              </p>
            </div>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      <div
        style={{
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
          padding: "8px 12px",
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        <div className="ma-card" style={{ padding: 0, overflow: "hidden" }}>
          <form onSubmit={handleSubmit} style={{ padding: "16px" }}>
            {/* Banner Informativo */}
            <div
              style={{
                marginBottom: "16px",
                padding: "10px 14px",
                borderRadius: "6px",
                background: isDarkMode
                  ? "rgba(249, 87, 0, 0.15)"
                  : "rgba(249, 87, 0, 0.08)",
                border: "1px solid var(--merco-accent, #f95700)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--merco-text)",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              <DynamicIcon
                name="FiLink"
                style={{
                  color: "var(--merco-accent, #f95700)",
                  fontSize: "16px",
                }}
              />
              <span>
                Genera un enlace para compartir uno o múltiples archivos
                alojados en Mercosur Drive.
              </span>
            </div>

            {/* Formulario Principal */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                background: "var(--merco-bg-subtle, rgba(0, 0, 0, 0.02))",
                border: "1px solid var(--merco-border, #ccc)",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: "10px",
                }}
              >
                <div className="field">
                  <label style={labelStyle}>
                    Título del Enlace
                  </label>
                  <input
                    type="text"
                    value={strNombreEnlace}
                    onChange={(e) => setStrNombreEnlace(e.target.value)}
                    placeholder="Ej. Documentos Auditoría 2026..."
                    maxLength={120}
                    required
                    style={inputStyle}
                  />
                </div>

                <div className="field">
                  <label style={labelStyle}>
                    Fecha de vencimiento del enlace
                  </label>
                  <input
                    type="date"
                    min={fechaMinima}
                    value={fechaExpiracion}
                    onChange={(e) => setFechaExpiracion(e.target.value)}
                    required
                    style={{ ...inputStyle, cursor: "pointer" }}
                  />
                </div>
              </div>

              <SelectorArchivosDrive
                archivosDrive={archivosDrive}
                archivosSeleccionados={archivosSeleccionados}
                setArchivosSeleccionados={setArchivosSeleccionados}
                archivosNuevos={archivosNuevos}
                setArchivosNuevos={setArchivosNuevos}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
                obtenerIconoPorTipo={obtenerIconoPorTipo}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 8,
                  paddingTop: 10,
                  borderTop: "1px solid var(--merco-border, #ccc)",
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleLimpiarTodo}
                  disabled={isSubmitting}
                  style={{ padding: "6px 12px", fontSize: "13px" }}
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{
                    padding: "6px 14px",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <DynamicIcon name="FiLink" /> Crear Enlace
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </SystemLayout>
  );
}