import React, { useState, useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon, IconPicker } from "../../components/IconCatalog";
import axios from "axios";

const API_URL = import.meta.env.VITE_URL_API_ADMIN;
const API_TOKEN = import.meta.env.VITE_TOKEN;

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
  const [sistemas, setSistemas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [kpis, setKpis] = useState({
    total_sistemas: 0,
    total_opciones: 0,
    total_usuarios: 0,
    total_usuarios_activos: 0,
    total_usuarios_inactivos: 0,
    total_roles: 0,
  });
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [flag, setFlag] = useState(false);

  // Estados para búsqueda y paginación de la Matriz de Accesos Rápidos
  const [accessSearch, setAccessSearch] = useState("");
  const [accessPage, setAccessPage] = useState(1);
  const itemsPerPage = 5;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSistemas, resUsuarios, resKpis] = await Promise.all([
          axios.get(`${API_URL}/fetchSistemas`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
          }),
          axios.get(`${API_URL}/fetchUsuarios`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
          }),
          axios
            .get(`${API_URL}/dashboard/kpis`, {
              headers: { Authorization: `Bearer ${API_TOKEN}` },
            })
            .catch(() => ({ data: { data: {} } })),
        ]);

        const dataArray = Array.isArray(resSistemas.data)
          ? resSistemas.data
          : Array.isArray(resSistemas.data?.data)
            ? resSistemas.data.data
            : resSistemas.data?.sistemas || [];

        setSistemas(dataArray);
        setUsuarios(resUsuarios.data || []);
        if (resKpis.data?.data) {
          setKpis(resKpis.data.data);
        } else if (resKpis.data) {
          setKpis(resKpis.data);
        }
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
        showToast("Error al obtener los datos del sistema.", "error");
      }
    };

    fetchData();
  }, [flag]);

  const totalOpciones = useMemo(
    () => sistemas.reduce((acc, sys) => acc + (sys.opciones?.length || 0), 0),
    [sistemas],
  );

  const totalUsuariosPendientes = useMemo(
    () => usuarios.filter((u) => u.estado === "pending").length,
    [usuarios],
  );

  // Filtrado y Paginación de Usuarios para la Matriz de Accesos
  const filteredAccessUsuarios = useMemo(() => {
    if (!accessSearch.trim()) return usuarios;
    const query = accessSearch.toLowerCase();
    return usuarios.filter(
      (u) =>
        (u.nombre && u.nombre.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)),
    );
  }, [usuarios, accessSearch]);

  const totalAccessPages =
    Math.ceil(filteredAccessUsuarios.length / itemsPerPage) || 1;

  const paginatedAccessUsuarios = useMemo(() => {
    const start = (accessPage - 1) * itemsPerPage;
    return filteredAccessUsuarios.slice(start, start + itemsPerPage);
  }, [filteredAccessUsuarios, accessPage]);

  const guardarOpcionSistema = async (sistemaId, opcionData) => {
    try {
      const response = await axios.post(
        `${API_URL}/guardarOpcion`,
        { sistemaId, ...opcionData },
        { headers: { Authorization: `Bearer ${API_TOKEN}` } },
      );
      showToast(
        response.data?.message || "Ruta guardada correctamente.",
        "success",
      );
      setFlag(!flag);
      setModal(null);
    } catch (err) {
      console.error("Error al guardar opción:", err);
      const msg = err.response?.data?.error || err.message;
      showToast(`Error al guardar opción: ${msg}`, "error");
    }
  };

  return (
    <SystemLayout identificacion="Administración General">
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "#ffffff",
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          <span>{toast.message}</span>
        </div>
      )}

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
        <div className="ma-stats">
          <KPICard
            icon="FiGrid"
            val={kpis.total_sistemas || sistemas.length}
            label="Sistemas Registrados"
            trend="▲ Módulos activos"
            trendColor="var(--merco-success, #16a34a)"
          />
          <KPICard
            icon="FiLayers"
            val={kpis.total_opciones || totalOpciones}
            label="Rutas / Opciones"
            trend="Rutas de menú"
          />
          <KPICard
            icon="FiUsers"
            val={kpis.total_usuarios || usuarios.length}
            label="Usuarios Totales"
            trend={`▲ ${kpis.total_usuarios_activos || usuarios.filter((u) => u.estado === "active").length} activos`}
            trendColor="var(--merco-success, #16a34a)"
          />
          <KPICard
            icon="FiShield"
            val={kpis.total_roles || 8}
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
        <div className="dashboard-grid-1col">
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
            </div>
            <ChartBarSistemas isDark={isDark} />
          </div>
        </div>

        {/* SECCIÓN DE GRÁFICOS: ROLES Y DEPARTAMENTOS (DOS COLUMNAS) */}
        <div
          className="dashboard-grid-2col"
          style={{ marginBottom: "20px", marginTop: "20px" }}
        >
          {/* Tarjeta 2: Distribución de Usuarios por Departamento */}
          <div className="ma-card" style={{ padding: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  color: "var(--merco-text)",
                }}
              >
                Distribución de usuarios por departamento
              </span>
              <small style={{ color: "var(--merco-muted)", display: "block" }}>
                Personal activo por área organizacional
              </small>
            </div>
            <ChartDoughnutDepartamentos usuarios={usuarios} isDark={isDark} />
          </div>

          {/* Tarjeta 1: Distribución de Roles */}
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
            <ChartDoughnutRoles usuarios={usuarios} isDark={isDark} />
          </div>
        </div>

        {/* 3. FILA 2: MATRIZ DE ACCESOS RÁPIDOS Y ÚLTIMOS ACCESOS */}
        <div className="dashboard-grid-2col">
          {/* MATRIZ RESUMEN DE USUARIOS Y ACCESOS */}
          <div className="ma-card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
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
                onClick={() => (window.location.href = "/admin/permisos")}
              >
                Ver Usuarios
              </button>
            </div>

            {/* BUSCADOR DE USUARIOS PARA LA MATRIZ */}
            <div
              style={{
                padding: "10px 20px",
                borderTop: "1px solid var(--merco-border)",
                borderBottom: "1px solid var(--merco-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
                background: "var(--merco-bg-subtle, rgba(255, 255, 255, 0.01))",
              }}
            >
              <div style={{ flex: 1, minWidth: "200px" }}>
                <input
                  type="text"
                  placeholder="Buscar usuario por nombre o correo..."
                  value={accessSearch}
                  onChange={(e) => {
                    setAccessSearch(e.target.value);
                    setAccessPage(1);
                  }}
                  style={{
                    width: "100%",
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--merco-border)",
                    background: "var(--merco-bg)",
                    color: "var(--merco-text)",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ fontSize: 12, color: "var(--merco-muted)" }}>
                Mostrando {paginatedAccessUsuarios.length} de{" "}
                {filteredAccessUsuarios.length} registros
              </div>
            </div>

            <div className="ma-table-container">
              <table className="ma-table">
                <thead>
                  <tr>
                    <th>USUARIO</th>
                    <th style={{ width: "160px" }}>ESTADO</th>
                    <th>ACCESOS CONFIGURADOS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAccessUsuarios.length > 0 ? (
                    paginatedAccessUsuarios.map((u) => (
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
                            {sistemas.filter(
                              (sys) => u.accesos && u.accesos[sys.id],
                            ).length > 0 ? (
                              sistemas
                                .filter((sys) => u.accesos && u.accesos[sys.id])
                                .map((sys) => {
                                  const rolActual = u.accesos[sys.id];
                                  return (
                                    <span
                                      key={sys.id}
                                      style={{
                                        fontSize: 11,
                                        padding: "2px 8px",
                                        borderRadius: 4,
                                        border: `1px solid ${sys.color}66`,
                                        background: `${sys.color}15`,
                                        color: "var(--merco-text)",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                      }}
                                    >
                                      <DynamicIcon
                                        name={sys.ic}
                                        fallback="FiGrid"
                                      />
                                      <b>{sys.nombre}:</b> {rolActual}
                                    </span>
                                  );
                                })
                            ) : (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "var(--merco-muted)",
                                  fontStyle: "italic",
                                }}
                              >
                                Sin accesos configurados
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          textAlign: "center",
                          padding: "24px",
                          color: "var(--merco-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        No se encontraron usuarios que coincidan con la
                        búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* CONTROLES DE PAGINACIÓN */}
            {totalAccessPages > 1 && (
              <div
                style={{
                  padding: "12px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--merco-border)",
                  fontSize: 13,
                }}
              >
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={accessPage === 1}
                  onClick={() => setAccessPage((p) => Math.max(p - 1, 1))}
                >
                  Anterior
                </button>
                <span style={{ color: "var(--merco-muted)" }}>
                  Página {accessPage} de {totalAccessPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={accessPage === totalAccessPages}
                  onClick={() =>
                    setAccessPage((p) => Math.min(p + 1, totalAccessPages))
                  }
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>

          {/* ÚLTIMOS ACCESOS DE USUARIOS (DESDE LA BASE DE DATOS) */}
          <UltimosAccesosCard isDark={isDark} />
        </div>

        {/* 4. FILA 3: CATÁLOGO DE SISTEMAS Y RUTAS CONFIGURADAS */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
              flexWrap: "wrap",
              gap: 10,
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
              onClick={() => (window.location.href = "/admin/sistemas")}
            >
              Gestionar Sistemas
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
                      background: (sys.color || "#2f6fed") + "22",
                      color: sys.color || "#2f6fed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    <DynamicIcon name={sys.ic || sys.icono} fallback="FiGrid" />
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
                      {sys.nombre}
                    </b>
                    <small
                      style={{
                        display: "block",
                        color: "var(--merco-muted)",
                        fontSize: 11,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
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
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              minWidth: 0,
                            }}
                          >
                            <DynamicIcon
                              name={opc.ic || opc.opcion_icono}
                              fallback="FiFolder"
                            />
                            <span
                              style={{
                                color: "var(--merco-text)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {opc.opcion}
                            </span>
                          </div>
                          <code
                            style={{
                              fontSize: 10,
                              color: "var(--merco-muted)",
                              flexShrink: 0,
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

/* ====== COMPONENTE DE ÚLTIMOS ACCESOS DE USUARIOS DESDE LA BD ====== */
function UltimosAccesosCard({ isDark }) {
  const [accesos, setAccesos] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/dashboard/ultimos-accesos`, {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      })
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setAccesos(data);
      })
      .catch((err) => console.error("Error al obtener últimos accesos:", err));
  }, []);

  return (
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
          Últimos Accesos de Usuarios
        </span>{" "}
        <small style={{ color: "var(--merco-muted)" }}>
          Auditoría (Base de Datos)
        </small>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxHeight: 240,
          overflowY: "auto",
        }}
      >
        {accesos.length > 0 ? (
          accesos.map((item) => (
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
                  border: "1px solid rgba(31, 157, 99, 0.4)",
                  background: "rgba(31, 157, 99, 0.12)",
                  color: "#1F9D63",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                <DynamicIcon name="FiUserCheck" fallback="FiUser" />
              </div>
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
                  {item.usuario}
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
                  {item.email} · {item.detalle}
                </small>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <small style={{ color: "var(--merco-muted)" }}>
                  {item.tiempo}
                </small>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              color: "var(--merco-muted)",
              fontSize: 13,
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            No hay registros de accesos recientes en la base de datos.
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== COMPONENTES DE GRÁFICOS (CHART.JS CON AXIOS) ====== */

/* 1. Bar Chart: Usuarios por Sistema */
function ChartBarSistemas({ isDark }) {
  const canvasRef = useRef(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/usuarios-por-sistema`, {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      })
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setChartData(data);
      })
      .catch((err) =>
        console.error("Error al obtener usuarios por sistema:", err),
      );
  }, []);

  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)";

    const labels = chartData.map((s) => s.nombre);
    const data = chartData.map((s) => s.total_usuarios);
    const colors = chartData.map((s) => s.color || "#2f6fed");

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
  }, [isDark, chartData]);

  return (
    <div style={{ position: "relative", width: "100%", height: 210 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/* 2. Doughnut Chart: Distribución de Roles por Usuario Único */
function ChartDoughnutRoles({ usuarios, isDark }) {
  const canvasRef = useRef(null);

  const roleData = useMemo(() => {
    const conteo = {};
    usuarios.forEach((u) => {
      if (u.accesos) {
        const rolesUnicosDelUsuario = new Set(
          Object.values(u.accesos).filter((r) => r && r.trim() !== ""),
        );

        rolesUnicosDelUsuario.forEach((rolNombre) => {
          conteo[rolNombre] = (conteo[rolNombre] || 0) + 1;
        });
      }
    });

    return Object.keys(conteo).map((nombre) => ({
      nombre,
      total_asignaciones: conteo[nombre],
    }));
  }, [usuarios]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";

    const labels = roleData.map((r) => r.nombre);
    const data = roleData.map((r) => r.total_asignaciones);

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
  }, [isDark, roleData]);

  return (
    <div style={{ position: "relative", width: "100%", height: 210 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/* ==========================================================
   GRÁFICO: DISTRIBUCIÓN DE USUARIOS POR DEPARTAMENTO
   ========================================================== */
function ChartDoughnutDepartamentos({ usuarios, isDark }) {
  const canvasRef = useRef(null);

  const deptoData = useMemo(() => {
    const conteo = {};
    if (Array.isArray(usuarios)) {
      usuarios.forEach((u) => {
        const depto =
          u.departamento || u.departamento_nombre || "Sin departamento";
        conteo[depto] = (conteo[depto] || 0) + 1;
      });
    }

    return Object.keys(conteo).map((nombre) => ({
      nombre,
      total: conteo[nombre],
    }));
  }, [usuarios]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";

    const labels = deptoData.map((d) => d.nombre);
    const data = deptoData.map((d) => d.total);

    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels.length ? labels : ["Sin datos"],
        datasets: [
          {
            data: data.length ? data : [1],
            backgroundColor: [
              "#2f6fed",
              "#1f9d63",
              "#d8992a",
              "#ee176d",
              "#8155d8",
              "#0b2545",
              "#123a63",
              "#0f7a4c",
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
  }, [isDark, deptoData]);

  return (
    <div style={{ position: "relative", width: "100%", height: 210 }}>
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