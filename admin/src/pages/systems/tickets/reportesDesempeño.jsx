import React, { useState, useMemo, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import SystemLayout from "../../layouts/SystemLayout";

/* IMPORTAMOS EL COMPONENTE DINÁMICO DE ÍCONOS */
import { DynamicIcon } from "../../components/IconCatalog";

/* ====== CONSTANTES ====== */
const TIPOS = [
  "Firma Electrónica",
  "Generar Certificado",
  "Web App",
  "Legacy",
  "Akkela",
  "Caja Venezolana de Valores",
  "Mercado de Valores",
  "Otros",
];
const AGENTES = [
  "Eleany 1",
  "Maria J 2",
  "Andrea 3",
  "Ira 4",
  "Moises 5",
  "Vanessa 6",
  "Dayerling 7",
  "Yabelis 8",
  "Cladimar 9",
  "Yetsimar 10",
  "Zulmar 11",
  "Albert 12",
];

/* ====== DATOS DE EJEMPLO DE CASOS ====== */
const NOW = new Date("2026-09-24T15:30:00");
const H = 3600 * 1000;

const CASOS_INIT = [
  {
    id: 1042,
    canal: "Wasapi",
    tipo: "Firma Electrónica",
    prioridad: "Alta",
    estado: "En Proceso",
    agente: "Eleany 1",
    opened: new Date(NOW - 6 * H),
  },
  {
    id: 1041,
    canal: "Tickets",
    tipo: "Generar Certificado",
    prioridad: "Media",
    estado: "Pendiente",
    agente: "Maria J 2",
    opened: new Date(NOW - 3 * H),
  },
  {
    id: 1040,
    canal: "Telefónico",
    tipo: "Mercado de Valores",
    prioridad: "Alta",
    estado: "Pendiente",
    agente: "Andrea 3",
    opened: new Date(NOW - 9 * H),
  },
  {
    id: 1039,
    canal: "Correo electrónico",
    tipo: "Web App",
    prioridad: "Baja",
    estado: "En Proceso",
    agente: "Ira 4",
    opened: new Date(NOW - 30 * H),
  },
  {
    id: 1038,
    canal: "Presencial",
    tipo: "Caja Venezolana de Valores",
    prioridad: "Media",
    estado: "Resuelto",
    agente: "Moises 5",
    opened: new Date(NOW - 40 * H),
  },
  {
    id: 1037,
    canal: "Instagram",
    tipo: "Otros",
    prioridad: "Baja",
    estado: "Resuelto",
    agente: "Vanessa 6",
    opened: new Date(NOW - 52 * H),
  },
  {
    id: 1036,
    canal: "Wasapi",
    tipo: "Legacy",
    prioridad: "Alta",
    estado: "Escalado",
    agente: "Dayerling 7",
    opened: new Date(NOW - 20 * H),
  },
  {
    id: 1035,
    canal: "Telegram",
    tipo: "Akkela",
    prioridad: "Media",
    estado: "En Proceso",
    agente: "Yabelis 8",
    opened: new Date(NOW - 14 * H),
  },
  {
    id: 1034,
    canal: "Tickets",
    tipo: "Generar Certificado",
    prioridad: "Baja",
    estado: "Resuelto",
    agente: "Eleany 1",
    opened: new Date(NOW - 70 * H),
  },
  {
    id: 1033,
    canal: "Telefónico",
    tipo: "Firma Electrónica",
    prioridad: "Media",
    estado: "Pendiente",
    agente: "Cladimar 9",
    opened: new Date(NOW - 26 * H),
  },
  {
    id: 1032,
    canal: "Correo electrónico",
    tipo: "Mercado de Valores",
    prioridad: "Baja",
    estado: "En Proceso",
    agente: "Yetsimar 10",
    opened: new Date(NOW - 10 * H),
  },
  {
    id: 1031,
    canal: "Presencial",
    tipo: "Firma Electrónica",
    prioridad: "Alta",
    estado: "Resuelto",
    agente: "Zulmar 11",
    opened: new Date(NOW - 48 * H),
  },
  {
    id: 1030,
    canal: "Wasapi",
    tipo: "Web App",
    prioridad: "Media",
    estado: "Resuelto",
    agente: "Albert 12",
    opened: new Date(NOW - 90 * H),
  },
  {
    id: 1029,
    canal: "Tickets",
    tipo: "Otros",
    prioridad: "Media",
    estado: "En Proceso",
    agente: "Eleany 1",
    opened: new Date(NOW - 2 * H),
  },
];

/* HOOK PARA MODO OSCURO */
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(
        document.documentElement.classList.contains("dark") ||
          document.body.classList.contains("dark") ||
          document.documentElement.getAttribute("data-theme") === "dark",
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

export default function ReportesDesempeno() {
  const isDark = useIsDarkMode();
  const [rango, setRango] = useState("total");
  const [casos] = useState(CASOS_INIT);

  // Filtrado según rango temporal seleccionado
  const casosFiltrados = useMemo(() => {
    if (rango === "semana") {
      const sieteDias = 7 * 24 * H;
      return casos.filter((c) => NOW - c.opened <= sieteDias);
    }
    if (rango === "mes") {
      const treintaDias = 30 * 24 * H;
      return casos.filter((c) => NOW - c.opened <= treintaDias);
    }
    return casos;
  }, [casos, rango]);

  // Cálculos de KPIs
  const totalAtenciones = casosFiltrados.length;
  const resueltos = casosFiltrados.filter(
    (c) => c.estado === "Resuelto",
  ).length;
  const tasaResolucion = totalAtenciones
    ? Math.round((resueltos / totalAtenciones) * 100)
    : 0;

  const agentCounts = useMemo(() => {
    const m = {};
    AGENTES.forEach((a) => (m[a] = 0));
    casosFiltrados.forEach((c) => {
      m[c.agente] = (m[c.agente] || 0) + 1;
    });
    return m;
  }, [casosFiltrados]);

  const canalCounts = useMemo(() => {
    const m = {};
    casosFiltrados.forEach((c) => {
      m[c.canal] = (m[c.canal] || 0) + 1;
    });
    return m;
  }, [casosFiltrados]);

  const mejorAgente = useMemo(() => {
    const arr = Object.entries(agentCounts).sort((a, b) => b[1] - a[1]);
    return arr[0] && arr[0][1] > 0 ? arr[0][0] : "—";
  }, [agentCounts]);

  const canalMasUsado = useMemo(() => {
    const arr = Object.entries(canalCounts).sort((a, b) => b[1] - a[1]);
    return arr[0] && arr[0][1] > 0 ? arr[0][0] : "—";
  }, [canalCounts]);

  // Datos detallados por agente para la tabla
  const desempeñoAgentes = useMemo(() => {
    const m = {};
    AGENTES.forEach(
      (a) => (m[a] = { total: 0, resueltos: 0, enProceso: 0, escalados: 0 }),
    );
    casosFiltrados.forEach((c) => {
      if (!m[c.agente]) return;
      m[c.agente].total++;
      if (c.estado === "Resuelto") m[c.agente].resueltos++;
      if (c.estado === "En Proceso") m[c.agente].enProceso++;
      if (c.estado === "Escalado") m[c.agente].escalados++;
    });
    return AGENTES.filter((a) => m[a].total > 0)
      .map((a) => {
        const data = m[a];
        const pct = data.total
          ? Math.round((data.resueltos / data.total) * 100)
          : 0;
        return { agente: a, ...data, pct };
      })
      .sort((a, b) => b.total - a.total);
  }, [casosFiltrados]);

  return (
    <SystemLayout identificacion="Tickets">
      <div
        style={{
          fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
          padding: "10px 0",
        }}
      >
        {/* ENCABEZADO Y SELECTOR DE RANGO ESTILIZADO */}
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
              Reportes &amp; Desempeño
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--merco-muted)",
                margin: "2px 0 0 0",
              }}
            >
              Indicadores globales de rendimiento y métricas de atención
            </p>
          </div>

          {/* GRUPO DE BOTONES CON ESTILOS DE FILTRO */}
          <div
            style={{
              display: "inline-flex",
              background: "var(--secondary, #F1F5F9)",
              border: "1px solid var(--merco-border)",
              borderRadius: 10,
              padding: 3,
              gap: 4,
            }}
          >
            <button
              onClick={() => setRango("semana")}
              style={{
                padding: "6px 14px",
                borderRadius: 7,
                fontSize: 12.5,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.18s ease",
                background:
                  rango === "semana"
                    ? "var(--merco-surface, #FFFFFF)"
                    : "transparent",
                color:
                  rango === "semana"
                    ? "var(--merco-text)"
                    : "var(--merco-muted)",
                boxShadow:
                  rango === "semana"
                    ? "var(--ma-shadow-sm, 0 2px 8px rgba(0,0,0,0.08))"
                    : "none",
              }}
            >
              Esta semana
            </button>
            <button
              onClick={() => setRango("mes")}
              style={{
                padding: "6px 14px",
                borderRadius: 7,
                fontSize: 12.5,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.18s ease",
                background:
                  rango === "mes"
                    ? "var(--merco-surface, #FFFFFF)"
                    : "transparent",
                color:
                  rango === "mes" ? "var(--merco-text)" : "var(--merco-muted)",
                boxShadow:
                  rango === "mes"
                    ? "var(--ma-shadow-sm, 0 2px 8px rgba(0,0,0,0.08))"
                    : "none",
              }}
            >
              Este mes
            </button>
            <button
              onClick={() => setRango("total")}
              style={{
                padding: "6px 14px",
                borderRadius: 7,
                fontSize: 12.5,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.18s ease",
                background:
                  rango === "total"
                    ? "var(--merco-surface, #FFFFFF)"
                    : "transparent",
                color:
                  rango === "total"
                    ? "var(--merco-text)"
                    : "var(--merco-muted)",
                boxShadow:
                  rango === "total"
                    ? "var(--ma-shadow-sm, 0 2px 8px rgba(0,0,0,0.08))"
                    : "none",
              }}
            >
              Total
            </button>
          </div>
        </div>

        {/* 1. TARJETAS DE MÉTRICAS (KPIs) CON DYNAMICICON */}
        <div
          className="ma-stats"
          style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 22 }}
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
                  color: "var(--merco-muted)",
                  display: "inline-flex",
                }}
              >
                <DynamicIcon name="FiFolder" fallback="FiFolder" />
              </span>
            </div>
            <div className="val">{totalAtenciones}</div>
            <div className="lbl" style={{ marginTop: 2 }}>
              Total atenciones
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
                  color: "var(--merco-success, #1f9d63)",
                  display: "inline-flex",
                }}
              >
                <DynamicIcon name="FiCheckCircle" fallback="FiCheckCircle" />
              </span>
            </div>
            <div className="val">{tasaResolucion}%</div>
            <div className="lbl" style={{ marginTop: 2 }}>
              Tasa de resolución
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
                  color: "var(--merco-accent, #c8a45c)",
                  display: "inline-flex",
                }}
              >
                <DynamicIcon name="FiAward" fallback="FiAward" />
              </span>
            </div>
            <div
              className="val"
              style={{
                fontSize: 18,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {mejorAgente}
            </div>
            <div className="lbl" style={{ marginTop: 2 }}>
              Mejor agente
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
                <DynamicIcon name="FiRadio" fallback="FiRadio" />
              </span>
            </div>
            <div
              className="val"
              style={{
                fontSize: 18,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {canalMasUsado}
            </div>
            <div className="lbl" style={{ marginTop: 2 }}>
              Canal más usado
            </div>
          </div>
        </div>

        {/* 2. GRÁFICOS DE DESEMPEÑO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 22,
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
                Desempeño por agente
              </span>{" "}
              <small style={{ color: "var(--merco-muted)" }}>
                total de atenciones
              </small>
            </div>
            <ChartAgentes agentesData={agentCounts} isDark={isDark} />
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
                Consultas más frecuentes
              </span>{" "}
              <small style={{ color: "var(--merco-muted)" }}>por tipo</small>
            </div>
            <ChartTipos casos={casosFiltrados} isDark={isDark} />
          </div>
        </div>

        {/* 3. TABLA DE DESEMPEÑO POR AGENTE */}
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
              Tabla de desempeño
            </span>{" "}
            <small style={{ color: "var(--merco-muted)" }}>
              por agente de atención
            </small>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="ma-table">
              <thead>
                <tr>
                  <th>AGENTE</th>
                  <th>TOTAL CASOS</th>
                  <th>RESUELTOS</th>
                  <th>EN SEGUIM.</th>
                  <th>ESCALADOS</th>
                  <th>% RESOLUCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {desempeñoAgentes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--merco-muted)",
                      }}
                    >
                      Sin registros de atenciones para el periodo seleccionado
                    </td>
                  </tr>
                ) : (
                  desempeñoAgentes.map((row) => (
                    <tr key={row.agente}>
                      <td>
                        <b style={{ color: "var(--merco-text)" }}>
                          {row.agente}
                        </b>
                      </td>
                      <td style={{ color: "var(--merco-text)" }}>
                        {row.total}
                      </td>
                      <td
                        style={{
                          color: "var(--merco-success, #1f9d63)",
                          fontWeight: 600,
                        }}
                      >
                        {row.resueltos}
                      </td>
                      <td
                        style={{
                          color: "var(--merco-warning, #d8992a)",
                          fontWeight: 600,
                        }}
                      >
                        {row.enProceso}
                      </td>
                      <td
                        style={{
                          color: "var(--merco-danger, #d1435b)",
                          fontWeight: 600,
                        }}
                      >
                        {row.escalados}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              maxWidth: 100,
                              height: 7,
                              background: "var(--secondary, #F1F5F9)",
                              borderRadius: 99,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${row.pct}%`,
                                background:
                                  "linear-gradient(90deg, var(--merco-accent, #c8a45c), var(--merco-accent-dark, #a8863f))",
                                borderRadius: 99,
                              }}
                            />
                          </div>
                          <b
                            style={{ color: "var(--merco-text)", fontSize: 13 }}
                          >
                            {row.pct}%
                          </b>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SystemLayout>
  );
}

/* ====== COMPONENTES DE GRÁFICOS CHART.JS ====== */
function ChartAgentes({ agentesData, isDark }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)";

    const aL = AGENTES.filter((a) => agentesData[a] > 0);

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: aL,
        datasets: [
          {
            label: "Atenciones",
            data: aL.map((a) => agentesData[a]),
            backgroundColor: isDark ? "#38bdf8" : "#1D3A63",
            borderRadius: 6,
            maxBarThickness: 22,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: textColor, precision: 0 },
            grid: { color: gridColor },
          },
          y: { ticks: { color: textColor }, grid: { display: false } },
        },
      },
    });

    return () => chart.destroy();
  }, [agentesData, isDark]);

  return (
    <div style={{ height: 300 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function ChartTipos({ casos, isDark }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)";

    const counts = {};
    casos.forEach((c) => {
      counts[c.tipo] = (counts[c.tipo] || 0) + 1;
    });
    const tL = TIPOS.filter((t) => counts[t]).sort(
      (a, b) => counts[b] - counts[a],
    );

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: tL,
        datasets: [
          {
            label: "Casos",
            data: tL.map((t) => counts[t]),
            backgroundColor: "#c8a45c",
            borderRadius: 6,
            maxBarThickness: 22,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: textColor, precision: 0 },
            grid: { color: gridColor },
          },
          y: { ticks: { color: textColor }, grid: { display: false } },
        },
      },
    });

    return () => chart.destroy();
  }, [casos, isDark]);

  return (
    <div style={{ height: 300 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
