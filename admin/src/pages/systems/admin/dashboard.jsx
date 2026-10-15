import React from "react";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../../components/IconCatalog";
import { useDashboard } from "../admin/hooks/useDashboard";
import { useIsDarkMode } from "../admin/hooks/useIsDarkMode";
import {
  initials,
  KPICard,
  UltimosAccesosCard,
  ChartBarSistemas,
  ChartDoughnutRoles,
  ChartDoughnutDepartamentos,
  ModalOpcionRapida,
} from "../admin/components/DashboardComponents";

export default function DashboardSistemasUsuarios() {
  const isDark = useIsDarkMode();
  const {
    sistemas,
    usuarios,
    kpis,
    modal,
    setModal,
    toast,
    accessSearch,
    setAccessSearch,
    accessPage,
    setAccessPage,
    totalOpciones,
    totalUsuariosPendientes,
    filteredAccessUsuarios,
    totalAccessPages,
    paginatedAccessUsuarios,
    guardarOpcionSistema,
  } = useDashboard();

  return (
    <SystemLayout
      identificacion="Administración General"
      opcionMenu="Dashboard"
    >
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
        {/* TARJETAS DE MÉTRICAS GENERALES (KPIs) */}
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

        {/* FILA 1 DE GRÁFICOS */}
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
              </span>
            </div>
            <ChartBarSistemas isDark={isDark} />
          </div>
        </div>

        {/* SECCIÓN DE GRÁFICOS: ROLES Y DEPARTAMENTOS */}
        <div
          className="dashboard-grid-2col"
          style={{ marginBottom: "20px", marginTop: "20px" }}
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
                Distribución de usuarios por departamento
              </span>
              <small style={{ color: "var(--merco-muted)", display: "block" }}>
                Personal activo por área organizacional
              </small>
            </div>
            <ChartDoughnutDepartamentos usuarios={usuarios} isDark={isDark} />
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
            <ChartDoughnutRoles usuarios={usuarios} isDark={isDark} />
          </div>
        </div>

        {/* FILA 2: MATRIZ DE ACCESOS RÁPIDOS Y ÚLTIMOS ACCESOS */}
        <div className="dashboard-grid-2col">
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
                className="btn btn-accent btn-sm"
                onClick={() => (window.location.href = "/admin/permisos")}
              >
                Ver Usuarios
              </button>
            </div>

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
                              style={{
                                background: "var(--merco-navy, #0B1B32)",
                              }}
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
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                            }}
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

          <UltimosAccesosCard />
        </div>

        {/* CATÁLOGO DE SISTEMAS Y RUTAS */}
        <div style={{ marginBottom: 20, marginTop: 20 }}>
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
              className="btn btn-accent btn-sm"
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
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
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
