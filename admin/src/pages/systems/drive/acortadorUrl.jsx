import { useState } from "react";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../../components/IconCatalog";
import { useAcortadorUrl } from "./hooks/useAcortadorUrl";

export default function AcortadorUrl() {
  const {
    strTitulo,
    setStrTitulo,
    strUrlOriginal,
    setStrUrlOriginal,
    fechaExpiracion,
    setFechaExpiracion,
    fechaMinima,
    urlsRecientes,
    loadingLista,
    toast,
    handleCloseToast,
    isDarkMode,
    isSubmitting,
    handleLimpiar,
    handleSubmit,
    inputStyle,
    labelStyle,
  } = useAcortadorUrl();

  const [copiadoModal, setCopiadoModal] = useState(false);
  const [copiadoFilaId, setCopiadoFilaId] = useState(null);

  const copiarAlPortapapeles = (texto, idFila = null) => {
    navigator.clipboard.writeText(texto);
    if (idFila !== null) {
      setCopiadoFilaId(idFila);
      setTimeout(() => setCopiadoFilaId(null), 2000);
    } else {
      setCopiadoModal(true);
      setTimeout(() => setCopiadoModal(false), 2000);
    }
  };

  return (
    <SystemLayout identificacion="Merco Link" opcionMenu="Acortar URL">
      {/* Toast de error o notificación simple */}
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

      {/* Modal de URL corta generada */}
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
                  maxWidth: "480px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
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
                      ¡URL acortada con éxito!
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
                    Enlace corto listo para compartir:
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      readOnly
                      value={linkUrl}
                      style={{
                        ...inputStyle,
                        background: isDarkMode ? "#2a2a2a" : "#f3f4f6",
                      }}
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => copiarAlPortapapeles(linkUrl)}
                      style={{
                        padding: "8px 16px",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                      }}
                    >
                      <DynamicIcon name={copiadoModal ? "FiCheck" : "FiCopy"} />
                      {copiadoModal ? "¡Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "6px",
                    paddingTop: "12px",
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
                    <DynamicIcon name="FiExternalLink" /> Probar redirección
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

      <div
        style={{
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
          padding: "8px 12px",
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* CARD DEL FORMULARIO */}
        <div className="ma-card" style={{ padding: 0, overflow: "hidden" }}>
          <form onSubmit={handleSubmit} style={{ padding: "16px" }}>
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
                name="FiScissors"
                style={{
                  color: "var(--merco-accent, #f95700)",
                  fontSize: "16px",
                }}
              />
              <span>
                Convierte cualquier enlace externo o interno en una URL corta
                corporativa.
              </span>
            </div>

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
              <div className="field">
                <label style={labelStyle}>URL Larga de Destino *</label>
                <input
                  type="url"
                  value={strUrlOriginal}
                  onChange={(e) => setStrUrlOriginal(e.target.value)}
                  placeholder="https://ejemplo.com/ruta/muy/larga/con-parametros..."
                  required
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: "10px",
                }}
              >
                <div className="field">
                  <label style={labelStyle}>Título / Referencia *</label>
                  <input
                    type="text"
                    value={strTitulo}
                    onChange={(e) => setStrTitulo(e.target.value)}
                    placeholder="Ej. Formulario Encuesta Clientes..."
                    maxLength={120}
                    required
                    style={inputStyle}
                  />
                </div>

                <div className="field">
                  <label style={labelStyle}>Expiración (Opcional)</label>
                  <input
                    type="date"
                    min={fechaMinima}
                    value={fechaExpiracion}
                    onChange={(e) => setFechaExpiracion(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 6,
                  paddingTop: 10,
                  borderTop: "1px solid var(--merco-border, #ccc)",
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleLimpiar}
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
                  <DynamicIcon name="FiLink" />
                  {isSubmitting ? "Acortando..." : "Acortar URL"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* HISTORIAL DE ENLACES CORTOS */}
        {/* <div className="ma-card" style={{ padding: "16px" }}>
          <h4
            style={{
              margin: "0 0 12px 0",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Mis URLs Acortadas
          </h4>

          <div style={{ overflowX: "auto" }}>
            <table
              className="ma-table"
              style={{ fontSize: "12px", width: "100%" }}
            >
              <thead>
                <tr>
                  <th>REFERENCIA</th>
                  <th>ENLACE CORTO</th>
                  <th>DESTINO ORIGINAL</th>
                  <th style={{ textAlign: "center" }}>CLICS</th>
                  <th style={{ textAlign: "center" }}>ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {loadingLista ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      Cargando enlaces...
                    </td>
                  </tr>
                ) : urlsRecientes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "24px",
                        color: "var(--merco-muted)",
                      }}
                    >
                      Aún no has acortado ninguna URL.
                    </td>
                  </tr>
                ) : (
                  urlsRecientes.map((item) => {
                    const esCopiado = copiadoFilaId === item.id;
                    return (
                      <tr key={item.id}>
                        <td>
                          <b style={{ color: "var(--merco-accent, #f95700)" }}>
                            {item.str_titulo}
                          </b>
                        </td>
                        <td>
                          <a
                            href={item.linkCorto}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                            }}
                          >
                            {item.linkCorto}
                          </a>
                        </td>
                        <td
                          style={{
                            maxWidth: "240px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "var(--merco-muted)",
                          }}
                          title={item.str_url_original}
                        >
                          {item.str_url_original}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: "700" }}>
                          {item.total_clics}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() =>
                              copiarAlPortapapeles(item.linkCorto, item.id)
                            }
                            title="Copiar URL corta"
                            style={{
                              background: esCopiado
                                ? "#10b981"
                                : "var(--merco-surface)",
                              border: "1px solid var(--merco-border)",
                              color: esCopiado ? "#fff" : "inherit",
                              borderRadius: 6,
                              padding: "4px 10px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: "11px",
                            }}
                          >
                            <DynamicIcon
                              name={esCopiado ? "FiCheck" : "FiCopy"}
                            />
                            {esCopiado ? "Copiado" : "Copiar"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div> */}
      </div>
    </SystemLayout>
  );
}
