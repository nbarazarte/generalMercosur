import React, { useState, useMemo } from "react";
import SystemLayout from "../../layouts/SystemLayout";

/* IMPORTAMOS EL COMPONENTE DINÁMICO DE ÍCONOS */
import { DynamicIcon } from "../../components/IconCatalog";

/* ====== CONSTANTES ====== */
const SLA = { Alta: 4, Media: 24, Baja: 72 };
const NOW = new Date("2026-09-24T15:30:00");
const H = 3600 * 1000;

/* ====== DATOS DE EJEMPLO DE CLIENTES Y CASOS ====== */
const CLIENTES_INIT = [
  { cedula: "12.345.678", nombre: "José Rodríguez" },
  { cedula: "15.987.654", nombre: "María Gómez" },
  { cedula: "18.223.114", nombre: "Carlos Pérez" },
  { cedula: "20.556.789", nombre: "Ana Fernández" },
  { cedula: "9.112.334", nombre: "Luis Martínez" },
  { cedula: "25.667.001", nombre: "Daniela Suárez" },
  { cedula: "14.009.556", nombre: "Pedro Blanco" },
  { cedula: "22.778.443", nombre: "Gabriela Ríos" },
];

const CASOS_INIT = [
  {
    id: 1042,
    cedula: "12.345.678",
    canal: "Wasapi",
    tipo: "Firma Electrónica",
    prioridad: "Alta",
    estado: "En Proceso",
    agente: "Eleany 1",
    opened: new Date(NOW - 6 * H),
  },
  {
    id: 1041,
    cedula: "15.987.654",
    canal: "Tickets",
    tipo: "Generar Certificado",
    prioridad: "Media",
    estado: "Pendiente",
    agente: "Maria J 2",
    opened: new Date(NOW - 3 * H),
  },
  {
    id: 1040,
    cedula: "18.223.114",
    canal: "Telefónico",
    tipo: "Mercado de Valores",
    prioridad: "Alta",
    estado: "Pendiente",
    agente: "Andrea 3",
    opened: new Date(NOW - 9 * H),
  },
  {
    id: 1039,
    cedula: "20.556.789",
    canal: "Correo electrónico",
    tipo: "Web App",
    prioridad: "Baja",
    estado: "En Proceso",
    agente: "Ira 4",
    opened: new Date(NOW - 30 * H),
  },
  {
    id: 1038,
    cedula: "9.112.334",
    canal: "Presencial",
    tipo: "Caja Venezolana de Valores",
    prioridad: "Media",
    estado: "Resuelto",
    agente: "Moises 5",
    opened: new Date(NOW - 40 * H),
  },
  {
    id: 1037,
    cedula: "25.667.001",
    canal: "Instagram",
    tipo: "Otros",
    prioridad: "Baja",
    estado: "Resuelto",
    agente: "Vanessa 6",
    opened: new Date(NOW - 52 * H),
  },
  {
    id: 1036,
    cedula: "14.009.556",
    canal: "Wasapi",
    tipo: "Legacy",
    prioridad: "Alta",
    estado: "Escalado",
    agente: "Dayerling 7",
    opened: new Date(NOW - 20 * H),
  },
  {
    id: 1035,
    cedula: "22.778.443",
    canal: "Telegram",
    tipo: "Akkela",
    prioridad: "Media",
    estado: "En Proceso",
    agente: "Yabelis 8",
    opened: new Date(NOW - 14 * H),
  },
  {
    id: 1034,
    cedula: "12.345.678",
    canal: "Tickets",
    tipo: "Generar Certificado",
    prioridad: "Baja",
    estado: "Resuelto",
    agente: "Eleany 1",
    opened: new Date(NOW - 70 * H),
  },
  {
    id: 1033,
    cedula: "15.987.654",
    canal: "Telefónico",
    tipo: "Firma Electrónica",
    prioridad: "Media",
    estado: "Pendiente",
    agente: "Cladimar 9",
    opened: new Date(NOW - 26 * H),
  },
  {
    id: 1032,
    cedula: "18.223.114",
    canal: "Correo electrónico",
    tipo: "Mercado de Valores",
    prioridad: "Baja",
    estado: "En Proceso",
    agente: "Yetsimar 10",
    opened: new Date(NOW - 10 * H),
  },
  {
    id: 1031,
    cedula: "20.556.789",
    canal: "Presencial",
    tipo: "Firma Electrónica",
    prioridad: "Alta",
    estado: "Resuelto",
    agente: "Zulmar 11",
    opened: new Date(NOW - 48 * H),
  },
  {
    id: 1030,
    cedula: "9.112.334",
    canal: "Wasapi",
    tipo: "Web App",
    prioridad: "Media",
    estado: "Resuelto",
    agente: "Albert 12",
    opened: new Date(NOW - 90 * H),
  },
  {
    id: 1029,
    cedula: "25.667.001",
    canal: "Tickets",
    tipo: "Otros",
    prioridad: "Media",
    estado: "En Proceso",
    agente: "Eleany 1",
    opened: new Date(NOW - 2 * H),
  },
];

/* ====== UTILIDADES DE SLA Y FORMATO ====== */
function initials(n) {
  return n
    ? n
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "—";
}

function fmtDT(d) {
  return (
    d.toLocaleDateString("es-VE", { day: "2-digit", month: "short" }) +
    " " +
    d.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
  );
}

function slaInfo(c) {
  if (c.estado === "Resuelto")
    return { state: "ok", label: "Resuelto", mins: 0 };
  const due = new Date(c.opened.getTime() + SLA[c.prioridad] * H);
  const diff = due - NOW;
  const mins = Math.round(diff / 60000);
  if (diff <= 0) return { state: "late", label: "Vencido", mins };
  if (diff <= 2 * H) return { state: "warn", label: "Por vencer", mins, due };
  return { state: "ok", label: "En plazo", mins, due };
}

function humanLeft(mins) {
  const a = Math.abs(mins);
  const h = Math.floor(a / 60),
    m = a % 60;
  const s = (h ? h + "h " : "") + (m + "m");
  return mins < 0 ? "hace " + s : "en " + s;
}

/* ============================ COMPONENTE SEGUIMIENTO ============================ */
export default function Seguimiento() {
  const [casos] = useState(CASOS_INIT);
  const [clientes] = useState(CLIENTES_INIT);

  // Estados para los Filtros
  const [fBuscar, setFBuscar] = useState("");
  const [fPrioridad, setFPrioridad] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fSlaEstado, setFSlaEstado] = useState(""); // Filtro para VENCE EN (SLA)
  const [fApertura, setFApertura] = useState("");
  const [fFechaDesde, setFFechaDesde] = useState("");
  const [fFechaHasta, setFFechaHasta] = useState("");

  const clienteDe = (ced) =>
    clientes.find((c) => c.cedula === ced) || { nombre: "—", cedula: ced };

  const limpiarFiltros = () => {
    setFBuscar("");
    setFPrioridad("");
    setFEstado("");
    setFSlaEstado("");
    setFApertura("");
    setFFechaDesde("");
    setFFechaHasta("");
  };

  // Cálculo de KPIs de seguimiento
  const kpis = useMemo(() => {
    const late = casos.filter((c) => slaInfo(c).state === "late").length;
    const warn = casos.filter((c) => slaInfo(c).state === "warn").length;
    const proc = casos.filter((c) => c.estado === "En Proceso").length;
    const escl = casos.filter((c) => c.estado === "Escalado").length;
    return { late, warn, proc, escl };
  }, [casos]);

  // Casos activos filtrados y ordenados por urgencia de SLA
  const casosSeguimiento = useMemo(() => {
    return casos
      .filter((c) => {
        // En seguimiento solo mostramos casos activos (no resueltos)
        if (c.estado === "Resuelto") return false;

        const s = slaInfo(c);

        // Filtro por Estado de SLA (Vence en)
        if (fSlaEstado && s.state !== fSlaEstado) return false;

        // Filtro por Prioridad
        if (fPrioridad && c.prioridad !== fPrioridad) return false;

        // Filtro por Estado
        if (fEstado && c.estado !== fEstado) return false;

        // Filtro por Fecha de Apertura (Hoy, Ayer, Rango)
        let coincideFecha = true;
        const fechaOpened = new Date(c.opened);

        if (fApertura === "hoy") {
          const hoy = new Date();
          coincideFecha =
            fechaOpened.getFullYear() === hoy.getFullYear() &&
            fechaOpened.getMonth() === hoy.getMonth() &&
            fechaOpened.getDate() === hoy.getDate();
        } else if (fApertura === "ayer") {
          const ayer = new Date();
          ayer.setDate(ayer.getDate() - 1);
          coincideFecha =
            fechaOpened.getFullYear() === ayer.getFullYear() &&
            fechaOpened.getMonth() === ayer.getMonth() &&
            fechaOpened.getDate() === ayer.getDate();
        } else if (fApertura === "rango") {
          if (fFechaDesde) {
            const desde = new Date(fFechaDesde + "T00:00:00");
            if (fechaOpened < desde) coincideFecha = false;
          }
          if (fFechaHasta) {
            const hasta = new Date(fFechaHasta + "T23:59:59");
            if (fechaOpened > hasta) coincideFecha = false;
          }
        }

        if (!coincideFecha) return false;

        // Filtro de búsqueda general (ID, Cliente, Cédula, Agente, Tipo)
        if (fBuscar) {
          const q = fBuscar.toLowerCase().trim();
          const cl = clienteDe(c.cedula);
          const texto =
            `#${c.id} ${cl.nombre} ${cl.cedula} ${c.agente || ""} ${c.tipo || ""} ${c.canal || ""}`.toLowerCase();
          if (!texto.includes(q)) return false;
        }

        return true;
      })
      .map((c) => ({ c, s: slaInfo(c) }))
      .sort((a, b) => a.s.mins - b.s.mins);
  }, [
    casos,
    clientes,
    fBuscar,
    fPrioridad,
    fEstado,
    fSlaEstado,
    fApertura,
    fFechaDesde,
    fFechaHasta,
  ]);

  return (
    <SystemLayout identificacion="Tickets">
      <div
        style={{
          fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
          padding: "10px 0",
        }}
      >
        {/* ENCABEZADO */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, color: "var(--merco-text)", margin: 0 }}>
              Seguimiento
            </h2>
          </div>
        </div>

        {/* 1. TARJETAS KPI DE SEGUIMIENTO CON DYNAMICICON */}
        <div
          className="ma-stats"
          style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
        >
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
                style={{
                  fontSize: 18,
                  color: "var(--merco-danger, #DC2626)",
                  display: "inline-flex",
                }}
              >
                <DynamicIcon
                  name="FiAlertTriangle"
                  fallback="FiAlertTriangle"
                />
              </span>
            </div>
            <div className="val">{kpis.late}</div>
            <div className="lbl" style={{ marginTop: 2 }}>
              Vencidos (SLA)
            </div>
          </div>

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
                style={{
                  fontSize: 18,
                  color: "var(--merco-warning, #D97706)",
                  display: "inline-flex",
                }}
              >
                <DynamicIcon name="FiClock" fallback="FiClock" />
              </span>
            </div>
            <div className="val">{kpis.warn}</div>
            <div className="lbl" style={{ marginTop: 2 }}>
              Por vencer (&lt;2h)
            </div>
          </div>

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
                style={{
                  fontSize: 18,
                  color: "var(--merco-blue, #2F6FED)",
                  display: "inline-flex",
                }}
              >
                <DynamicIcon name="FiBell" fallback="FiBell" />
              </span>
            </div>
            <div className="val">{kpis.proc}</div>
            <div className="lbl" style={{ marginTop: 2 }}>
              En proceso
            </div>
          </div>

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
                style={{
                  fontSize: 18,
                  color: "var(--merco-text)",
                  display: "inline-flex",
                }}
              >
                <DynamicIcon name="FiFolder" fallback="FiFolder" />
              </span>
            </div>
            <div className="val">{kpis.escl}</div>
            <div className="lbl" style={{ marginTop: 2 }}>
              Escalados
            </div>
          </div>
        </div>

        {/* BARRA DE HERRAMIENTAS Y FILTROS */}
        <div className="ma-toolbar" style={{ marginTop: 0, marginBottom: 16 }}>
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
            {/* Buscador general con Icono dinámico */}
            <div
              className="ma-search"
              style={{ position: "relative", minWidth: 180, flex: "1 1 150px" }}
            >
              <DynamicIcon
                name="FiSearch"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "var(--merco-text, inherit)",
                  opacity: 0.6,
                  fontSize: 16,
                }}
              />
              <input
                className="inp"
                placeholder="Buscar caso, cliente, agente..."
                value={fBuscar}
                onChange={(e) => setFBuscar(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: 32,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Select por Vencimiento SLA (Vence en) */}
            <select
              value={fSlaEstado}
              onChange={(e) => setFSlaEstado(e.target.value)}
            >
              <option value="">Vencimiento (Todos)</option>
              <option value="late">Vencidos</option>
              <option value="warn">Por vencer (&lt;2h)</option>
              <option value="ok">En plazo</option>
            </select>

            {/* Select por Prioridad */}
            <select
              value={fPrioridad}
              onChange={(e) => setFPrioridad(e.target.value)}
            >
              <option value="">Prioridad (Todas)</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>

            {/* Select por Estado */}
            <select
              value={fEstado}
              onChange={(e) => setFEstado(e.target.value)}
            >
              <option value="">Estado (Todos)</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Escalado">Escalado</option>
            </select>

            {/* Selector de Fecha de Apertura */}
            <select
              value={fApertura}
              onChange={(e) => setFApertura(e.target.value)}
            >
              <option value="">Apertura (Cualquiera)</option>
              <option value="hoy">Hoy</option>
              <option value="ayer">Ayer</option>
              <option value="rango">Rango de fechas...</option>
            </select>

            {/* Inputs desplegables al seleccionar "Rango de fechas..." */}
            {fApertura === "rango" && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background:
                    "var(--merco-bg-subtle, rgba(255, 255, 255, 0.03))",
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
                  value={fFechaDesde}
                  onChange={(e) => setFFechaDesde(e.target.value)}
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
                  value={fFechaHasta}
                  onChange={(e) => setFFechaHasta(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    fontSize: 12,
                  }}
                />
              </div>
            )}

            {(fBuscar ||
              fPrioridad ||
              fEstado ||
              fSlaEstado ||
              fApertura ||
              fFechaDesde ||
              fFechaHasta) && (
              <button
                className="btn btn-ghost"
                style={{ padding: "6px 12px", fontSize: 13 }}
                onClick={limpiarFiltros}
              >
                ✕ Limpiar
              </button>
            )}
          </div>
        </div>

        {/* 2. TABLA DE CASOS EN SEGUIMIENTO */}
        <div className="ma-card">
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--merco-border)",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
                fontSize: 15,
                color: "var(--merco-text)",
              }}
            >
              Casos en seguimiento
            </span>{" "}
            <small style={{ color: "var(--merco-muted)" }}>
              ordenados por vencimiento SLA
            </small>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="ma-table">
              <thead>
                <tr style={{ background: "var(--merco-navy, #0B1B32)" }}>
                  <th style={{ color: "#FFFFFF", padding: "12px 14px" }}>#</th>
                  <th style={{ color: "#FFFFFF", padding: "12px 14px" }}>
                    CLIENTE
                  </th>
                  <th style={{ color: "#FFFFFF", padding: "12px 14px" }}>
                    TIPO
                  </th>
                  <th style={{ color: "#FFFFFF", padding: "12px 14px" }}>
                    PRIORIDAD
                  </th>
                  <th style={{ color: "#FFFFFF", padding: "12px 14px" }}>
                    ESTADO
                  </th>
                  <th style={{ color: "#FFFFFF", padding: "12px 14px" }}>
                    AGENTE
                  </th>
                  <th style={{ color: "#FFFFFF", padding: "12px 14px" }}>
                    ABIERTO
                  </th>
                  <th style={{ color: "#FFFFFF", padding: "12px 14px" }}>
                    VENCE EN
                  </th>
                  <th style={{ color: "#FFFFFF", padding: "12px 14px" }}>
                    ACCIONES
                  </th>
                </tr>
              </thead>
              <tbody>
                {casosSeguimiento.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--merco-muted)",
                      }}
                    >
                      No hay casos activos que coincidan con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  casosSeguimiento.map(({ c, s }) => {
                    const cl = clienteDe(c.cedula);

                    return (
                      <tr key={c.id}>
                        <td>
                          <b style={{ color: "var(--merco-text)" }}>#{c.id}</b>
                        </td>
                        <td>
                          <div className="ma-user-cell">
                            <div
                              className="ma-ava"
                              style={{
                                background: "var(--secondary)",
                                color: "var(--merco-text)",
                              }}
                            >
                              {initials(cl.nombre)}
                            </div>
                            <div>
                              <b
                                style={{
                                  color: "var(--merco-text)",
                                  display: "block",
                                }}
                              >
                                {cl.nombre}
                              </b>
                              <small style={{ color: "var(--merco-muted)" }}>
                                {cl.cedula}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: "var(--merco-text)" }}>{c.tipo}</td>
                        <td style={{ fontWeight: 600 }}>
                          <span
                            style={{
                              color:
                                c.prioridad === "Alta"
                                  ? "var(--merco-danger, #DC2626)"
                                  : c.prioridad === "Media"
                                    ? "var(--merco-warning, #D97706)"
                                    : "var(--merco-success, #1f9d63)",
                            }}
                          >
                            ● {c.prioridad}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 500,
                              background:
                                c.estado === "Pendiente"
                                  ? "rgba(47, 111, 237, 0.15)"
                                  : c.estado === "En Proceso"
                                    ? "rgba(216, 153, 42, 0.15)"
                                    : "rgba(209, 67, 91, 0.15)",
                              color:
                                c.estado === "Pendiente"
                                  ? "var(--merco-blue, #2f6fed)"
                                  : c.estado === "En Proceso"
                                    ? "var(--merco-warning, #d8992a)"
                                    : "var(--merco-danger, #d1435b)",
                            }}
                          >
                            ● {c.estado}
                          </span>
                        </td>
                        <td style={{ color: "var(--merco-muted)" }}>
                          {c.agente}
                        </td>
                        <td
                          style={{
                            whiteSpace: "nowrap",
                            color: "var(--merco-muted)",
                            fontSize: 12,
                          }}
                        >
                          {fmtDT(c.opened)}
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                s.state === "late"
                                  ? "var(--merco-danger, #DC2626)"
                                  : s.state === "warn"
                                    ? "var(--merco-warning, #D97706)"
                                    : "var(--merco-success, #1f9d63)",
                            }}
                          >
                            {humanLeft(s.mins)}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-icon"
                            title="Ver detalle"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            <DynamicIcon name="FiEye" fallback="FiEye" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "12px 18px",
              borderTop: "1px solid var(--merco-border)",
              fontSize: 12.5,
              color: "var(--merco-muted)",
            }}
          >
            <b>{casosSeguimiento.length}</b> casos requiriendo atención activa
          </div>
        </div>
      </div>
    </SystemLayout>
  );
}