import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import SystemLayout from "../../layouts/SystemLayout";

/* IMPORTAMOS EL COMPONENTE DINÁMICO DE ÍCONOS */
import { DynamicIcon } from "../../components/IconCatalog";

/* ====== CONSTANTES ====== */
const CASOS_RECIENTES = [
  {
    id: 1042,
    nombre: "Daniela Suárez",
    cedula: "25.667.001",
    tipo: "Otros",
    prioridad: "Media",
    estado: "En Proceso",
    agente: "Eleany 1",
  },
  {
    id: 1041,
    nombre: "María Gómez",
    cedula: "15.987.654",
    tipo: "Generar Certificado",
    prioridad: "Media",
    estado: "Pendiente",
    agente: "Maria J 2",
  },
  {
    id: 1040,
    nombre: "José Rodríguez",
    cedula: "12.345.678",
    tipo: "Firma Electrónica",
    prioridad: "Alta",
    estado: "En Proceso",
    agente: "Eleany 1",
  },
  {
    id: 1039,
    nombre: "Carlos Pérez",
    cedula: "18.223.114",
    tipo: "Mercado de Valores",
    prioridad: "Alta",
    estado: "Pendiente",
    agente: "Andrea 3",
  },
  {
    id: 1038,
    nombre: "Carlos Pérez",
    cedula: "18.223.114",
    tipo: "Mercado de Valores",
    prioridad: "Baja",
    estado: "En Proceso",
    agente: "Yetsimar 10",
  },
  {
    id: 1037,
    nombre: "Gabriela Ríos",
    cedula: "22.778.443",
    tipo: "Akkela",
    prioridad: "Media",
    estado: "En Proceso",
    agente: "Yabelis 8",
  },
];

const ALERTAS_SLA = [
  {
    id: 1036,
    nombre: "Pedro Blanco",
    tipo: "Legacy",
    prioridad: "Alta",
    tiempo: "hace 16h 0m",
  },
  {
    id: 1040,
    nombre: "Carlos Pérez",
    tipo: "Mercado de Valores",
    prioridad: "Alta",
    tiempo: "hace 5h 0m",
  },
  {
    id: 1042,
    nombre: "José Rodríguez",
    tipo: "Firma Electrónica",
    prioridad: "Alta",
    tiempo: "hace 2h 0m",
  },
  {
    id: 1033,
    nombre: "María Gómez",
    tipo: "Firma Electrónica",
    prioridad: "Media",
    tiempo: "hace 2h 0m",
  },
];

const RANKING_AGENTES = [
  { nombre: "Eleany 1", count: 3, pct: "100%" },
  { nombre: "Maria J 2", count: 1, pct: "33%" },
  { nombre: "Andrea 3", count: 1, pct: "33%" },
  { nombre: "Ira 4", count: 1, pct: "33%" },
  { nombre: "Moises 5", count: 1, pct: "33%" },
  { nombre: "Vanessa 6", count: 1, pct: "33%" },
];

function initials(n) {
  return n
    ? n
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "—";
}

/* HOOK PARA DETECTAR EL MODO OSCURO GLOBAL DESDE SYSTEMS.CSS / INDEX.CSS */
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(
        document.documentElement.classList.contains("dark") ||
          document.body.classList.contains("dark") ||
          document.documentElement.getAttribute("data-theme") === "dark"
      );
    };

    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

export default function Dashboard() {
  const isDark = useIsDarkMode();

  return (
    <SystemLayout identificacion="Administración General">
      <div
        style={{
          fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
          padding: "10px 0",
        }}
      >
        {/* 1. TARJETAS DE MÉTRICAS (KPIs) - Con íconos de Feather */}
        <div
          className="ma-stats"
          style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
        >
          <KPICard
            icon="FiFolder"
            val="14"
            label="Total de casos"
            trend="▲ activos en el periodo"
            trendColor="var(--merco-success, #16a34a)"
          />
          <KPICard icon="FiClock" val="9" label="Casos abiertos" />
          <KPICard icon="FiBell" val="6" label="En seguimiento" />
          <KPICard icon="FiCheckCircle" val="5" label="Resueltos" />
          <KPICard
            icon="FiAlertTriangle"
            val="4"
            label="Vencidos (SLA)"
            trend="▼ requieren atención"
            trendColor="var(--merco-danger, #dc2626)"
            iconColor="var(--merco-danger, #dc2626)"
          />
        </div>

        {/* 2. FILA 1 DE GRÁFICOS: EVOLUCIÓN Y POR ESTADO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div className="ma-card" style={{ padding: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  color: "var(--merco-text)",
                }}
              >
                Evolución de casos
              </span>{" "}
              <small style={{ color: "var(--merco-muted)" }}>
                últimos 7 días
              </small>
            </div>
            <ChartLineEvol isDark={isDark} />
          </div>

          <div className="ma-card" style={{ padding: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  color: "var(--merco-text)",
                }}
              >
                Casos por estado
              </span>
            </div>
            <ChartDoughnutEstado isDark={isDark} />
          </div>
        </div>

        {/* 3. FILA 2: CASOS RECIENTES Y ALERTAS SLA */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* TABLA DE CASOS RECIENTES */}
          <div className="ma-card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
                  Casos recientes
                </span>{" "}
                <small style={{ color: "var(--merco-muted)" }}>
                  últimos registros
                </small>
              </div>
              <button className="btn btn-ghost btn-sm">Ver todos</button>
            </div>

            <table className="ma-table">
              <thead>
                <tr>
                  <th>CLIENTE</th>
                  <th>TIPO</th>
                  <th>PRIORIDAD</th>
                  <th>ESTADO</th>
                  <th>AGENTE</th>
                </tr>
              </thead>
              <tbody>
                {CASOS_RECIENTES.map((c, i) => (
                  <tr key={i}>
                    <td style={{ padding: "10px 16px" }}>
                      <div className="ma-user-cell">
                        <div
                          className="ma-ava"
                          style={{ background: "var(--merco-navy, #0B1B32)" }}
                        >
                          {initials(c.nombre)}
                        </div>
                        <div>
                          <b
                            style={{
                              color: "var(--merco-text)",
                              display: "block",
                            }}
                          >
                            {c.nombre}
                          </b>
                          <small style={{ color: "var(--merco-muted)" }}>
                            {c.cedula}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span className="tag">{c.tipo}</span>
                    </td>
                    <td style={{ padding: "10px 16px", fontWeight: 600 }}>
                      <span
                        style={{
                          color:
                            c.prioridad === "Alta"
                              ? "var(--merco-danger, #DC2626)"
                              : "var(--merco-warning, #D97706)",
                        }}
                      >
                        ● {c.prioridad}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 500,
                          background:
                            c.estado === "Pendiente"
                              ? "rgba(47, 111, 237, 0.15)"
                              : "rgba(216, 153, 42, 0.15)",
                          color:
                            c.estado === "Pendiente"
                              ? "var(--merco-blue, #2f6fed)"
                              : "var(--merco-warning, #d8992a)",
                        }}
                      >
                        ● {c.estado}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        color: "var(--merco-muted)",
                      }}
                    >
                      {c.agente}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ALERTAS DE SEGUIMIENTO (SLA) */}
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
                Alertas de seguimiento
              </span>{" "}
              <small style={{ color: "var(--merco-muted)" }}>SLA</small>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ALERTAS_SLA.map((item) => (
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
                      border: "1px solid rgba(209, 67, 91, 0.4)",
                      background: "rgba(209, 67, 91, 0.12)",
                      color: "var(--merco-danger, #DC2626)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 16,
                    }}
                  >
                    <DynamicIcon name="FiAlertTriangle" fallback="FiAlertTriangle" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <b
                      style={{
                        fontSize: 13,
                        color: "var(--merco-text)",
                        display: "block",
                      }}
                    >
                      #{item.id} · {item.nombre}
                    </b>
                    <small style={{ color: "var(--merco-muted)" }}>
                      {item.tipo} ·{" "}
                      <span
                        style={{
                          color:
                            item.prioridad === "Alta"
                              ? "var(--merco-danger, #DC2626)"
                              : "var(--merco-warning, #D97706)",
                        }}
                      >
                        ● {item.prioridad}
                      </span>
                    </small>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "var(--merco-danger, #DC2626)",
                        display: "block",
                      }}
                    >
                      Vencido
                    </span>
                    <small style={{ color: "var(--merco-muted)" }}>
                      {item.tiempo}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. FILA 3: CANAL Y RANKING DE AGENTES */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}
        >
          <div className="ma-card" style={{ padding: 18 }}>
            <div style={{ marginBottom: 16 }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  color: "var(--merco-text)",
                }}
              >
                Distribución por canal
              </span>
            </div>
            <ChartBarCanal isDark={isDark} />
          </div>

          <div className="ma-card" style={{ padding: 18 }}>
            <div style={{ marginBottom: 16 }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  color: "var(--merco-text)",
                }}
              >
                Ranking de agentes
              </span>{" "}
              <small style={{ color: "var(--merco-muted)" }}>
                por atenciones
              </small>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {RANKING_AGENTES.map((a, idx) => (
                <div
                  key={a.nombre}
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background:
                        idx === 0
                          ? "var(--merco-accent, #c8a45c)"
                          : "var(--secondary, #F1F5F9)",
                      color: idx === 0 ? "#0b2545" : "var(--merco-muted)",
                      fontSize: 12,
                      fontWeight: "bold",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span
                    style={{
                      width: 85,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--merco-text)",
                    }}
                  >
                    {a.nombre}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      background: "var(--secondary, #F1F5F9)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: a.pct,
                        height: "100%",
                        background: "var(--merco-accent, #c8a45c)",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <b
                    style={{
                      fontSize: 13,
                      color: "var(--merco-text)",
                      minWidth: 16,
                      textAlign: "right",
                    }}
                  >
                    {a.count}
                  </b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SystemLayout>
  );
}

/* ====== COMPONENTE TARJETA KPI ====== */
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
          style={{
            fontSize: 20,
            color: iconColor || "var(--merco-muted)",
            display: "inline-flex",
            alignItems: "center",
          }}
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
            color: trendColor,
            marginTop: 6,
          }}
        >
          {trend}
        </div>
      )}
    </div>
  );
}

/* ====== COMPONENTES DE CHART.JS ADAPTADOS AL MODO OSCURO GLOBAL ====== */
function ChartLineEvol({ isDark }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)";

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["vie", "sáb", "dom", "lun", "mar", "mié", "jue"],
        datasets: [
          {
            label: "Casos recibidos",
            data: [0, 0, 1, 1, 3, 3, 6],
            borderColor: isDark ? "#38bdf8" : "#0B1B32",
            backgroundColor: isDark
              ? "rgba(56, 189, 248, 0.15)"
              : "rgba(11, 27, 50, 0.12)",
            fill: true,
            tension: 0.4,
            pointRadius: 3,
          },
          {
            label: "Resueltos",
            data: [0, 0, 0, 0, 3, 0, 0],
            borderColor: "#c8a45c",
            backgroundColor: "rgba(200, 164, 92, 0.15)",
            fill: true,
            tension: 0.4,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } },
        },
        plugins: {
          legend: { position: "bottom", labels: { color: textColor } },
        },
      },
    });
    return () => chart.destroy();
  }, [isDark]);

  return (
    <div style={{ height: 210 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function ChartDoughnutEstado({ isDark }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";

    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Pendiente", "En Proceso", "Resuelto", "Escalado"],
        datasets: [
          {
            data: [2, 3, 8, 1],
            backgroundColor: ["#2f6fed", "#d8992a", "#1f9d63", "#d1435b"],
            borderColor: isDark ? "#08192f" : "#FFFFFF",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: textColor } },
        },
      },
    });
    return () => chart.destroy();
  }, [isDark]);

  return (
    <div style={{ height: 210 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function ChartBarCanal({ isDark }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)";

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [
          "Wasapi",
          "Tickets",
          "Presencial",
          "Telefónico",
          "Correo electrónico",
          "Telegram",
          "Instagram",
        ],
        datasets: [
          {
            data: [3, 3, 2, 2, 2, 1, 1],
            backgroundColor: "#c8a45c",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } },
        },
        plugins: { legend: { display: false } },
      },
    });
    return () => chart.destroy();
  }, [isDark]);

  return (
    <div style={{ height: 210 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}