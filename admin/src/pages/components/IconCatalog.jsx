import { useState, useMemo } from "react";
import * as FiIcons from "react-icons/fi";

/* DICCIONARIO COMPLETO DE ÍCONOS DE FEATHER */
export const ICON_MAP = { ...FiIcons };

/* COMPONENTE PARA MOSTRAR UN ÍCONO POR NOMBRE DE FORMA SEGURA */
export function DynamicIcon({ name, fallback = "FiGrid", style, className }) {
  const IconComponent = ICON_MAP[name] || ICON_MAP[fallback] || FiIcons.FiGrid;
  return <IconComponent style={style} className={className} />;
}

/* COMPONENTE SELECTOR REUTILIZABLE CON BUSCADOR */
export function IconPicker({ value, onChange }) {
  const [busqueda, setBusqueda] = useState("");

  const iconosFiltrados = useMemo(() => {
    return Object.keys(ICON_MAP).filter((key) =>
      key.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [busqueda]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Buscador en tiempo real */}
      <input
        type="text"
        placeholder="Buscar entre cientos de íconos (ej. user, settings, chart)..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid var(--merco-border, #444)",
          background: "var(--merco-bg, #1e1e1e)",
          color: "var(--merco-text, #fff)",
          fontSize: 13,
          width: "100%",
          boxSizing: "border-box",
        }}
      />

      {/* Grid de íconos adaptado a Modo Oscuro/Claro */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 6,
          maxHeight: 200,
          overflowY: "auto",
          padding: 8,
          border: "1px solid var(--merco-border, #333)",
          borderRadius: 8,
          background: "var(--merco-bg-subtle, rgba(255, 255, 255, 0.05))",
          color: "var(--merco-text, inherit)",
        }}
      >
        {iconosFiltrados.length > 0 ? (
          iconosFiltrados.map((key) => {
            const IconComp = ICON_MAP[key];
            const isSelected = value === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key)}
                title={key.replace("Fi", "")}
                style={{
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 0",
                  borderRadius: 6,
                  border: isSelected
                    ? "2px solid var(--merco-primary, #2f6fed)"
                    : "1px solid transparent",
                  background: isSelected
                    ? "rgba(47, 111, 237, 0.25)"
                    : "transparent",
                  color: isSelected
                    ? "var(--merco-primary, #2f6fed)"
                    : "currentColor",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <IconComp />
              </button>
            );
          })
        ) : (
          <div
            style={{
              gridColumn: "span 8",
              textAlign: "center",
              padding: 16,
              fontSize: 13,
              opacity: 0.6,
            }}
          >
            No se encontraron íconos con "{busqueda}"
          </div>
        )}
      </div>
    </div>
  );
}