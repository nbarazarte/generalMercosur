import { useState } from "react";
import ReactDOM from "react-dom";
import { DynamicIcon, IconPicker } from "../../../../../components/IconCatalog";

const modalOverlayStyles = {
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
};

/* ============================ MODAL SISTEMA ============================ */
export function ModalSistema({ data, onSave, onDelete, onClose }) {
  const editar = !!data;
  const [ruta, setRuta] = useState(data?.ruta || "");
  const [nombre, setNombre] = useState(data?.nombre || "");
  const [desc, setDesc] = useState(data?.desc || "");
  const [ic, setIc] = useState(data?.ic || "FiSettings");
  const [color, setColor] = useState(data?.color || "#2f6fed");

  return ReactDOM.createPortal(
    <div className="ma-overlay" onClick={onClose} style={modalOverlayStyles}>
      <div
        className="ma-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 100000 }}
      >
        <div className="ma-modal-head">
          <h3>{editar ? "Editar sistema" : "Nuevo sistema"}</h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ma-modal-body">
          <div className="field-row">
            <div className="field">
              <label>Nombre del sistema</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="ej. Control de Inventario"
              />
            </div>
            <div className="field">
              <label>Ruta del sistema</label>
              <input
                value={ruta}
                onChange={(e) =>
                  setRuta(
                    e.target.value
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9/_-]/g, ""),
                  )
                }
                placeholder="ej. /sistema"
              />
            </div>
          </div>
          <div className="field">
            <label>Descripción</label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Descripción corta"
            />
          </div>
          <div className="field">
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
          {editar && nombre !== "Administración General" && (
            <button
              className="btn btn-ghost"
              style={{ marginRight: "auto", color: "var(--merco-danger)" }}
              onClick={() => onDelete(data.id)}
            >
              Eliminar
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={!nombre || !ruta || !desc || !ic || !color}
            onClick={() =>
              onSave({
                id: data?.id,
                ruta,
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
    </div>,
    document.body,
  );
}

/* ============================ MODAL OPCIÓN ============================ */
export function ModalOpcion({ sistema, data, onSave, onClose }) {
  const editar = !!data;
  const [opcion, setOpcion] = useState(data?.opcion || "");
  const [ruta, setRuta] = useState(data?.ruta_opcion || "");
  const [ic, setIc] = useState(data?.ic || "FiGrid");
  const [orden, setOrden] = useState(data?.orden ?? "");

  return ReactDOM.createPortal(
    <div className="ma-overlay" onClick={onClose} style={modalOverlayStyles}>
      <div
        className="ma-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 100000 }}
      >
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
            <label>Orden (Número)</label>
            <input
              type="number"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              placeholder="ej. 1"
            />
          </div>
          <div className="field">
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                orden: orden !== "" ? Number(orden) : null,
                tiene_permiso: data?.tiene_permiso ?? true,
              })
            }
          >
            {editar ? "Guardar Cambios" : "Agregar Opción"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
