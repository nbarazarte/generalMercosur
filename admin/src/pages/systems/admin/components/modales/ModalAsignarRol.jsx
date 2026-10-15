import React, { useState } from "react";
import ReactDOM from "react-dom";

export default function ModalAsignarRol({
  sistemas,
  catRoles,
  onSaveAsignar,
  onClose,
}) {
  const [rolAsignarId, setRolAsignarId] = useState("");
  const [sistemaAsignarId, setSistemaAsignarId] = useState("");

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
        style={{ maxWidth: 500, zIndex: 100000 }}
      >
        <div className="ma-modal-head">
          <h3>Asignar Rol</h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          className="ma-modal-body"
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div className="field">
            <label>Seleccionar Rol</label>
            <select
              value={rolAsignarId}
              onChange={(e) => setRolAsignarId(e.target.value)}
            >
              <option value="">Selecciona un rol...</option>
              {catRoles.map((r, index) => (
                <option key={r.id ? `${r.id}-${index}` : index} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Seleccionar Sistema Destino</label>
            <select
              value={sistemaAsignarId}
              onChange={(e) => setSistemaAsignarId(e.target.value)}
            >
              <option value="">Selecciona un sistema...</option>
              {sistemas?.map((s, index) => (
                <option key={s.id ? `${s.id}-${index}` : index} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "16px 20px",
            borderTop:
              "1px solid var(--merco-border, rgba(255, 255, 255, 0.08))",
            gap: 8,
          }}
        >
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={!rolAsignarId || !sistemaAsignarId}
            onClick={() =>
              onSaveAsignar({
                rolId: rolAsignarId,
                sistemaId: sistemaAsignarId,
              })
            }
          >
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
