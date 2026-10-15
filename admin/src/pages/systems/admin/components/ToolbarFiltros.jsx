import React, { useMemo } from "react";
import { DynamicIcon } from "../../../../components/IconCatalog";

export default function ToolbarFiltros({
  roles,
  catRoles,
  sistemas,
  departamentos,
  busqueda,
  setBusqueda,
  filtroSistema,
  setFiltroSistema,
  filtroRol,
  setFiltroRol,
  filtroEstado,
  setFiltroEstado,
  filtroDepartamento,
  setFiltroDepartamento,
  filtroUltimoAcceso,
  setFiltroUltimoAcceso,
  fechaDesde,
  setFechaDesde,
  fechaHasta,
  setFechaHasta,
  setModal,
  mostrarBotonNuevo,
}) {
  const rolesUnicosFiltro = useMemo(() => {
    const unicos = new Set();
    catRoles?.forEach((r) => {
      if (r.nombre) unicos.add(r.nombre.trim());
    });
    return Array.from(unicos);
  }, [catRoles]);

  const filtroStyle = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid var(--merco-border)",
    fontSize: "12px",
    background: "var(--merco-surface, #fff)",
    color: "inherit",
    outline: "none",
  };

  return (
    <div className="ma-toolbar" style={{ marginBottom: 16 }}>
      <div
        className="ma-filters"
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          flex: 1,
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", minWidth: 200, flex: "1 1 200px" }}>
          <DynamicIcon
            name="FiSearch"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              opacity: 0.6,
              fontSize: 14,
            }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              ...filtroStyle,
              width: "100%",
              paddingLeft: "36px",
            }}
          />
        </div>

        <select
          value={filtroSistema}
          onChange={(e) => setFiltroSistema(e.target.value)}
          style={filtroStyle}
        >
          <option value="">Todos los sistemas</option>
          {sistemas.map((s, index) => (
            <option key={s.id ? `${s.id}-${index}` : index} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          style={filtroStyle}
        >
          <option value="">Todos los roles</option>
          {rolesUnicosFiltro.map((rolNombre, index) => (
            <option key={index} value={rolNombre}>
              {rolNombre}
            </option>
          ))}
        </select>

        <select
          value={filtroDepartamento}
          onChange={(e) => setFiltroDepartamento(e.target.value)}
          style={filtroStyle}
        >
          <option value="">Todos los departamentos</option>
          {departamentos?.map((d, index) => (
            <option key={d.id ? `${d.id}-${index}` : index} value={d.id}>
              {d.str_nombre || d.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={filtroStyle}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>

        <select
          value={filtroUltimoAcceso}
          onChange={(e) => setFiltroUltimoAcceso(e.target.value)}
          style={filtroStyle}
        >
          <option value="">Último acceso (Todos)</option>
          <option value="hoy">Hoy</option>
          <option value="ayer">Ayer</option>
          <option value="rango">Rango de fechas...</option>
          <option value="nunca">Sin acceso (—)</option>
        </select>

        {filtroUltimoAcceso === "rango" && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--merco-bg-subtle, rgba(255, 255, 255, 0.03))",
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid var(--merco-border, #444)",
            }}
          >
            <label style={{ fontSize: 12, color: "var(--merco-muted)" }}>
              Desde:
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                fontSize: 12,
              }}
            />
            <label style={{ fontSize: 12, color: "var(--merco-muted)" }}>
              Hasta:
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                fontSize: 12,
              }}
            />
          </div>
        )}

        {(busqueda ||
          filtroSistema ||
          filtroRol ||
          filtroEstado ||
          filtroDepartamento ||
          filtroUltimoAcceso ||
          fechaDesde ||
          fechaHasta) && (
          <button
            className="btn btn-ghost"
            style={{ padding: "6px 12px", fontSize: 13 }}
            onClick={() => {
              setBusqueda("");
              setFiltroSistema("");
              setFiltroRol("");
              setFiltroEstado("");
              setFiltroDepartamento("");
              setFiltroUltimoAcceso("");
              setFechaDesde("");
              setFechaHasta("");
            }}
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {mostrarBotonNuevo && (
        <button
          className="btn btn-accent"
          onClick={() => setModal({ tipo: "usuario", data: null })}
        >
          <span>
            <DynamicIcon name="FiPlus" />
          </span>{" "}
          Nuevo usuario
        </button>
      )}
    </div>
  );
}
