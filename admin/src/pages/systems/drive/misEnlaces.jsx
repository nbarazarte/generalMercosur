import React from "react";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../../components/IconCatalog";
import { useListarEnlaces } from "./hooks/useListarEnlaces";
import axiosDrive from "../../../api/axiosDrive";

export default function MisEnlaces() {
  const {
    enlaces,
    enlacesFiltrados,
    loading,
    toast,
    busqueda,
    setBusqueda,
    paginaActual,
    setPaginaActual,
    porPagina,
    totalPaginas,
    registroInicio,
    registroFin,
    expandidos,
    toggleExpandir,
    editandoId,
    setEditandoId,
    nuevaFecha,
    setNuevaFecha,
    copiadoId,
    handleCopiar,
    handleExtenderVigencia,
    handlePorPaginaChange,
    tarjetasKpi,
    filtroStyle,
  } = useListarEnlaces();

  return (
    <SystemLayout identificacion="Merco Drive" opcionMenu="Mis Enlaces">
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 8,
            background: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "#fff",
            fontWeight: 500,
            fontSize: 13,
          }}
        >
          {toast.message}
        </div>
      )}

      <div style={{ fontFamily: "var(--font-sans, system-ui)", padding: "10px 0" }}>
        {/* TARJETAS KPI */}
        <div
          className="ma-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          {tarjetasKpi.map((item, index) => (
            <div className="ma-stat" key={index}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 20, color: item.color, display: "inline-flex" }}>
                  <DynamicIcon name={item.icono} />
                </span>
              </div>
              <div className="val">{item.valor}</div>
              <div className="lbl" style={{ marginTop: 2 }}>{item.titulo}</div>
            </div>
          ))}
        </div>

        {/* TOOLBAR / FILTRO DE BÚSQUEDA */}
        <div className="ma-toolbar" style={{ marginTop: 0, flexDirection: "column", alignItems: "stretch", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
              <DynamicIcon
                name="FiSearch"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }}
              />
              <input
                type="text"
                placeholder="Buscar por nombre de enlace o creador..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ ...filtroStyle, width: "100%", paddingLeft: "36px" }}
              />
            </div>
          </div>
        </div>

        {/* TABLA DE ENLACES */}
        <div className="ma-card" style={{ marginTop: 15, display: "flex", flexDirection: "column" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="ma-table" style={{ fontSize: "12px" }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>NOMBRE DEL ENLACE</th>
                  <th>CREADOR</th>
                  <th>FECHA CREACIÓN</th>
                  <th>VENCIMIENTO</th>
                  <th style={{ textAlign: "center" }}>ARCHIVOS</th>
                  <th style={{ textAlign: "center" }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                      Cargando enlaces...
                    </td>
                  </tr>
                ) : enlaces.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--merco-muted)" }}>
                      No se encontraron enlaces generados recientemente.
                    </td>
                  </tr>
                ) : (
                  enlaces.map((enlace) => {
                    const estaAbierto = !!expandidos[enlace.id];
                    const listaArchivos = enlace.archivos || [];
                    const esCopiado = copiadoId === enlace.id;

                    return (
                      <React.Fragment key={enlace.id}>
                        <tr style={{ fontSize: "12px", borderBottom: estaAbierto ? "none" : undefined }}>
                          <td style={{ textAlign: "center", paddingRight: 0 }}>
                            <button
                              className="btn-icon"
                              onClick={() => toggleExpandir(enlace.id)}
                              title={estaAbierto ? "Ocultar archivos" : "Ver archivos asociados"}
                              style={{
                                transform: estaAbierto ? "rotate(90deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease",
                                fontSize: 12,
                                cursor: "pointer",
                              }}
                            >
                              <DynamicIcon name="FiArrowRight" />
                            </button>
                          </td>
                          <td>
                            <b style={{ color: "var(--merco-accent, #f95700)" }}>{enlace.str_nombre_enlace}</b>
                          </td>
                          <td>{enlace.str_nombre_usuario}</td>
                          <td>{new Date(enlace.created_at).toLocaleDateString()}</td>
                          <td>{enlace.fecha_expiracion ? new Date(enlace.fecha_expiracion).toLocaleDateString() : "—"}</td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 8, background: "rgba(249, 115, 22, 0.15)", color: "var(--merco-accent, #f97316)", fontWeight: 700 }}>
                              {listaArchivos.length} ({enlace.pesoTotalMb} MB)
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{ padding: "4px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: enlace.estaExpirado ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", color: enlace.estaExpirado ? "#ef4444" : "#10b981" }}>
                              {enlace.estaExpirado ? "Expirado" : "Activo"}
                            </span>
                          </td>
                        </tr>

                        {/* FILA EXPANDIBLE CON LINK DE DESCARGA, DESCARGA LOCAL Y ARCHIVOS */}
                        {estaAbierto && (
                          <tr style={{ background: "var(--merco-bg-subtle, rgba(255, 255, 255, 0.02))" }}>
                            <td colSpan={7} style={{ padding: "12px 20px 20px 48px" }}>
                              <div style={{ padding: 16, borderRadius: 8, border: "1px solid var(--merco-border, #333)", background: "var(--merco-bg, #1a1a1a)" }}>
                                
                                {/* Sección de Link de Descarga Pública y Copiar */}
                                {!enlace.estaExpirado && (
                                  <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.2)", padding: "6px 10px", borderRadius: 6 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.8 }}>Link:</span>
                                    <input
                                      type="text"
                                      readOnly
                                      value={enlace.linkDescarga}
                                      style={{
                                        flex: 1,
                                        fontSize: 12,
                                        padding: "4px 8px",
                                        border: "1px solid var(--merco-border)",
                                        borderRadius: 4,
                                        background: "transparent",
                                        color: "inherit",
                                        outline: "none"
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleCopiar(enlace.id, enlace.linkDescarga)}
                                      title="Copiar enlace"
                                      style={{
                                        background: esCopiado ? "#10b981" : "var(--merco-surface)",
                                        border: "1px solid var(--merco-border)",
                                        color: esCopiado ? "#fff" : "inherit",
                                        borderRadius: 6,
                                        width: 32,
                                        height: 32,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        flexShrink: 0
                                      }}
                                    >
                                      <DynamicIcon name={esCopiado ? "FiCheck" : "FiCopy"} style={{ fontSize: 14 }} />
                                    </button>
                                  </div>
                                )}

                                {/* Controles superiores: Botón de Descarga Local y Extender Vigencia */}
                                <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                                  
                                  {/* Botón de Descarga Local Directa (Seguro por JS sin perder sesión) */}
                                  <button
                                    type="button"
                                    className="btn btn-ghost"
                                    title="Descargar archivos localmente desde el servidor"
                                    onClick={async () => {
                                      try {
                                        const response = await axiosDrive.get(`/descargar-local/${enlace.id}`, {
                                          responseType: "blob",
                                        });

                                        const disposition = response.headers["content-disposition"];
                                        let fileName = `archivos-drive-${enlace.id}.zip`;
                                        if (disposition && disposition.indexOf("attachment") !== -1) {
                                          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                                          const matches = filenameRegex.exec(disposition);
                                          if (matches != null && matches[1]) {
                                            fileName = matches[1].replace(/['"]/g, "");
                                          }
                                        }

                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                        const link = document.createElement("a");
                                        link.href = url;
                                        link.setAttribute("download", fileName);
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                        window.URL.revokeObjectURL(url);
                                      } catch (err) {
                                        console.error("Error al descargar archivo localmente:", err);
                                        alert("No se pudo completar la descarga local del archivo.");
                                      }
                                    }}
                                    style={{
                                      padding: "5px 10px",
                                      fontSize: 11,
                                      fontWeight: 600,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 6,
                                      border: "1px solid var(--merco-border)",
                                      borderRadius: 6,
                                      background: "var(--merco-surface)",
                                      color: "inherit",
                                      cursor: "pointer"
                                    }}
                                  >
                                    <DynamicIcon name="FiDownload" style={{ fontSize: 13, color: "var(--merco-accent, #f95700)" }} />
                                    Descargar Local
                                  </button>

                                  {/* Sección de Extender Vigencia Estética */}
                                  <div>
                                    {editandoId === enlace.id ? (
                                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.15)", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--merco-border)" }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>Nueva fecha:</span>
                                        <input
                                          type="date"
                                          value={nuevaFecha}
                                          onChange={(e) => setNuevaFecha(e.target.value)}
                                          style={{ padding: "3px 6px", borderRadius: 4, border: "1px solid var(--merco-border)", background: "var(--merco-surface)", fontSize: 11, color: "inherit" }}
                                        />
                                        <button
                                          type="button"
                                          className="btn btn-primary"
                                          onClick={() => handleExtenderVigencia(enlace.id)}
                                          style={{ padding: "4px 10px", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}
                                        >
                                          <DynamicIcon name="FiCheck" style={{ fontSize: 12 }} /> Guardar
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-ghost"
                                          onClick={() => setEditandoId(null)}
                                          style={{ padding: "4px 8px", fontSize: 11 }}
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setEditandoId(enlace.id)}
                                        style={{
                                          background: "transparent",
                                          border: "1px dashed var(--merco-border)",
                                          color: "var(--merco-accent, #f95700)",
                                          cursor: "pointer",
                                          fontWeight: 600,
                                          fontSize: 11,
                                          padding: "5px 10px",
                                          borderRadius: 6,
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 6,
                                          transition: "all 0.2s ease"
                                        }}
                                      >
                                        <DynamicIcon name="FiCalendar" style={{ fontSize: 13 }} />
                                        Extender vigencia
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--merco-muted)" }}>
                                  Archivos Vinculados ({listaArchivos.length}) — Peso Total: {enlace.pesoTotalMb} MB:
                                </div>

                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                                  {listaArchivos.map((archivo) => (
                                    <li key={archivo.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, background: "var(--merco-surface)", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--merco-border)" }}>
                                      <DynamicIcon name="FiFileText" style={{ color: "var(--merco-accent, #f95700)" }} />
                                      <span style={{ flex: 1, wordBreak: "break-all" }}>{archivo.str_nombre_archivo}</span>
                                      <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>{archivo.tamanioMb} MB</span>
                                      <span style={{ fontSize: 10, opacity: 0.6, background: "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: 4 }}>
                                        {archivo.es_archivo_drive ? "Base Drive" : "Subido"}
                                      </span>
                                    </li>
                                  ))}
                                </ul>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* BARRA DE PAGINACIÓN */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: "1px solid var(--merco-border)", flexWrap: "wrap", gap: 12, fontSize: 13, color: "var(--merco-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span>
                Mostrando <b>{registroInicio}</b> a <b>{registroFin}</b> de <b>{enlacesFiltrados.length}</b> registros
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label htmlFor="porPaginaEnlaces">Mostrar:</label>
                <select id="porPaginaEnlaces" value={porPagina} onChange={handlePorPaginaChange} style={{ ...filtroStyle, padding: "4px 8px", cursor: "pointer" }}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>registros</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="btn btn-ghost" disabled={paginaActual === 1} onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}>
                Anterior
              </button>
              <span>Página {paginaActual} de {totalPaginas}</span>
              <button className="btn btn-ghost" disabled={paginaActual >= totalPaginas} onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}>
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </SystemLayout>
  );
}