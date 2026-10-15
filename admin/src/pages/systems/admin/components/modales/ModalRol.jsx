import React, { useState, useMemo } from "react";
import ReactDOM from "react-dom";

export default function ModalRol({
  data,
  sistemas,
  catRoles,
  roles,
  onSaveCrear,
  onSaveOpciones,
  onDelete,
  onClose,
  onDeleteCat,
}) {
  const editar = !!data;
  const [modalTab, setModalTab] = useState(editar ? "permisos" : "crear");

  const [nombreRol, setNombreRol] = useState("");
  const [mostrarSugerenciasCrear, setMostrarSugerenciasCrear] = useState(false);

  const [rolEditarId, setRolEditarId] = useState("");
  const [nuevoNombreRol, setNuevoNombreRol] = useState("");

  const [rolEliminarId, setRolEliminarId] = useState("");

  const rolesFiltradosCrear = useMemo(() => {
    if (!nombreRol.trim()) return [];
    return catRoles.filter((r) =>
      r.nombre.toLowerCase().includes(nombreRol.toLowerCase()),
    );
  }, [nombreRol, catRoles]);

  const handleSelectRolEditar = (e) => {
    const id = e.target.value;
    setRolEditarId(id);
    const rolEncontrado = catRoles.find((r) => String(r.id) === String(id));
    setNuevoNombreRol(rolEncontrado ? rolEncontrado.nombre : "");
  };

  const sistemasVinculadosCat = useMemo(() => {
    if (!rolEliminarId) return [];
    return roles.filter((r) => Number(r.rol_id) === Number(rolEliminarId));
  }, [rolEliminarId, roles]);

  const estaVinculadoCat = sistemasVinculadosCat.length > 0;

  const opcionesDelSistema = useMemo(() => {
    const sys = sistemas.find(
      (s) => s.id === data?.sistema_id || s.nombre === data?.sistemas,
    );
    if (!sys || !sys.opciones) return [];

    const unicos = [];
    const idsVistos = new Set();
    for (const op of sys.opciones) {
      const key = op.id !== undefined ? op.id : op.opcion;
      if (!idsVistos.has(key)) {
        idsVistos.add(key);
        unicos.push(op);
      }
    }
    return unicos;
  }, [sistemas, data]);

  const [opcionIdsSeleccionados, setOpcionIdsSeleccionados] = useState(
    data?.opcion_ids || [],
  );

  const toggleCheckbox = (opcionId) => {
    setOpcionIdsSeleccionados((prev) =>
      prev.includes(opcionId)
        ? prev.filter((id) => id !== opcionId)
        : [...prev, opcionId],
    );
  };

  const seleccionarTodos = () => {
    setOpcionIdsSeleccionados(opcionesDelSistema.map((o) => o.id));
  };

  const deseleccionarTodos = () => {
    setOpcionIdsSeleccionados([]);
  };

  return ReactDOM.createPortal(
    <div
      className="ma-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="ma-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 600, zIndex: 100000 }}
      >
        <div className="ma-modal-head">
          <h3>
            {editar
              ? `Editar Permisos: ${data.nombre} (${data.sistemas || ""})`
              : "Gestión de Roles"}
          </h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        {!editar ? (
          <div
            style={{
              display: "flex",
              borderBottom:
                "1px solid var(--merco-border, rgba(255, 255, 255, 0.08))",
              padding: "0 20px",
              background: "var(--merco-bg-subtle, rgba(255, 255, 255, 0.01))",
              overflowX: "auto",
            }}
          >
            <button
              type="button"
              onClick={() => setModalTab("crear")}
              style={{
                padding: "10px 14px",
                background: "transparent",
                border: "none",
                borderBottom:
                  modalTab === "crear"
                    ? "2px solid var(--merco-accent, #2f6fed)"
                    : "2px solid transparent",
                color:
                  modalTab === "crear"
                    ? "var(--merco-text, #fff)"
                    : "var(--merco-muted, #888)",
                fontWeight: modalTab === "crear" ? 600 : 400,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Crear Rol
            </button>
            <button
              type="button"
              onClick={() => setModalTab("editarNombre")}
              style={{
                padding: "10px 14px",
                background: "transparent",
                border: "none",
                borderBottom:
                  modalTab === "editarNombre"
                    ? "2px solid var(--merco-accent, #2f6fed)"
                    : "2px solid transparent",
                color:
                  modalTab === "editarNombre"
                    ? "var(--merco-text, #fff)"
                    : "var(--merco-muted, #888)",
                fontWeight: modalTab === "editarNombre" ? 600 : 400,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Editar Rol
            </button>
            <button
              type="button"
              onClick={() => setModalTab("eliminarCat")}
              style={{
                padding: "10px 14px",
                background: "transparent",
                border: "none",
                borderBottom:
                  modalTab === "eliminarCat"
                    ? "2px solid var(--merco-accent, #2f6fed)"
                    : "2px solid transparent",
                color:
                  modalTab === "eliminarCat"
                    ? "var(--merco-text, #fff)"
                    : "var(--merco-muted, #888)",
                fontWeight: modalTab === "eliminarCat" ? 600 : 400,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Eliminar Rol
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: "12px 20px",
              borderBottom:
                "1px solid var(--merco-border, rgba(255, 255, 255, 0.08))",
              background: "var(--merco-bg-subtle, rgba(255, 255, 255, 0.01))",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--merco-text)",
            }}
          >
            Opciones del Rol
          </div>
        )}

        <div className="ma-modal-body">
          {modalTab === "permisos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--merco-text)",
                  }}
                >
                  Seleccione las opciones y permisos activos para este sistema:
                </label>
                {opcionesDelSistema.length > 0 && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                      userSelect: "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      ref={(el) => {
                        if (el) {
                          el.indeterminate =
                            opcionIdsSeleccionados.length > 0 &&
                            opcionIdsSeleccionados.length <
                              opcionesDelSistema.length;
                        }
                      }}
                      checked={
                        opcionesDelSistema.length > 0 &&
                        opcionIdsSeleccionados.length ===
                          opcionesDelSistema.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          seleccionarTodos();
                        } else {
                          deseleccionarTodos();
                        }
                      }}
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: "var(--merco-accent, #2f6fed)",
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ color: "var(--merco-text)" }}>
                      Seleccionar todos
                    </span>
                  </label>
                )}
              </div>

              {opcionesDelSistema.length === 0 ? (
                <p
                  style={{
                    color: "var(--merco-muted)",
                    fontSize: 13,
                    textAlign: "center",
                    padding: 20,
                  }}
                >
                  Este sistema no tiene opciones registradas.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 10,
                    maxHeight: 260,
                    overflowY: "auto",
                    padding: 4,
                  }}
                >
                  {opcionesDelSistema.map((opcion) => {
                    const isChecked = opcionIdsSeleccionados.includes(
                      opcion.id,
                    );
                    return (
                      <label
                        key={opcion.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 6,
                          border: isChecked
                            ? "1px solid var(--merco-accent, #2f6fed)"
                            : "1px solid var(--merco-border, #333)",
                          background: isChecked
                            ? "rgba(47, 111, 237, 0.08)"
                            : "var(--merco-bg-subtle, rgba(255,255,255,0.02))",
                          cursor: "pointer",
                          fontSize: 13,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheckbox(opcion.id)}
                          style={{
                            width: 16,
                            height: 16,
                            accentColor: "var(--merco-accent, #2f6fed)",
                            cursor: "pointer",
                          }}
                        />
                        <span
                          style={{
                            userSelect: "none",
                            color: "var(--merco-text)",
                          }}
                        >
                          {opcion.opcion}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {modalTab === "crear" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field" style={{ position: "relative" }}>
                <label>Nombre del Nuevo Rol</label>
                <input
                  value={nombreRol}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNombreRol(val);
                    setMostrarSugerenciasCrear(val.trim() !== "");
                  }}
                  onFocus={() => {
                    if (nombreRol.trim()) setMostrarSugerenciasCrear(true);
                  }}
                  placeholder="Ej. Analista"
                />
                {mostrarSugerenciasCrear && rolesFiltradosCrear.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 100,
                      background: "var(--merco-bg, #1a1a1a)",
                      border: "1px solid var(--merco-border, #333)",
                      borderRadius: 6,
                      maxHeight: 180,
                      overflowY: "auto",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      marginTop: 4,
                    }}
                  >
                    {rolesFiltradosCrear.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          setNombreRol(r.nombre);
                          setMostrarSugerenciasCrear(false);
                        }}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: 13,
                          borderBottom: "1px solid var(--merco-border, #222)",
                          color: "var(--merco-text, #fff)",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background =
                            "rgba(47, 111, 237, 0.15)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "transparent")
                        }
                      >
                        {r.nombre}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {modalTab === "editarNombre" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field">
                <label>Seleccionar Rol a Editar</label>
                <select value={rolEditarId} onChange={handleSelectRolEditar}>
                  <option value="">Selecciona un rol...</option>
                  {catRoles.map((r, index) => (
                    <option
                      key={r.id ? `${r.id}-${index}` : index}
                      value={r.id}
                    >
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {rolEditarId && (
                <div className="field">
                  <label>Nuevo Nombre del Rol</label>
                  <input
                    value={nuevoNombreRol}
                    onChange={(e) => setNuevoNombreRol(e.target.value)}
                    placeholder="Escribe el nuevo nombre..."
                  />
                </div>
              )}
            </div>
          )}

          {modalTab === "eliminarCat" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  color: "var(--merco-muted)",
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                Selecciona un rol del catálogo general. Solo se permitirá
                eliminarlo si <b>no se encuentra vinculado a ningún sistema</b>.
              </div>

              <div className="field">
                <label>Seleccionar Rol a Eliminar</label>
                <select
                  value={rolEliminarId}
                  onChange={(e) => setRolEliminarId(e.target.value)}
                >
                  <option value="">Selecciona un rol...</option>
                  {catRoles.map((r, index) => (
                    <option
                      key={r.id ? `${r.id}-${index}` : index}
                      value={r.id}
                    >
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {rolEliminarId && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    background: estaVinculadoCat
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgba(16, 185, 129, 0.1)",
                    border: `1px solid ${estaVinculadoCat ? "#ef4444" : "#10b981"}`,
                    fontSize: 13,
                  }}
                >
                  {estaVinculadoCat ? (
                    <span style={{ color: "#ef4444" }}>
                      Este rol está vinculado a {sistemasVinculadosCat.length}{" "}
                      sistema(s). <b>No se puede eliminar.</b>
                    </span>
                  ) : (
                    <span style={{ color: "#10b981" }}>
                      Este rol no está vinculado a ningún sistema. Puede
                      proceder con la eliminación.
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: editar ? "space-between" : "flex-end",
            alignItems: "center",
            padding: "16px 20px",
            borderTop:
              "1px solid var(--merco-border, rgba(255, 255, 255, 0.08))",
          }}
        >
          {editar && (
            <button
              type="button"
              className="btn btn-danger"
              disabled={opcionIdsSeleccionados.length > 0}
              style={{
                backgroundColor:
                  opcionIdsSeleccionados.length > 0 ? "#6c757d" : "#dc3545",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: 6,
                cursor:
                  opcionIdsSeleccionados.length > 0 ? "not-allowed" : "pointer",
                fontSize: 13,
              }}
              title={
                opcionIdsSeleccionados.length > 0
                  ? "No se puede eliminar porque tiene opciones asociadas"
                  : "Eliminar rol de este sistema"
              }
              onClick={() => onDelete(data.id)}
            >
              Eliminar rol de {data.sistemas}
            </button>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>

            {modalTab === "permisos" ? (
              <button
                className="btn btn-primary"
                onClick={() =>
                  onSaveOpciones({
                    rolSistemaId: data.id,
                    opcionIds: opcionIdsSeleccionados,
                  })
                }
              >
                Guardar permisos
              </button>
            ) : modalTab === "crear" ? (
              <button
                className="btn btn-primary"
                disabled={!nombreRol.trim()}
                onClick={() =>
                  onSaveCrear({ id: null, nombre: nombreRol, permisos: [] })
                }
              >
                Crear rol
              </button>
            ) : modalTab === "editarNombre" ? (
              <button
                className="btn btn-primary"
                disabled={!rolEditarId || !nuevoNombreRol.trim()}
                onClick={() =>
                  onSaveCrear({ id: rolEditarId, nombre: nuevoNombreRol })
                }
              >
                Guardar cambios
              </button>
            ) : (
              <button
                className="btn btn-danger"
                disabled={!rolEliminarId || estaVinculadoCat}
                style={{
                  backgroundColor: estaVinculadoCat ? "#6c757d" : "#dc3545",
                  color: "#fff",
                  border: "none",
                }}
                onClick={() => onDeleteCat(rolEliminarId)}
              >
                Eliminar rol
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
