import React, { useState } from "react";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../components/IconCatalog";

/* ====== DATOS DEL CINTILLO BURSÁTIL BVC (TICKER) ====== */
const TICKER_BVC = [
  { simbolo: "IBC", valor: "92.450,12", cambio: "+1,25%", positivo: true },
  { simbolo: "BVCC", valor: "12,50", cambio: "+3,30%", positivo: true },
  { simbolo: "BNC", valor: "2,10", cambio: "0,00%", neutral: true },
  { simbolo: "MVZ.A", valor: "45,00", cambio: "-0,88%", positivo: false },
  { simbolo: "RST", valor: "18,20", cambio: "+2,15%", positivo: true },
  { simbolo: "TDV.D", valor: "8,35", cambio: "-1,18%", positivo: false },
  { simbolo: "FVI.B", valor: "14,00", cambio: "+0,50%", positivo: true },
  {
    simbolo: "USD/VES (BCV)",
    valor: "36,45",
    cambio: "+0,12%",
    positivo: false,
  },
];

/* ====== CATEGORÍAS BURSÁTILES (MERCOSUR CASA DE BOLSA) ====== */
const CATEGORIAS_KB = [
  {
    id: "renta-fija-var",
    nombre: "Operaciones BVC & Custodia",
    ic: "FiTrendingUp",
    color: "#2f6fed",
    desc: "Procedimientos de Renta Variable, Renta Fija y CVV",
    articulosCount: 24,
  },
  {
    id: "compliance",
    nombre: "Cumplimiento & KYC",
    ic: "FiShieldCheck",
    color: "#1f9d63",
    desc: "Manuales LC/FT/FPADM, expedientes y normativas SUNAVAL",
    articulosCount: 18,
  },
  {
    id: "cambio",
    nombre: "Mesa de Cambio & Divisas",
    ic: "FiDollarSign",
    color: "#d8992a",
    desc: "Intermediación cambiaria y circulares del BCV",
    articulosCount: 12,
  },
  {
    id: "research",
    nombre: "Research & Análisis",
    ic: "FiPieChart",
    color: "#8155d8",
    desc: "Informes macroeconómicos, empresas emisoras y mercado",
    articulosCount: 31,
  },
];

/* ====== ARTÍCULOS DESTACADOS DE CONOCIMIENTO BURSÁTIL ====== */
const ARTICULOS_DESTACADOS = [
  {
    id: 1,
    titulo: "Procedimiento para liquidación de Renta Fija en T+1",
    categoria: "Operaciones BVC & Custodia",
    vistas: 1420,
    autor: "Mesa de Operaciones",
    estado: "Vigente",
    fecha: "Hoy, 08:30",
  },
  {
    id: 2,
    titulo: "Checklist de expedientes KYC para Personas Jurídicas (SUNAVAL)",
    categoria: "Cumplimiento & KYC",
    vistas: 980,
    autor: "Oficial de Cumplimiento",
    estado: "Vigente",
    fecha: "22/09/2026",
  },
  {
    id: 3,
    titulo: "Manual de Operaciones Cruzadas en Mesa de Cambio",
    categoria: "Mesa de Cambio & Divisas",
    vistas: 650,
    autor: "Tesorería",
    estado: "En Revisión",
    fecha: "Ayer, 16:15",
  },
  {
    id: 4,
    titulo: "Informe Semanal: Rendimiento de Papeles Comerciales Q3",
    categoria: "Research & Análisis",
    vistas: 510,
    autor: "Departamento de Research",
    estado: "Vigente",
    fecha: "18/09/2026",
  },
];

/* ====== ALERTAS DE CUMPLIMIENTO Y CONTENIDO REGULATORIO ====== */
const ALERTAS_REGULATORIAS = [
  {
    id: 101,
    titulo: "Actualización de Providencia SUNAVAL",
    detalle: "Se requiere revisar procedimiento KYC de Personas Naturales",
    tipo: "danger",
    tiempo: "hace 3h",
  },
  {
    id: 102,
    titulo: "Circular BCV sobre Mesa de Cambio",
    detalle: "Nuevo informe en borrador pendiente por validación jurídica",
    tipo: "warning",
    tiempo: "hace 1d",
  },
  {
    id: 103,
    titulo: "Reporte de Emisores Actualizado",
    detalle: "Se publicó el análisis financiero de Ron Santa Teresa / BVC",
    tipo: "info",
    tiempo: "hace 2d",
  },
];

export default function DashboardKcs() {
  const [articulos] = useState(ARTICULOS_DESTACADOS);
  const [categorias] = useState(CATEGORIAS_KB);

  return (
    <SystemLayout identificacion="Base de Conocimiento">
      <div
        className="ma-content"
        style={{
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
          padding: "10px 0",
        }}
      >
        {/* COMPONENTE CINTILLO BURSÁTIL EN MOVIMIENTO */}
        <CintilloBursatil BVC={TICKER_BVC} />

        {/* ENCABEZADO PRINCIPAL */}
        <div
          className="ma-toolbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, color: "var(--merco-text)", margin: 0 }}>
              Base de Conocimientos (KCS) Operativa & Regulatoria
            </h2>
            <small style={{ color: "var(--merco-muted)" }}>
              Mercosur Casa de Bolsa S.A. · Control Documental & Research
            </small>
          </div>
        </div>

        {/* 1. TARJETAS DE MÉTRICAS GENERALES (KPIs BURSÁTILES) */}
        {/* Se elimina el grid en línea rígido para que .ma-stats lo maneje responsivamente */}
        <div className="ma-stats">
          <KPICard
            icon="FiBookOpen"
            val={85}
            label="Artículos Normativos"
            trend="▲ 85 vigentes"
            trendColor="var(--merco-success, #16a34a)"
          />
          <KPICard
            icon="FiShield"
            val={18}
            label="Manuales Compliance"
            trend="Normativa SUNAVAL"
          />
          <KPICard
            icon="FiFileText"
            val={31}
            label="Informes de Research"
            trend="▲ 4 publicados este mes"
            trendColor="var(--merco-success, #16a34a)"
          />
          <KPICard
            icon="FiAlertTriangle"
            val={2}
            label="Revisiones Pendientes"
            trend="Requiere Oficial Cumplimiento"
            trendColor="var(--merco-warning, #d8992a)"
            iconColor="var(--merco-warning, #d8992a)"
          />
          <KPICard
            icon="FiSearch"
            val="14"
            label="Búsquedas sin Resultado"
            trend="Oportunidades de documentación"
            trendColor="var(--merco-muted)"
          />
        </div>

        {/* 2. FILA DE TABLA Y ALERTAS DE NORMAS */}
        {/* Se usa .dashboard-grid-2col en lugar del grid en línea rígido */}
        <div className="dashboard-grid-2col" style={{ marginBottom: 20 }}>
          {/* TABLA DE CONTENIDO OPERATIVO */}
          <div className="ma-card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: 15,
                    color: "var(--merco-text)",
                  }}
                >
                  Procedimientos y Documentos Más Consultados
                </span>{" "}
                <small style={{ color: "var(--merco-muted)", display: "block" }}>
                  operaciones y atención
                </small>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => (window.location.href = "/kb/articulos")}
              >
                Ver Todo el Catálogo
              </button>
            </div>

            {/* Contenedor adaptativo para que la tabla no desborde en móviles */}
            <div className="ma-table-container">
              <table className="ma-table">
                <thead>
                  <tr>
                    <th>PROCEDIMIENTO / ARTÍCULO</th>
                    <th>ÁREA / CATEGORÍA</th>
                    <th>CONSULTAS</th>
                    <th>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {articulos.map((art) => (
                    <tr key={art.id}>
                      <td style={{ padding: "10px 16px" }}>
                        <b
                          style={{
                            color: "var(--merco-text)",
                            display: "block",
                          }}
                        >
                          {art.titulo}
                        </b>
                        <small style={{ color: "var(--merco-muted)" }}>
                          Autor: {art.autor} · {art.fecha}
                        </small>
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 12 }}>
                        {art.categoria}
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 12 }}>
                        <b>{art.vistas}</b> lecturas
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            background:
                              art.estado === "Vigente"
                                ? "rgba(31, 157, 99, 0.15)"
                                : "rgba(216, 153, 42, 0.15)",
                            color:
                              art.estado === "Vigente" ? "#1f9d63" : "#d8992a",
                          }}
                        >
                          ● {art.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* NOVEDADES Y ALERTAS DE REGULACIÓN */}
          <div className="ma-card" style={{ padding: 18 }}>
            <div
              style={{
                marginBottom: 16,
                borderBottom: "1px solid var(--merco-border)",
                paddingBottom: 10,
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  color: "var(--merco-text)",
                }}
              >
                Alertas Regulatorias & Cambios
              </span>{" "}
              <small style={{ color: "var(--merco-muted)" }}>
                SUNAVAL / BCV / BVC
              </small>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ALERTAS_REGULATORIAS.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    paddingBottom: 10,
                    borderBottom: "1px solid var(--merco-border)",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background:
                        item.tipo === "danger"
                          ? "rgba(209, 67, 91, 0.12)"
                          : item.tipo === "warning"
                            ? "rgba(216, 153, 42, 0.12)"
                            : "rgba(47, 111, 237, 0.12)",
                      color:
                        item.tipo === "danger"
                          ? "#DC2626"
                          : item.tipo === "warning"
                            ? "#D97706"
                            : "#2F6FED",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    <DynamicIcon
                      name={
                        item.tipo === "danger"
                          ? "FiAlertOctagon"
                          : item.tipo === "warning"
                            ? "FiClock"
                            : "FiInfo"
                      }
                      fallback="FiShield"
                    />
                  </div>
                  {/* Se agregó minWidth: 0 y truncamiento para evitar desbordes en móviles */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b
                      style={{
                        fontSize: 13,
                        color: "var(--merco-text)",
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.titulo}
                    </b>
                    <small
                      style={{
                        color: "var(--merco-muted)",
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.detalle}
                    </small>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <small style={{ color: "var(--merco-muted)" }}>
                      {item.tiempo}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. SECCIÓN DE MÓDULOS DE CONOCIMIENTO (CATEGORÍAS) */}
        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: 16,
              color: "var(--merco-text)",
            }}
          >
            Áreas de Conocimiento Bursátil
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {categorias.map((cat) => (
              <div key={cat.id} className="ma-card" style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: cat.color + "22",
                      color: cat.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    <DynamicIcon name={cat.ic} fallback="FiBook" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b
                      style={{
                        color: "var(--merco-text)",
                        fontSize: 14,
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {cat.nombre}
                    </b>
                    <small
                      style={{ color: "var(--merco-muted)", fontSize: 11 }}
                    >
                      {cat.articulosCount} artículos
                    </small>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--merco-muted)",
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SystemLayout>
  );
}

/* ====== COMPONENTE CINTILLO BURSÁTIL ANIMADO (TICKER BVC) ====== */
function CintilloBursatil({ BVC }) {
  const itemsInfinitos = [...BVC, ...BVC];

  return (
    <>
      <style>
        {`
          @keyframes tickerMove {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .bvc-ticker-container:hover .bvc-ticker-track {
            animation-play-state: paused;
          }
        `}
      </style>
      <div
        className="bvc-ticker-container"
        style={{
          background: "var(--merco-bg-subtle, rgba(255, 255, 255, 0.03))",
          border: "1px solid var(--merco-border, #2d3748)",
          borderRadius: 8,
          padding: "8px 16px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingRight: 16,
            marginRight: 16,
            borderRight: "2px solid var(--merco-border, #4a5568)",
            whiteSpace: "nowrap",
            fontSize: 12,
            fontWeight: "bold",
            color: "#2f6fed",
            zIndex: 2,
            background: "var(--merco-bg, #0b1b32)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#1f9d63",
            }}
          ></span>
          BVC EN VIVO
        </div>

        <div
          style={{
            overflow: "hidden",
            width: "100%",
            position: "relative",
          }}
        >
          <div
            className="bvc-ticker-track"
            style={{
              display: "inline-flex",
              gap: 32,
              whiteSpace: "nowrap",
              animation: "tickerMove 25s linear infinite",
              willChange: "transform",
            }}
          >
            {itemsInfinitos.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--merco-text)" }}>
                  {item.simbolo}:
                </span>
                <span style={{ color: "var(--merco-text)" }}>
                  Bs. {item.valor}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    color: item.neutral
                      ? "var(--merco-muted)"
                      : item.positivo
                        ? "#1f9d63"
                        : "#d1435b",
                  }}
                >
                  {item.neutral ? "" : item.positivo ? "▲ " : "▼ "}
                  {item.cambio}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function KPICard({ icon, val, label, trend, trendColor, iconColor }) {
  return (
    <div className="ma-stat">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span
          style={{ fontSize: 20, color: iconColor || "var(--merco-muted)" }}
        >
          <DynamicIcon name={icon} fallback="FiActivity" />
        </span>
      </div>
      <div className="val">{val}</div>
      <div className="lbl" style={{ marginTop: 2 }}>
        {label}
      </div>
      {trend && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: trendColor || "var(--merco-muted)",
            marginTop: 6,
          }}
        >
          {trend}
        </div>
      )}
    </div>
  );
}