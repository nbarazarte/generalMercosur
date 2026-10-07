import { useState, useMemo } from "react";
import * as AiIcons from "react-icons/ai"; // Ant Design
import * as BiIcons from "react-icons/bi"; // BoxIcons
import * as BsIcons from "react-icons/bs"; // Bootstrap Icons
import * as CgIcons from "react-icons/cg"; // CSS.gg
import * as CiIcons from "react-icons/ci"; // Cemre Íconos
import * as DiIcons from "react-icons/di"; // Devicons
import * as FaIcons from "react-icons/fa"; // Font Awesome
import * as Fa6Icons from "react-icons/fa6"; // Font Awesome 6
import * as FcIcons from "react-icons/fc"; // Flat Color Icons
import * as FiIcons from "react-icons/fi"; // Feather
import * as GiIcons from "react-icons/gi"; // Game Icons
import * as GoIcons from "react-icons/go"; // Github Octicons
import * as GrIcons from "react-icons/gr"; // Grommet Icons
import * as HiIcons from "react-icons/hi"; // Heroicons
import * as Hi2Icons from "react-icons/hi2"; // Heroicons 2
import * as ImIcons from "react-icons/im"; // Icomoon Free
import * as IoIcons from "react-icons/io"; // Ionicons v4
import * as Io5Icons from "react-icons/io5"; // Ionicons v5
import * as LiaIcons from "react-icons/lia"; // Line Awesome
import * as MdIcons from "react-icons/md"; // Material Design
import * as PiIcons from "react-icons/pi"; // Phosphor Icons
import * as RiIcons from "react-icons/ri"; // Remix Icon
import * as RxIcons from "react-icons/rx"; // Radix Icons
import * as SiIcons from "react-icons/si"; // Simple Icons
import * as SlIcons from "react-icons/sl"; // Simple Line Icons
import * as TbIcons from "react-icons/tb"; // Tabler Icons
import * as TfiIcons from "react-icons/tfi"; // Themify Icons
import * as TiIcons from "react-icons/ti"; // Typicons
import * as VscIcons from "react-icons/vsc"; // VS Code Icons
import * as WiIcons from "react-icons/wi"; // Weather Icons

/* DICCIONARIO CON TODAS LAS FAMILIAS COMPATIBLES DE REACT-ICONS */
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

/* COMPONENTE PARA MOSTRAR UN ÍCONO POR NOMBRE DE FORMA SEGURA */
export function DynamicIcon({ name, fallback = "FiGrid", style, className }) {
  const IconComponent = ICON_MAP[name] || ICON_MAP[fallback] || FiIcons.FiGrid;
  return <IconComponent style={style} className={className} />;
}

/* COMPONENTE SELECTOR REUTILIZABLE CON BUSCADOR GLOBAL */
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
        placeholder="Buscar entre miles de íconos (ej. user, settings, fa, md, tb)..."
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
    </div>
  );
}