import React, { useState } from "react";
import ReactDOM from "react-dom";

export default function ModalUsuario({
  data,
  departamentos,
  onSave,
  onDelete,
  onClose,
}) {
  const editar = !!data;
  const [cedula, setCedula] = useState(data?.cedula || "");
  const [nombre, setNombre] = useState(
    data?.nombres || data?.nombre?.split(" ")[0] || "",
  );
  const [apellido, setApellido] = useState(
    data?.apellidos || data?.nombre?.split(" ").slice(1).join(" ") || "",
  );
  const [email, setEmail] = useState(data?.email || "");
  const [usuario, setUsuario] = useState(data?.usuario || "");
  const [password, setPassword] = useState("");
  const [departamentoId, setDepartamentoId] = useState(
    data?.departamento_id || departamentos[0]?.id || "",
  );
  const [estado, setEstado] = useState(data?.estado || "active");

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
        style={{ maxWidth: 550, zIndex: 100000 }}
      >
        <div className="ma-modal-head">
          <h3>{editar ? "Editar usuario" : "Nuevo usuario"}</h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div
          className="ma-modal-body"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div className="field-row">
            <div className="field">
              <label>Cédula</label>
              <input
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Ej. V-12345678"
              />
            </div>
            <div className="field">
              <label>Nombre de usuario (Alias)</label>
              <input
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="ej. jperez"
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Nombre</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan"
              />
            </div>
            <div className="field">
              <label>Apellido</label>
              <input
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej. Pérez"
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Correo corporativo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@mercosur.com.py"
              />
            </div>
            <div className="field">
              <label>Departamento</label>
              <select
                value={departamentoId}
                onChange={(e) => setDepartamentoId(e.target.value)}
              >
                <option value="">Selecciona un departamento...</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.str_nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>
                Contraseña {editar && "(Dejar en blanco para mantener)"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="field">
              <label>Estado de la cuenta</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
        </div>
        <div className="ma-modal-foot">
          {editar && (
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
            disabled={
              !cedula ||
              !nombre ||
              !apellido ||
              !email ||
              !departamentoId ||
              (!editar && !password)
            }
            onClick={() =>
              onSave({
                id: data?.id,
                cedula,
                nombre,
                apellido,
                email,
                usuario,
                password,
                departamento_id: departamentoId,
                estado,
              })
            }
          >
            {editar ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
