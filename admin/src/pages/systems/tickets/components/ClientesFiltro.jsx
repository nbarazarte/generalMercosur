import React from "react";
import { DynamicIcon } from "../../../../components/IconCatalog";

export function ClientesFiltro({
  filtros,
  onFiltroChange,
  limpiarFiltros,
  exportarExcel,
  filtroStyle,
}) {
  return (
    <div
      className="ma-toolbar"
      style={{
        marginTop: 0,
        flexDirection: "column",
        alignItems: "stretch",
        gap: "12px",
      }}
    >
      <div
        className="ma-filters"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
        }}
      >
        {/* Filtro por fecha de última atención */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <select
            name="tipoFecha"
            value={filtros.tipoFecha || ""}
            onChange={onFiltroChange}
            style={filtroStyle}
          >
            <option value="">Filtrar por fecha</option>
            <option value="ultima_atencion">Fecha de última atención</option>
          </select>

          <input
            type="date"
            name="fechaCalendario"
            value={filtros.fechaCalendario || ""}
            disabled={!filtros.tipoFecha}
            max={new Date().toISOString().split("T")[0]}
            onChange={onFiltroChange}
            style={{ ...filtroStyle, opacity: filtros.tipoFecha ? 1 : 0.6 }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderTop: "1px solid var(--merco-border)",
          paddingTop: "10px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
          <DynamicIcon
            name="FiSearch"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.6,
            }}
          />
          <input
            type="text"
            name="busqueda"
            placeholder="Buscar por cédula, nombre, apellido, teléfono o correo..."
            value={filtros.busqueda || ""}
            onChange={onFiltroChange}
            style={{ ...filtroStyle, width: "100%", paddingLeft: "36px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={limpiarFiltros}
            style={{ whiteSpace: "nowrap" }}
          >
            Limpiar Filtros
          </button>
          
          <button
            type="button"
            className="btn-icon"
            onClick={exportarExcel}
            title="Exportar a Excel"
            style={{
              color: "#10b981",
              padding: "6px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <DynamicIcon name="RiFileExcel2Line" style={{ fontSize: 22 }} />
          </button>
        </div>
      </div>
    </div>
  );
}