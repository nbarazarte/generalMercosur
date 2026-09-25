import { useMemo, useState } from "react";
import SystemLayout from "../../layouts/SystemLayout";

/* IMPORTAMOS NUESTRO CATÁLOGO DE ÍCONOS */
import { DynamicIcon, IconPicker } from "../../components/IconCatalog";

/* DATOS INICIALES DE SISTEMAS Y OPCIONES */
const SISTEMAS_INIT = [
  {
    id: "rrhh",
    nombre: "Recursos Humanos",
    ic: "FiUsers",
    color: "#1f9d63",
    desc: "Ficha de empleado",
    opciones: [
      {
        id: "opt-4",
        opcion: "Fichas de Empleados",
        ruta_opcion: "/rrhh/empleados",
        ic: "FiFolder",
      },
      {
        id: "opt-5",
        opcion: "Solicitudes de Licencia",
        ruta_opcion: "/rrhh/licencias",
        ic: "FiCalendar",
      },
    ],
  },
  {
    id: "tickets",
    nombre: "Sistema Tickets",
    ic: "FiHeadphones",
    color: "#d8992a",
    desc: "Centraliza tus tickets",
    opciones: [
      {
        id: "opt-6",
        opcion: "Mesa de Ayuda",
        ruta_opcion: "/tickets/mesa",
        ic: "FiHelpCircle",
      },
      {
        id: "opt-7",
        opcion: "Mis Tickets",
        ruta_opcion: "/tickets/mis-tickets",
        ic: "FiCheckSquare",
      },
    ],
  },
  {
    id: "kb",
    nombre: "Base de Conocimiento",
    ic: "FiBook",
    color: "#8155d8",
    desc: "Información para clientes",
    opciones: [
      {
        id: "opt-8",
        opcion: "Artículos",
        ruta_opcion: "/kb/articulos",
        ic: "FiFileText",
      },
      {
        id: "opt-9",
        opcion: "Categorías",
        ruta_opcion: "/kb/categorias",
        ic: "FiLayers",
      },
    ],
  },
];

/* ============================ COMPONENTE PRINCIPAL ============================ */
export default function Sistemas() {
  const [sistemas, setSistemas] = useState(SISTEMAS_INIT);
  const [modal, setModal] = useState(null);

  const totalOpciones = useMemo(
    () => sistemas.reduce((acc, sys) => acc + (sys.opciones?.length || 0), 0),
    [sistemas]
  );

  const guardarSistema = (data) => {
    setSistemas((prev) => {
      const existe = prev.some((s) => s.id === data.id);
      if (existe) {
        return prev.map((s) => (s.id === data.id ? { ...s, ...data } : s));
      }
      return [...prev, { ...data, opciones: [] }];
    });
    setModal(null);
  };

  const eliminarSistema = (id) => {
    setSistemas((prev) => prev.filter((s) => s.id !== id));
    setModal(null);
  };

  const guardarOpcionSistema = (sistemaId, opcionData) => {
    setSistemas((prev) =>
      prev.map((s) => {
        if (s.id !== sistemaId) return s;
        const opcionesActuales = s.opciones || [];
        const existe = opcionesActuales.some((o) => o.id === opcionData.id);

        let nuevasOpciones;
        if (existe) {
          nuevasOpciones = opcionesActuales.map((o) =>
            o.id === opcionData.id ? { ...o, ...opcionData } : o
          );
        } else {
          nuevasOpciones = [
            ...opcionesActuales,
            { ...opcionData, id: Date.now().toString() },
          ];
        }

        return { ...s, opciones: nuevasOpciones };
      })
    );
    setModal(null);
  };

  const eliminarOpcionSistema = (sistemaId, opcionId) => {
    setSistemas((prev) =>
      prev.map((s) => {
        if (s.id !== sistemaId) return s;
        return {
          ...s,
          opciones: s.opciones.filter((o) => o.id !== opcionId),
        };
      })
    );
  };

  return (
    <SystemLayout identificacion="Administración General">
      <div className="ma-stats">
        <div className="ma-stat">
          <div className="lbl">Sistemas Registrados</div>
          <div className="val">{sistemas.length}</div>
          <span className="chip chip-flat">módulos activos</span>
        </div>
        <div className="ma-stat">
          <div className="lbl">Total Opciones de Menú</div>
          <div className="val">{totalOpciones}</div>
          <span className="chip chip-flat">rutas configuradas</span>
        </div>
      </div>

      <div className="ma-toolbar" style={{ marginTop: 20 }}>
        <div style={{ color: "var(--merco-muted)", fontSize: 14 }}>
          Administra los sistemas registrados y gestiona las opciones de
          navegación (rutas) de cada uno.
        </div>
        <button
          className="btn btn-accent"
          onClick={() => setModal({ tipo: "sistema", data: null })}
        >
          <span>➕</span> Nuevo Sistema
        </button>
      </div>

      <div
        className="ma-roles"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {sistemas.map((sys) => (
          <div className="role-card" key={sys.id}>
            <div className="rc-top">
              <div
                className="role-ic"
                style={{
                  background: sys.color + "22",
                  color: sys.color,
                  fontSize: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DynamicIcon name={sys.ic} />
              </div>
              <button
                className="btn-icon"
                title="Editar sistema"
                onClick={() => setModal({ tipo: "sistema", data: sys })}
              >
                ✏️
              </button>
            </div>
            <h3>{sys.nombre}</h3>
            <p>{sys.desc}</p>
            <small style={{ color: "var(--merco-muted)", fontSize: 12 }}>
              ID: {sys.id}
            </small>

            <div
              style={{
                marginTop: 16,
                borderTop: "1px dashed var(--merco-border)",
                paddingTop: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <b style={{ fontSize: 13 }}>
                  Opciones / Rutas ({sys.opciones?.length || 0})
                </b>
                <button
                  className="btn btn-ghost"
                  style={{ padding: "2px 8px", fontSize: 12 }}
                  onClick={() =>
                    setModal({ tipo: "opcion", sistema: sys, data: null })
                  }
                >
                  + Agregar Opción
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sys.opciones && sys.opciones.length > 0 ? (
                  sys.opciones.map((opc, idx) => (
                    <div
                      key={opc.id ? `${opc.id}-${idx}` : idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background:
                          "var(--merco-bg-subtle, rgba(255, 255, 255, 0.05))",
                        border:
                          "1px solid var(--merco-border, rgba(255, 255, 255, 0.1))",
                        color: "var(--merco-text, inherit)",
                        padding: "8px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ display: "flex", fontSize: 16 }}>
                          <DynamicIcon name={opc.ic} fallback="FiGrid" />
                        </span>
                        <div>
                          <div
                            style={{
                              color: "var(--merco-text, currentColor)",
                              fontWeight: 600,
                            }}
                          >
                            {opc.opcion}
                          </div>
                          <code
                            style={{
                              fontSize: 11,
                              color: "var(--merco-muted, #888)",
                            }}
                          >
                            {opc.ruta_opcion}
                          </code>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          className="btn-icon"
                          style={{ padding: 2, cursor: "pointer" }}
                          title="Editar opción"
                          onClick={() =>
                            setModal({
                              tipo: "opcion",
                              sistema: sys,
                              data: opc,
                            })
                          }
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon danger"
                          style={{ padding: 2, cursor: "pointer" }}
                          title="Eliminar opción"
                          onClick={() => {
                            if (
                              window.confirm(
                                `¿Seguro que deseas quitar la opción "${opc.opcion}" de ${sys.nombre}?`
                              )
                            ) {
                              eliminarOpcionSistema(sys.id, opc.id);
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--merco-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    Sin opciones de menú registradas.
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal?.tipo === "sistema" && (
        <ModalSistema
          data={modal.data}
          onSave={guardarSistema}
          onDelete={(id) => {
            if (
              window.confirm(
                "¿Seguro que deseas eliminar este sistema completo y todas sus opciones?"
              )
            ) {
              eliminarSistema(id);
            }
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.tipo === "opcion" && (
        <ModalOpcion
          sistema={modal.sistema}
          data={modal.data}
          onSave={(opc) => guardarOpcionSistema(modal.sistema.id, opc)}
          onClose={() => setModal(null)}
        />
      )}
    </SystemLayout>
  );
}

/* MODAL CREAR / EDITAR SISTEMA */
function ModalSistema({ data, onSave, onDelete, onClose }) {
  const editar = !!data;
  const [id, setId] = useState(data?.id || "");
  const [nombre, setNombre] = useState(data?.nombre || "");
  const [desc, setDesc] = useState(data?.desc || "");
  const [ic, setIc] = useState(data?.ic || "FiSettings");
  const [color, setColor] = useState(data?.color || "#2f6fed");

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-modal-head">
          <h3>{editar ? "Editar sistema" : "Nuevo sistema"}</h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ma-modal-body">
          <div className="field-row">
            <div className="field">
              <label>ID del sistema (único)</label>
              <input
                disabled={editar}
                value={id}
                onChange={(e) =>
                  setId(e.target.value.toLowerCase().replace(/\s+/g, ""))
                }
                placeholder="ej. inv_stock"
              />
            </div>
            <div className="field">
              <label>Nombre del sistema</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="ej. Control de Inventario"
              />
            </div>
          </div>
          <div className="field">
            <label>Descripción</label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Descripción corta de la función del módulo"
            />
          </div>

          <div className="field">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Seleccionar Ícono del Sistema:
              <span style={{ fontSize: 18, display: "inline-flex" }}>
                <DynamicIcon name={ic} />
              </span>
            </label>
            <IconPicker value={ic} onChange={setIc} />
          </div>

          <div className="field">
            <label>Color distintivo</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ height: 40, cursor: "pointer", width: "100%" }}
            />
          </div>
        </div>
        <div className="ma-modal-foot">
          {editar && (
            <button
              className="btn btn-ghost"
              style={{ marginRight: "auto", color: "var(--merco-danger)" }}
              onClick={() => onDelete(data.id)}
            >
              Eliminar Sistema
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={!id || !nombre}
            onClick={() =>
              onSave({
                id,
                nombre,
                desc,
                ic,
                color,
                opciones: data?.opciones || [],
              })
            }
          >
            {editar ? "Guardar cambios" : "Crear sistema"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* MODAL CREAR / EDITAR OPCIÓN */
function ModalOpcion({ sistema, data, onSave, onClose }) {
  const editar = !!data;
  const [opcion, setOpcion] = useState(data?.opcion || "");
  const [ruta, setRuta] = useState(data?.ruta_opcion || "");
  const [ic, setIc] = useState(data?.ic || "FiGrid");

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-modal-head">
          <h3>
            {editar
              ? `Editar Opción de ${sistema?.nombre}`
              : `Nueva Opción para ${sistema?.nombre}`}
          </h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ma-modal-body">
          <div className="field">
            <label>Nombre de la Opción</label>
            <input
              value={opcion}
              onChange={(e) => setOpcion(e.target.value)}
              placeholder="ej. Reportes de Ventas"
            />
          </div>
          <div className="field">
            <label>Ruta de Navegación (URL)</label>
            <input
              value={ruta}
              onChange={(e) => setRuta(e.target.value)}
              placeholder="ej. /inventario/reportes"
            />
          </div>
          <div className="field">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Seleccionar Ícono de la Opción:
              <span style={{ fontSize: 18, display: "inline-flex" }}>
                <DynamicIcon name={ic} />
              </span>
            </label>
            <IconPicker value={ic} onChange={setIc} />
          </div>
        </div>
        <div className="ma-modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={!opcion || !ruta}
            onClick={() =>
              onSave({
                id: data?.id,
                opcion,
                ruta_opcion: ruta,
                ic,
                tiene_permiso: data?.tiene_permiso ?? true,
              })
            }
          >
            {editar ? "Guardar Cambios" : "Agregar Opción"}
          </button>
        </div>
      </div>
    </div>
  );
}