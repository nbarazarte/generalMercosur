import React, { useState, useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import SystemLayout from "../../layouts/SystemLayout";

/* IMPORTAMOS EL COMPONENTE DINÁMICO E ICON PICKER DE ÍCONOS DE LA APLICACIÓN */
import { DynamicIcon, IconPicker } from "../../components/IconCatalog";

/* ====== DATOS INICIALES DE EXPEDIENTES DE RECURSOS HUMANOS ====== */
const DATOS_INICIALES = [
  {
    id: 1,
    cedula: "V-12.345.678",
    nombres: "García Márquez Carlos Eduardo",
    f_ingreso: "2023-01-15",
    estado_colaborador: "Activo",
    creado_por: "Ana Rodríguez",
    f_creacion: "2023-01-15",
    estado: "completo",
    departamento: "Tecnología",
  },
  {
    id: 2,
    cedula: "V-08.765.432",
    nombres: "Pérez Gómez María Alejandra",
    f_ingreso: "2022-06-01",
    estado_colaborador: "Activo",
    creado_por: "Ana Rodríguez",
    f_creacion: "2022-06-01",
    estado: "incompleto",
    departamento: "Operaciones",
  },
  {
    id: 3,
    cedula: "V-15.987.654",
    nombres: "Rodríguez Blanco José Manuel",
    f_ingreso: "2021-03-10",
    estado_colaborador: "Inactivo",
    creado_por: "Carlos Méndez",
    f_creacion: "2021-03-10",
    estado: "vencido",
    departamento: "Finanzas",
  },
  {
    id: 4,
    cedula: "V-22.111.333",
    nombres: "Martínez Lunar Daniela Paola",
    f_ingreso: "2024-02-01",
    estado_colaborador: "Activo",
    creado_por: "Ana Rodríguez",
    f_creacion: "2024-02-01",
    estado: "completo",
    departamento: "Recursos Humanos",
  },
  {
    id: 5,
    cedula: "V-04.555.777",
    nombres: "López Fuentes Andrés Eduardo",
    f_ingreso: "2020-11-15",
    estado_colaborador: "Suspendido",
    creado_por: "Carlos Méndez",
    f_creacion: "2020-11-15",
    estado: "vencido",
    departamento: "Comercial",
  },
];

/* ====== ALERTAS Y AUDITORÍA DE EXPEDIENTES ====== */
const ALERTAS_EXPEDIENTES = [
  {
    id: 101,
    titulo: "Expediente incompleto",
    usuario: "Pérez Gómez María Alejandra",
    detalle: "Falta documento de Cédula de Identidad actualizada",
    tipo: "warning",
    tiempo: "hace 2h",
  },
  {
    id: 102,
    titulo: "Documentación vencida",
    usuario: "López Fuentes Andrés Eduardo",
    detalle: "Certificado de salud vencido hace 15 días",
    tipo: "danger",
    tiempo: "hace 1d",
  },
  {
    id: 103,
    titulo: "Expediente actualizado",
    usuario: "García Márquez Carlos Eduardo",
    detalle: "Se adjuntó nuevo título universitario y síntesis curricular",
    tipo: "info",
    tiempo: "hace 3d",
  },
];

/* ====== CATÁLOGO DE SECCIONES / RUTA DE NAVEGACIÓN DE RRHH ====== */
const INITIAL_SECCIONES = [
  {
    id: "expedientes",
    nombre: "Expedientes Digitales",
    ic: "FiFolder",
    color: "#2f6fed",
    desc: "Gestión documental de colaboradores",
    opciones: [
      { id: "opt-1", opcion: "Ver Expedientes", ruta_opcion: "/rrhh/expedientes", ic: "FiFileText" },
      { id: "opt-2", opcion: "Carga Masiva", ruta_opcion: "/rrhh/carga-masiva", ic: "FiUploadCloud" },
    ],
  },
  {
    id: "licencias",
    nombre: "Licencias y Permisos",
    ic: "FiCalendar",
    color: "#1f9d63",
    desc: "Solicitudes y descansos médicos",
    opciones: [
      { id: "opt-3", opcion: "Solicitudes", ruta_opcion: "/rrhh/licencias/solicitudes", ic: "FiClock" },
      { id: "opt-4", opcion: "Aprobaciones", ruta_opcion: "/rrhh/licencias/aprobaciones", ic: "FiCheckSquare" },
    ],
  },
  {
    id: "evaluaciones",
    nombre: "Evaluaciones de Desempeño",
    ic: "FiAward",
    color: "#d8992a",
    desc: "Métricas y cumplimiento de objetivos",
    opciones: [
      { id: "opt-5", opcion: "Evaluaciones Anuales", ruta_opcion: "/rrhh/evaluaciones/anuales", ic: "FiTrendingUp" },
    ],
  },
  {
    id: "reportes",
    nombre: "Reportes e Indicadores",
    ic: "FiBarChart2",
    color: "#8155d8",
    desc: "Informes gerenciales y auditorías",
    opciones: [
      { id: "opt-6", opcion: "Reporte de Cumplimiento", ruta_opcion: "/rrhh/reportes/cumplimiento", ic: "FiPieChart" },
    ],
  },
];

/* ====== HELPER FUNCTIONS ====== */
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

/* ============================ DASHBOARD RRHH COMPONENT ============================ */
export default function DashboardRrhh() {
  const isDark = useIsDarkMode();
  const [empleados] = useState(DATOS_INICIALES);
  const [secciones, setSecciones] = useState(INITIAL_SECCIONES);
  const [modal, setModal] = useState(null);

  // Cálculos dinámicos de métricas (KPIs)
  const stats = useMemo(() => {
    const total = empleados.length;
    const completos = empleados.filter((e) => e.estado === "completo").length;
    const incompletos = empleados.filter((e) => e.estado === "incompleto").length;
    const vencidos = empleados.filter((e) => e.estado === "vencido").length;
    const activos = empleados.filter((e) => e.estado_colaborador === "Activo").length;
    return { total, completos, incompletos, vencidos, activos };
  }, [empleados]);

  // Obtener los últimos 5 expedientes registrados
  const ultimosExpedientes = useMemo(() => {
    return empleados
      .slice()
      .sort((a, b) => (b.f_creacion || "").localeCompare(a.f_creacion || ""))
      .slice(0, 5);
  }, [empleados]);

  const guardarOpcionSeccion = (seccionId, opcionData) => {
    setSecciones((prev) =>
      prev.map((s) => {
        if (s.id !== seccionId) return s;
        const opcionesActuales = s.opciones || [];
        const existe = opcionesActuales.some((o) => o.id === opcionData.id);

        let nuevasOpciones;
        if (existe) {
          nuevasOpciones = opcionesActuales.map((o) =>
            o.id === opcionData.id ? { ...o, ...opcionData } : o
          );
        } else {
          nuevasOpciones = [
            ...opcionesActuales,
            { ...opcionData, id: Date.now().toString() },
          ];
        }

        return { ...s, opciones: nuevasOpciones };
      })
    );
    setModal(null);
  };

  return (
    <SystemLayout identificacion="Recursos Humanos">
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
              Dashboard de Recursos Humanos
            </h2>
          </div>
        </div>

        {/* 1. TARJETAS DE MÉTRICAS GENERALES (KPIs) */}
        <div
          className="ma-stats"
          style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
        >
          <KPICard
            icon="FiUsers"
            val={stats.total}
            label="Total Expedientes"
            trend={`▲ ${stats.activos} activos`}
            trendColor="var(--merco-success, #16a34a)"
          />
          <KPICard
            icon="FiCheckCircle"
            val={stats.completos}
            label="Completos"
            trend="Documentación al día"
            trendColor="var(--merco-success, #16a34a)"
            iconColor="var(--merco-success, #16a34a)"
          />
          <KPICard
            icon="FiAlertTriangle"
            val={stats.incompletos}
            label="Incompletos"
            trend="▼ Pendiente recaudos"
            trendColor="var(--merco-warning, #d8992a)"
            iconColor="var(--merco-warning, #d8992a)"
          />
          <KPICard
            icon="FiClock"
            val={stats.vencidos}
            label="Vencidos"
            trend="Requieren renovación"
            trendColor="var(--merco-danger, #d1435b)"
            iconColor="var(--merco-danger, #d1435b)"
          />
          <KPICard
            icon="FiUserCheck"
            val={stats.activos}
            label="Colaboradores Activos"
            trend="Estatus operativo"
          />
        </div>

        {/* 2. FILA 1 DE GRÁFICOS: ESTADO DE EXPEDIENTES Y DISTRIBUCIÓN DE DEPARTAMENTOS */}
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
                Estado Global de Expedientes
              </span>{" "}
              <small style={{ color: "var(--merco-muted)" }}>
                revisión y auditoría documental
              </small>
            </div>
            <ChartBarExpedientes isDark={isDark} stats={stats} />
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
                Distribución por Departamento
              </span>
            </div>
            <ChartDoughnutDepartamentos isDark={isDark} empleados={empleados} />
          </div>
        </div>

        {/* 3. FILA 2: MATRIZ DE EXPEDIENTES RECIENTES Y ALERTAS DE DOCUMENTACIÓN */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* MATRIZ RESUMEN DE EXPEDIENTES RECIENTES */}
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
                  Últimos Expedientes Registrados
                </span>{" "}
                <small style={{ color: "var(--merco-muted)" }}>
                  ingresos y actualizaciones de personal
                </small>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => (window.location.href = "/rrhh/expedientes")}
              >
                Ver Expedientes
              </button>
            </div>

            <table className="ma-table">
              <thead>
                <tr>
                  <th>COLABORADOR</th>
                  <th>CÉDULA / REGISTRO</th>
                  <th>ESTADO COLABORADOR</th>
                  <th>EXPEDIENTE</th>
                </tr>
              </thead>
              <tbody>
                {ultimosExpedientes.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ padding: "10px 16px" }}>
                      <div className="ma-user-cell">
                        <div
                          className="ma-ava"
                          style={{ background: "var(--merco-navy, #0B1B32)" }}
                        >
                          {initials(emp.nombres)}
                        </div>
                        <div>
                          <b
                            style={{
                              color: "var(--merco-text)",
                              display: "block",
                            }}
                          >
                            {emp.nombres}
                          </b>
                          <small style={{ color: "var(--merco-muted)" }}>
                            Ingreso: {emp.f_ingreso}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <code style={{ fontSize: 12, color: "var(--merco-text)" }}>
                        {emp.cedula}
                      </code>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          background:
                            emp.estado_colaborador === "Activo"
                              ? "rgba(31, 157, 99, 0.15)"
                              : emp.estado_colaborador === "Inactivo"
                              ? "rgba(209, 67, 91, 0.15)"
                              : "rgba(216, 153, 42, 0.15)",
                          color:
                            emp.estado_colaborador === "Activo"
                              ? "#1f9d63"
                              : emp.estado_colaborador === "Inactivo"
                              ? "#d1435b"
                              : "#d8992a",
                        }}
                      >
                        ● {emp.estado_colaborador}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontWeight: 600,
                          textTransform: "capitalize",
                          background:
                            emp.estado === "completo"
                              ? "rgba(31, 157, 99, 0.15)"
                              : emp.estado === "incompleto"
                              ? "rgba(216, 153, 42, 0.15)"
                              : "rgba(209, 67, 91, 0.15)",
                          color:
                            emp.estado === "completo"
                              ? "#1f9d63"
                              : emp.estado === "incompleto"
                              ? "#d8992a"
                              : "#d1435b",
                        }}
                      >
                        {emp.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ALERTAS DE DOCUMENTACIÓN Y AUDITORÍA */}
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
                Alertas y Recaudos Vencidos
              </span>{" "}
              <small style={{ color: "var(--merco-muted)" }}>Auditoría RR.HH.</small>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ALERTAS_EXPEDIENTES.map((item) => (
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
                      border:
                        item.tipo === "danger"
                          ? "1px solid rgba(209, 67, 91, 0.4)"
                          : item.tipo === "warning"
                          ? "1px solid rgba(216, 153, 42, 0.4)"
                          : "1px solid rgba(47, 111, 237, 0.4)",
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
                    }}
                  >
                    <DynamicIcon
                      name={
                        item.tipo === "danger"
                          ? "FiAlertCircle"
                          : item.tipo === "warning"
                          ? "FiAlertTriangle"
                          : "FiInfo"
                      }
                      fallback="FiFile"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <b
                      style={{
                        fontSize: 13,
                        color: "var(--merco-text)",
                        display: "block",
                      }}
                    >
                      {item.titulo}
                    </b>
                    <small style={{ color: "var(--merco-muted)" }}>
                      {item.usuario} · {item.detalle}
                    </small>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <small style={{ color: "var(--merco-muted)" }}>
                      {item.tiempo}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. FILA 3: MÓDULOS DE RECURSOS HUMANOS Y RUTAS CONFIGURADAS */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div>
              <h3
                style={{ margin: 0, fontSize: 16, color: "var(--merco-text)" }}
              >
                Módulos de Recursos Humanos y Accesos
              </h3>
              <small style={{ color: "var(--merco-muted)" }}>
                Rutas de navegación activas
              </small>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => (window.location.href = "/rrhh/gestion")}
            >
              Gestionar Módulos ➔
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {secciones.map((sec) => (
              <div key={sec.id} className="ma-card" style={{ padding: 16 }}>
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
                      background: sec.color + "22",
                      color: sec.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    <DynamicIcon name={sec.ic} fallback="FiFolder" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <b style={{ color: "var(--merco-text)", fontSize: 14 }}>
                      {sec.nombre}
                    </b>
                    <small
                      style={{
                        display: "block",
                        color: "var(--merco-muted)",
                        fontSize: 11,
                      }}
                    >
                      {sec.desc}
                    </small>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px dashed var(--merco-border)",
                    paddingTop: 10,
                    marginTop: 8,
                  }}
                >
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
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--merco-muted)",
                      }}
                    >
                      RUTAS ({sec.opciones?.length || 0})
                    </span>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "0 6px", fontSize: 11 }}
                      onClick={() => setModal({ sistema: sec, data: null })}
                    >
                      + Añadir Ruta
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {sec.opciones && sec.opciones.length > 0 ? (
                      sec.opciones.map((opc) => (
                        <div
                          key={opc.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background:
                              "var(--merco-bg-subtle, rgba(255, 255, 255, 0.03))",
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontSize: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <DynamicIcon name={opc.ic} fallback="FiFolder" />
                            <span style={{ color: "var(--merco-text)" }}>
                              {opc.opcion}
                            </span>
                          </div>
                          <code
                            style={{
                              fontSize: 10,
                              color: "var(--merco-muted)",
                            }}
                          >
                            {opc.ruta_opcion}
                          </code>
                        </div>
                      ))
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--merco-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        Sin rutas asignadas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL PARA AGREGAR OPCIÓN / RUTA RÁPIDA */}
      {modal && (
        <ModalOpcionRapida
          sistema={modal.sistema}
          onSave={(opc) => guardarOpcionSeccion(modal.sistema.id, opc)}
          onClose={() => setModal(null)}
        />
      )}
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

/* ====== COMPONENTES DE GRÁFICOS (CHART.JS) ====== */

/* 1. Bar Chart: Resumen de Expedientes */
function ChartBarExpedientes({ isDark, stats }) {
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
        labels: ["Completos", "Incompletos", "Vencidos"],
        datasets: [
          {
            label: "Cantidad de Expedientes",
            data: [stats.completos, stats.incompletos, stats.vencidos],
            backgroundColor: ["#1f9d63", "#d8992a", "#d1435b"],
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: textColor, precision: 0 },
            grid: { color: gridColor },
          },
          y: { ticks: { color: textColor }, grid: { display: false } },
        },
        plugins: { legend: { display: false } },
      },
    });

    return () => chart.destroy();
  }, [isDark, stats]);

  return (
    <div style={{ height: 210 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/* 2. Doughnut Chart: Distribución por Departamento */
function ChartDoughnutDepartamentos({ isDark, empleados }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";

    const conteoDpto = {};
    empleados.forEach((emp) => {
      const dpto = emp.departamento || "Sin asignar";
      conteoDpto[dpto] = (conteoDpto[dpto] || 0) + 1;
    });

    const labels = Object.keys(conteoDpto);
    const data = Object.values(conteoDpto);

    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels.length ? labels : ["Sin asignación"],
        datasets: [
          {
            data: data.length ? data : [1],
            backgroundColor: [
              "#2f6fed",
              "#1f9d63",
              "#d8992a",
              "#8155d8",
              "#d1435b",
              "#0b2545",
            ],
            borderColor: isDark ? "#08192f" : "#FFFFFF",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: textColor, boxWidth: 12 },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [isDark, empleados]);

  return (
    <div style={{ height: 210 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/* ====== MODAL RÁPIDO PARA CREAR OPCIÓN / RUTA ====== */
function ModalOpcionRapida({ sistema, onSave, onClose }) {
  const [opcion, setOpcion] = useState("");
  const [ruta, setRuta] = useState("");
  const [ic, setIc] = useState("FiFolder");

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-modal-head">
          <h3>Nueva Ruta para {sistema?.nombre}</h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ma-modal-body">
          <div className="field">
            <label>Nombre de la Opción</label>
            <input
              value={opcion}
              onChange={(e) => setOpcion(e.target.value)}
              placeholder="ej. Reporte de Recaudos"
            />
          </div>
          <div className="field">
            <label>Ruta (URL)</label>
            <input
              value={ruta}
              onChange={(e) => setRuta(e.target.value)}
              placeholder="ej. /rrhh/reporte-recaudos"
            />
          </div>
          <div className="field">
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Seleccionar Ícono:
              <span style={{ fontSize: 18, display: "inline-flex" }}>
                <DynamicIcon name={ic} />
              </span>
            </label>
            <IconPicker value={ic} onChange={setIc} />
          </div>
        </div>
        <div className="ma-modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={!opcion || !ruta}
            onClick={() =>
              onSave({
                opcion,
                ruta_opcion: ruta,
                ic,
                tiene_permiso: true,
              })
            }
          >
            Guardar Ruta
          </button>
        </div>
      </div>
    </div>
  );
}