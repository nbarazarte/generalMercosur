import React, { useState, useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import SystemLayout from "../../layouts/SystemLayout";

/* IMPORTAMOS EL COMPONENTE DINÁMICO E ICON PICKER DE ÍCONOS */
import { DynamicIcon, IconPicker } from "../../components/IconCatalog";

/* ====== DATOS INICIALES DE SISTEMAS ====== */
const INITIAL_SISTEMAS = [
  {
    id: "adminmep",
    nombre: "Admin MEP",
    ic: "FiSettings",
    color: "#2f6fed",
    desc: "Configuración del sistema central",
    opciones: [
      {
        id: "opt-1",
        opcion: "Parámetros Generales",
        ruta_opcion: "/admin/config",
        ic: "FiSliders",
      },
      {
        id: "opt-2",
        opcion: "Auditoría de Logs",
        ruta_opcion: "/admin/logs",
        ic: "FiActivity",
      },
      {
        id: "opt-3",
        opcion: "Mantenimiento",
        ruta_opcion: "/admin/mantenimiento",
        ic: "FiTool",
      },
    ],
  },
  {
    id: "rrhh",
    nombre: "Recursos Humanos",
    ic: "FiUsers",
    color: "#1f9d63",
    desc: "Ficha de empleado y licencias",
    opciones: [
      {
        id: "opt-4",
        opcion: "Fichas de Empleados",
        ruta_opcion: "/rrhh/empleados",
        ic: "FiFolder",
      },
      {
        id: "opt-5",
        opcion: "Solicitudes de Licencia",
        ruta_opcion: "/rrhh/licencias",
        ic: "FiCalendar",
      },
    ],
  },
  {
    id: "tickets",
    nombre: "Sistema Tickets",
    ic: "FiHeadphones",
    color: "#d8992a",
    desc: "Centraliza tus tickets e incidencias",
    opciones: [
      {
        id: "opt-6",
        opcion: "Mesa de Ayuda",
        ruta_opcion: "/tickets/mesa",
        ic: "FiHelpCircle",
      },
      {
        id: "opt-7",
        opcion: "Mis Tickets",
        ruta_opcion: "/tickets/mis-tickets",
        ic: "FiCheckSquare",
      },
    ],
  },
  {
    id: "kb",
    nombre: "Base de Conocimiento",
    ic: "FiBook",
    color: "#8155d8",
    desc: "Información y documentación",
    opciones: [
      {
        id: "opt-8",
        opcion: "Artículos",
        ruta_opcion: "/kb/articulos",
        ic: "FiFileText",
      },
      {
        id: "opt-9",
        opcion: "Categorías",
        ruta_opcion: "/kb/categorias",
        ic: "FiLayers",
      },
    ],
  },
];

/* ====== ROLES DEFINIDOS ====== */
const ROLES = [
  { id: 1, nombre: "Administrador", color: "#0b2545" },
  { id: 2, nombre: "Supervisor", color: "#2f6fed" },
  { id: 3, nombre: "Operador MEP", color: "#123a63" },
  { id: 4, nombre: "Gestor RR.HH.", color: "#1f9d63" },
  { id: 5, nombre: "Empleado", color: "#0f7a4c" },
  { id: 6, nombre: "Agente de Soporte", color: "#d8992a" },
  { id: 7, nombre: "Editor de Contenido", color: "#8155d8" },
  { id: 8, nombre: "Solo Lectura", color: "#69748c" },
];

/* ====== USUARIOS Y SUS ACCESOS ====== */
const INITIAL_USUARIOS = [
  {
    id: 1,
    nombre: "María González",
    email: "m.gonzalez@mercosur.com.py",
    estado: "active",
    ultimo: "Hoy, 09:14",
    accesos: {
      adminmep: "Administrador",
      rrhh: "Supervisor",
      tickets: "Supervisor",
      kb: "Administrador",
    },
  },
  {
    id: 2,
    nombre: "Carlos Benítez",
    email: "c.benitez@mercosur.com.py",
    estado: "active",
    ultimo: "Hoy, 08:02",
    accesos: { adminmep: "Operador MEP", tickets: "Agente de Soporte" },
  },
  {
    id: 3,
    nombre: "Lucía Fernández",
    email: "l.fernandez@mercosur.com.py",
    estado: "active",
    ultimo: "Ayer, 17:45",
    accesos: { rrhh: "Gestor RR.HH.", tickets: "Supervisor" },
  },
  {
    id: 4,
    nombre: "Roberto Díaz",
    email: "r.diaz@mercosur.com.py",
    estado: "pending",
    ultimo: "—",
    accesos: { rrhh: "Empleado", kb: "Solo Lectura" },
  },
  {
    id: 5,
    nombre: "Ana Villalba",
    email: "a.villalba@mercosur.com.py",
    estado: "active",
    ultimo: "Hoy, 10:31",
    accesos: { kb: "Editor de Contenido", rrhh: "Empleado" },
  },
  {
    id: 6,
    nombre: "Jorge Ramírez",
    email: "j.ramirez@mercosur.com.py",
    estado: "inactive",
    ultimo: "12/09/2026",
    accesos: { adminmep: "Solo Lectura" },
  },
];

/* ====== ALERTAS DE SEGURIDAD / ACCESOS ====== */
const ALERTAS_ACCESOS = [
  {
    id: 101,
    titulo: "Alta pendiente de aprobación",
    usuario: "Roberto Díaz",
    detalle: "Solicitó rol 'Empleado' en Recursos Humanos",
    tipo: "warning",
    tiempo: "hace 2h",
  },
  {
    id: 102,
    titulo: "Usuario inactivo con accesos",
    usuario: "Jorge Ramírez",
    detalle: "Cuenta inactiva conserva rol en Admin MEP",
    tipo: "danger",
    tiempo: "hace 1d",
  },
  {
    id: 103,
    titulo: "Asignación de SuperAdmin",
    usuario: "María González",
    detalle: "Modificó permisos en el módulo Base de Conocimiento",
    tipo: "info",
    tiempo: "hace 3d",
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

/* ============================ DASHBOARD COMPONENT ============================ */
export default function DashboardSistemasUsuarios() {
  const isDark = useIsDarkMode();
  const [sistemas, setSistemas] = useState(INITIAL_SISTEMAS);
  const [usuarios, setUsuarios] = useState(INITIAL_USUARIOS);
  const [modal, setModal] = useState(null);

  // Cálculos dinámicos
  const totalOpciones = useMemo(
    () => sistemas.reduce((acc, sys) => acc + (sys.opciones?.length || 0), 0),
    [sistemas],
  );

  const totalUsuariosActivos = useMemo(
    () => usuarios.filter((u) => u.estado === "active").length,
    [usuarios],
  );

  const totalUsuariosPendientes = useMemo(
    () => usuarios.filter((u) => u.estado === "pending").length,
    [usuarios],
  );

  // Cambio dinámico de matriz
  const handleAccesoChange = (userId, sysId, rol) => {
    setUsuarios((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const accesos = { ...u.accesos };
        if (rol) accesos[sysId] = rol;
        else delete accesos[sysId];
        return { ...u, accesos };
      }),
    );
  };

  const guardarOpcionSistema = (sistemaId, opcionData) => {
    setSistemas((prev) =>
      prev.map((s) => {
        if (s.id !== sistemaId) return s;
        const opcionesActuales = s.opciones || [];
        const existe = opcionesActuales.some((o) => o.id === opcionData.id);

        let nuevasOpciones;
        if (existe) {
          nuevasOpciones = opcionesActuales.map((o) =>
            o.id === opcionData.id ? { ...o, ...opcionData } : o,
          );
        } else {
          nuevasOpciones = [
            ...opcionesActuales,
            { ...opcionData, id: Date.now().toString() },
          ];
        }

        return { ...s, opciones: nuevasOpciones };
      }),
    );
    setModal(null);
  };

  return (
    <SystemLayout identificacion="Administración General">
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
              Dashboard
            </h2>
          </div>
        </div>

        {/* 1. TARJETAS DE MÉTRICAS GENERALES (KPIs) */}
        <div
          className="ma-stats"
          style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
        >
          <KPICard
            icon="FiGrid"
            val={sistemas.length}
            label="Sistemas Registrados"
            trend="▲ Módulos activos"
            trendColor="var(--merco-success, #16a34a)"
          />
          <KPICard
            icon="FiLayers"
            val={totalOpciones}
            label="Rutas / Opciones"
            trend="Rutas de menú"
          />
          <KPICard
            icon="FiUsers"
            val={usuarios.length}
            label="Usuarios Totales"
            trend={`▲ ${totalUsuariosActivos} activos`}
            trendColor="var(--merco-success, #16a34a)"
          />
          <KPICard
            icon="FiShield"
            val={ROLES.length}
            label="Roles Definidos"
            trend="Matriz global"
          />
          <KPICard
            icon="FiUserCheck"
            val={totalUsuariosPendientes}
            label="Altas Pendientes"
            trend={
              totalUsuariosPendientes > 0 ? "▼ Requieren revisión" : "✔ Al día"
            }
            trendColor={
              totalUsuariosPendientes > 0
                ? "var(--merco-warning, #d8992a)"
                : "var(--merco-success, #16a34a)"
            }
            iconColor={
              totalUsuariosPendientes > 0
                ? "var(--merco-warning, #d8992a)"
                : "var(--merco-muted)"
            }
          />
        </div>

        {/* 2. FILA 1 DE GRÁFICOS: ACCESOS POR SISTEMA Y DISTRIBUCIÓN DE ROLES */}
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
                Usuarios asignados por sistema
              </span>{" "}
              <small style={{ color: "var(--merco-muted)" }}>
                cobertura de licencias
              </small>
            </div>
            <ChartBarSistemas
              isDark={isDark}
              sistemas={sistemas}
              usuarios={usuarios}
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
                Distribución de roles
              </span>
            </div>
            <ChartDoughnutRoles isDark={isDark} usuarios={usuarios} />
          </div>
        </div>

        {/* 3. FILA 2: MATRIZ DE ACCESOS RÁPIDOS Y ALERTAS DE SEGURIDAD */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* MATRIZ RESUMEN DE USUARIOS Y ACCESOS */}
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
                  Gestión Rápida de Accesos
                </span>{" "}
                <small style={{ color: "var(--merco-muted)" }}>
                  matriz de permisos por usuario
                </small>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => (window.location.href = "/usuarios-accesos")}
              >
                Ver Usuarios
              </button>
            </div>

            <table className="ma-table">
              <thead>
                <tr>
                  <th>USUARIO</th>
                  <th>ESTADO</th>
                  <th>ACCESOS CONFIGURADOS</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.slice(0, 5).map((u) => (
                  <tr key={u.id}>
                    <td style={{ padding: "10px 16px" }}>
                      <div className="ma-user-cell">
                        <div
                          className="ma-ava"
                          style={{ background: "var(--merco-navy, #0B1B32)" }}
                        >
                          {initials(u.nombre)}
                        </div>
                        <div>
                          <b
                            style={{
                              color: "var(--merco-text)",
                              display: "block",
                            }}
                          >
                            {u.nombre}
                          </b>
                          <small style={{ color: "var(--merco-muted)" }}>
                            {u.email}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          background:
                            u.estado === "active"
                              ? "rgba(31, 157, 99, 0.15)"
                              : u.estado === "pending"
                                ? "rgba(216, 153, 42, 0.15)"
                                : "rgba(209, 67, 91, 0.15)",
                          color:
                            u.estado === "active"
                              ? "#1f9d63"
                              : u.estado === "pending"
                                ? "#d8992a"
                                : "#d1435b",
                        }}
                      >
                        ●{" "}
                        {u.estado === "active"
                          ? "Activo"
                          : u.estado === "pending"
                            ? "Pendiente"
                            : "Inactivo"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        {sistemas.map((sys) => {
                          const rolActual = u.accesos[sys.id] || "";
                          return (
                            <span
                              key={sys.id}
                              style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                borderRadius: 4,
                                border: rolActual
                                  ? `1px solid ${sys.color}66`
                                  : "1px solid var(--merco-border, #444)",
                                background: rolActual
                                  ? `${sys.color}15`
                                  : "transparent",
                                color: rolActual
                                  ? "var(--merco-text)"
                                  : "var(--merco-muted)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <DynamicIcon name={sys.ic} fallback="FiGrid" />
                              <b>{sys.nombre}:</b> {rolActual || "Sin acceso"}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ALERTAS DE SEGURIDAD Y AUDITORÍA DE ACCESOS */}
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
                Alertas de Accesos y Seguridad
              </span>{" "}
              <small style={{ color: "var(--merco-muted)" }}>Auditoría</small>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ALERTAS_ACCESOS.map((item) => (
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
                          ? "FiLock"
                          : item.tipo === "warning"
                            ? "FiAlertTriangle"
                            : "FiInfo"
                      }
                      fallback="FiShield"
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

        {/* 4. FILA 3: CATÁLOGO DE SISTEMAS Y RUTAS CONFIGURADAS */}
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
                Módulos de Sistemas y Opciones
              </h3>
              <small style={{ color: "var(--merco-muted)" }}>
                Rutas de navegación activas
              </small>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => (window.location.href = "/sistemas")}
            >
              Gestionar Sistemas ➔
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {sistemas.map((sys) => (
              <div key={sys.id} className="ma-card" style={{ padding: 16 }}>
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
                      background: sys.color + "22",
                      color: sys.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    <DynamicIcon name={sys.ic} fallback="FiGrid" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <b style={{ color: "var(--merco-text)", fontSize: 14 }}>
                      {sys.nombre}
                    </b>
                    <small
                      style={{
                        display: "block",
                        color: "var(--merco-muted)",
                        fontSize: 11,
                      }}
                    >
                      {sys.desc}
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
                      OPCIONES ({sys.opciones?.length || 0})
                    </span>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "0 6px", fontSize: 11 }}
                      onClick={() => setModal({ sistema: sys, data: null })}
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
                    {sys.opciones && sys.opciones.length > 0 ? (
                      sys.opciones.map((opc) => (
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
          onSave={(opc) => guardarOpcionSistema(modal.sistema.id, opc)}
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

/* 1. Bar Chart: Usuarios por Sistema */
function ChartBarSistemas({ isDark, sistemas, usuarios }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)";

    // Conteo de usuarios con rol en cada sistema
    const labels = sistemas.map((s) => s.nombre);
    const data = sistemas.map((sys) => {
      return usuarios.filter((u) => !!u.accesos[sys.id]).length;
    });
    const colors = sistemas.map((s) => s.color);

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Usuarios con Acceso",
            data: data,
            backgroundColor: colors,
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
  }, [isDark, sistemas, usuarios]);

  return (
    <div style={{ height: 210 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/* 2. Doughnut Chart: Distribución de Roles */
function ChartDoughnutRoles({ isDark, usuarios }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";

    // Contar concurrencia de cada nombre de rol asignado
    const conteoRoles = {};
    usuarios.forEach((u) => {
      Object.values(u.accesos).forEach((rolNombre) => {
        conteoRoles[rolNombre] = (conteoRoles[rolNombre] || 0) + 1;
      });
    });

    const labels = Object.keys(conteoRoles);
    const data = Object.values(conteoRoles);

    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels.length ? labels : ["Sin asignación"],
        datasets: [
          {
            data: data.length ? data : [1],
            backgroundColor: [
              "#0b2545",
              "#2f6fed",
              "#123a63",
              "#1f9d63",
              "#0f7a4c",
              "#d8992a",
              "#8155d8",
              "#69748c",
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
  }, [isDark, usuarios]);

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
  const [ic, setIc] = useState("FiGrid");

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
              placeholder="ej. Reporte de Accesos"
            />
          </div>
          <div className="field">
            <label>Ruta (URL)</label>
            <input
              value={ruta}
              onChange={(e) => setRuta(e.target.value)}
              placeholder="ej. /admin/reportes-accesos"
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
