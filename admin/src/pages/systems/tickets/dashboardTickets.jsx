import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../../components/IconCatalog";

/* ====== HOOK DE CONEXIÓN CON EL BACKEND (VISTAS SQL DE TICKETS) ====== */
import { useTicketsDashboard } from "../../systems/tickets/hooks/useTicketsDashboard";

/* FUNCIÓN DE APOYO PARA ASIGNAR EL COLOR SEGÚN EL NOMBRE DEL ESTATUS */
function obtenerColorEstatus(nombreEstatus) {
  const est = (nombreEstatus || "").toLowerCase();
  if (est.includes("en proceso")) return "#3B82F6"; // Azul
  if (est.includes("pendiente de usuario")) return "#F59E0B"; // Ámbar / Naranja
  if (est.includes("en espera proveedor")) return "#A855F7"; // Morado
  if (est.includes("en aprobación")) return "#EC4899"; // Rosa
  if (est.includes("vencido") || est.includes("crítico")) return "#DC2626"; // Rojo
  if (est.includes("cerrado")) return "#059669"; // Verde Oscuro
  if (est.includes("cancelado")) return "#0EA5E9"; // Celeste
  return "#64748B"; // Gris por defecto
}

/* HOOK PARA DETECTAR EL MODO OSCURO GLOBAL DESDE SYSTEMS.CSS / INDEX.CSS */
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

export default function DashboardTickets() {
  const navigate = useNavigate();
  const isDark = useIsDarkMode();
  const {
    loading,
    kpis,
    ticketsPorCategoria,
    distribucionEstados,
    ultimosTickets,
    casosPorAnalista,
    toast,
  } = useTicketsDashboard();

  return (
    <SystemLayout identificacion="Tickets" opcionMenu="Dashboard">
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 8,
            background: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "#fff",
            fontWeight: 500,
          }}
        >
          {toast.message}
        </div>
      )}

      <div className="ma-content" style={{ padding: "10px 0" }}>
        {/* 1. TARJETAS DE MÉTRICAS (KPIs) - SOLO TICKETS EXTERNOS */}
        <div
          className="ma-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <KPICard
            icon="FiLayers"
            val={loading ? "..." : kpis.total_tickets || 0}
            label="Total Tickets Externos"
            iconColor="#3B82F6"
          />
          <KPICard
            icon="FiClock"
            val={loading ? "..." : kpis.en_proceso || 0}
            label="En Proceso"
            iconColor="#3B82F6"
          />
          <KPICard
            icon="FiAlertCircle"
            val={loading ? "..." : kpis.en_aprobacion || 0}
            label="En Aprobación"
            iconColor="#EC4899"
          />
          <KPICard
            icon="FiUser"
            val={loading ? "..." : kpis.pendiente_usuario || 0}
            label="Pendiente Usuario"
            iconColor="#F59E0B"
          />
          <KPICard
            icon="FiTruck"
            val={loading ? "..." : kpis.espera_proveedor || 0}
            label="En Espera Proveedor"
            iconColor="#A855F7"
          />
          <KPICard
            icon="FiAlertTriangle"
            val={loading ? "..." : kpis.vencido || 0}
            label="Vencidos"
            iconColor="#DC2626"
          />
          <KPICard
            icon="FiArchive"
            val={loading ? "..." : kpis.cerrado || 0}
            label="Cerrados"
            iconColor="#059669"
          />
          <KPICard
            icon="FiXCircle"
            val={loading ? "..." : kpis.cancelado || 0}
            label="Cancelados"
            iconColor="#0EA5E9"
          />
        </div>

        {/* 2. FILA 1 DE GRÁFICOS: DISTRIBUCIÓN DE ESTATUS Y CATEGORÍAS EXTERNAS */}
        <div className="dashboard-grid-2col">
          <div className="ma-card" style={{ padding: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  color: "var(--merco-text)",
                }}
              >
                Estatus de Tickets
              </span>{" "}
              <small style={{ color: "var(--merco-muted)" }}>
                todos los casos
              </small>
            </div>
            <ChartDoughnutEstado
              data={distribucionEstados}
              isDark={isDark}
              loading={loading}
            />
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
                Volumen de Casos por Categoría
              </span>
            </div>
            <ChartBarCategoria
              data={ticketsPorCategoria}
              isDark={isDark}
              loading={loading}
            />
          </div>
        </div>

        {/* 3. FILA 2: TICKETS RECIENTES Y GRÁFICO DE CASOS POR ANALISTA SOLICITANTE */}
        <div className="dashboard-grid-2col">
          {/* TABLA DE TICKETS RECIENTES CON CURSOR POINTER Y NAVEGACIÓN */}
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
                  Tickets recientes
                </span>{" "}
                <small style={{ color: "var(--merco-muted)" }}>
                  últimos registros
                </small>
              </div>
            </div>

            <div className="ma-table-container">
              <table className="ma-table">
                <thead>
                  <tr>
                    <th>CÓDIGO / ASUNTO</th>
                    <th>ESTATUS</th>
                    <th>CLIENTE / SOLICITANTE</th>
                    <th>FECHA</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        Cargando registros...
                      </td>
                    </tr>
                  ) : ultimosTickets.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "var(--merco-muted)",
                        }}
                      >
                        No hay tickets externos recientes.
                      </td>
                    </tr>
                  ) : (
                    ultimosTickets.map((t) => {
                      const colorBadge = obtenerColorEstatus(t.estado);
                      return (
                        <tr
                          key={t.id}
                          style={{ cursor: "pointer" }}
                          title="Hacer clic para ver detalle del ticket"
                          onClick={() =>
                            navigate(
                              `/tickets/casos-tickets?abrirTicket=${t.id}`,
                            )
                          }
                        >
                          <td style={{ padding: "10px 16px" }}>
                            <div>
                              <b
                                style={{
                                  color: "var(--merco-text)",
                                  display: "block",
                                }}
                              >
                                {t.codigo}
                              </b>
                              <small style={{ color: "var(--merco-muted)" }}>
                                {t.asunto}
                              </small>
                            </div>
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 500,
                                background: `${colorBadge}15`,
                                color: colorBadge,
                              }}
                            >
                              ● {t.estado || "N/D"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              color: "var(--merco-text)",
                            }}
                          >
                            {t.solicitante || "Cliente Externo"}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              color: "var(--merco-muted)",
                              fontSize: 12,
                            }}
                          >
                            {t.tiempo}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* GRÁFICO DE BARRAS HORIZONTAL: CASOS POR ANALISTA SOLICITANTE */}
          <div className="ma-card" style={{ padding: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  color: "var(--merco-text)",
                }}
              >
                Casos creados por analista
              </span>{" "}
            </div>
            <ChartBarAnalistaCreador
              data={casosPorAnalista}
              isDark={isDark}
              loading={loading}
            />
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
            fontSize: 18,
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

/* ====== COMPONENTES DE CHART.JS ====== */
function ChartDoughnutEstado({ data, isDark, loading }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (loading || !data || data.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";

    const labels = data.map((d) => d.estado);
    const values = data.map((d) => d.total);

    const backgroundColors = labels.map((nombre) =>
      obtenerColorEstatus(nombre),
    );

    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: backgroundColors,
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
  }, [data, isDark, loading]);

  return (
    <div style={{ height: 250, position: "relative", width: "100%" }}>
      {loading ? (
        <div style={{ textAlign: "center", paddingTop: 100 }}>
          Cargando gráfico...
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
}

function ChartBarCategoria({ data, isDark, loading }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (loading || !data || data.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)";

    const labels = data.map((d) => d.nombre_categoria);
    const values = data.map((d) => d.total_tickets);

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
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
  }, [data, isDark, loading]);

  return (
    <div style={{ height: 250, position: "relative", width: "100%" }}>
      {loading ? (
        <div style={{ textAlign: "center", paddingTop: 100 }}>
          Cargando gráfico...
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
}

/* ====== GRÁFICO DE BARRAS HORIZONTAL: CASOS POR ANALISTA ====== */
function ChartBarAnalistaCreador({ data, isDark, loading }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (loading || !data || data.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)";

    const labels = data.map((d) => d.nombre_analista);
    const values = data.map((d) => d.total_tickets);

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Casos Creados",
            data: values,
            backgroundColor: "#2f6fed",
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y", // Convierte el gráfico en barras horizontales
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { display: false } },
        },
        plugins: { legend: { display: false } },
      },
    });
    return () => chart.destroy();
  }, [data, isDark, loading]);

  return (
    <div style={{ height: 250, position: "relative", width: "100%" }}>
      {loading ? (
        <div style={{ textAlign: "center", paddingTop: 100 }}>
          Cargando gráfico...
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
}
