import { useState, useMemo } from "react";
import * as AiIcons from "react-icons/ai";
import * as BiIcons from "react-icons/bi";
import * as BsIcons from "react-icons/bs";
import * as CgIcons from "react-icons/cg";
import * as CiIcons from "react-icons/ci";
import * as DiIcons from "react-icons/di";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as FcIcons from "react-icons/fc";
import * as FiIcons from "react-icons/fi";
import * as GiIcons from "react-icons/gi";
import * as GoIcons from "react-icons/go";
import * as GrIcons from "react-icons/gr";
import * as HiIcons from "react-icons/hi";
import * as Hi2Icons from "react-icons/hi2";
import * as ImIcons from "react-icons/im";
import * as IoIcons from "react-icons/io";
import * as Io5Icons from "react-icons/io5";
import * as LiaIcons from "react-icons/lia";
import * as MdIcons from "react-icons/md";
import * as PiIcons from "react-icons/pi";
import * as RiIcons from "react-icons/ri";
import * as RxIcons from "react-icons/rx";
import * as SiIcons from "react-icons/si";
import * as SlIcons from "react-icons/sl";
import * as TbIcons from "react-icons/tb";
import * as TfiIcons from "react-icons/tfi";
import * as TiIcons from "react-icons/ti";
import * as VscIcons from "react-icons/vsc";
import * as WiIcons from "react-icons/wi";

export const ICON_MAP = {
  ...AiIcons,
  ...BiIcons,
  ...BsIcons,
  ...CgIcons,
  ...CiIcons,
  ...DiIcons,
  ...FaIcons,
  ...Fa6Icons,
  ...FcIcons,
  ...FiIcons,
  ...GiIcons,
  ...GoIcons,
  ...GrIcons,
  ...HiIcons,
  ...Hi2Icons,
  ...ImIcons,
  ...IoIcons,
  ...Io5Icons,
  ...LiaIcons,
  ...MdIcons,
  ...PiIcons,
  ...RiIcons,
  ...RxIcons,
  ...SiIcons,
  ...SlIcons,
  ...TbIcons,
  ...TfiIcons,
  ...TiIcons,
  ...VscIcons,
  ...WiIcons,
};

export function DynamicIcon({ name, fallback = "FiGrid", style, className }) {
  const IconComponent = ICON_MAP[name] || ICON_MAP[fallback] || FiIcons.FiGrid;
  return <IconComponent style={style} className={className} />;
}

export function IconPicker({ value, onChange }) {
  const [busqueda, setBusqueda] = useState("");

  // Filtramos los íconos pero limitamos el resultado a un máximo de 64 elementos en pantalla
  const iconosFiltrados = useMemo(() => {
    const keys = Object.keys(ICON_MAP);
    if (!busqueda.trim()) {
      // Si no busca nada, mostramos solo los primeros 64 para abrir al instante
      return keys.slice(0, 64);
    }
    // Si escribe en el buscador, filtramos pero también cortamos para no saturar
    const filtered = keys.filter((key) =>
      key.toLowerCase().includes(busqueda.toLowerCase())
    );
    return filtered.slice(0, 64);
  }, [busqueda]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        type="text"
        placeholder="Escribe para buscar íconos (ej. user, settings, fi, md)..."
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
                title={key}
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
      <small style={{ fontSize: 11, color: "var(--merco-muted)" }}>
        * Mostrando resultados optimizados. Utiliza el buscador para filtrar más opciones.
      </small>
    </div>
  );
}