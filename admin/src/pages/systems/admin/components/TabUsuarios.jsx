import React, { useState, useMemo } from "react";
import { DynamicIcon } from "../../../../components/IconCatalog";

const AVA_COLORS = [
  "#0b2545",
  "#2f6fed",
  "#1f9d63",
  "#d8992a",
  "#8155d8",
  "#d1435b",
  "#a8863f",
];
const avaColor = (n) => AVA_COLORS[(n?.charCodeAt(0) || 0) % AVA_COLORS.length];
const iniciales = (n) =>
  n
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const ESTADOS = {
  active: ["Activo", "badge-active"],
  inactive: ["Inactivo", "badge-inactive"],
  pending: ["Pendiente", "badge-pending"],
};

function AccesosChips({ accesos, sysMap }) {
  const ids = Object.keys(accesos || {});
  if (!ids.length) return <span className="access-chip none">Sin accesos</span>;
  return ids.map((sid) => {
    const s = sysMap[sid] || sysMap[Number(sid)] || sysMap[String(sid)];
    if (!s) return null;
    return (
      <span className="access-chip" key={sid}>
        <span
          className="ci"
          style={{
            background: s.color || "#2f6fed",
            color: "#ffffff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 20,
            height: 20,
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          <DynamicIcon name={s.ic || "FiGrid"} fallback="FiGrid" />
        </span>
        {s.nombre} · <span className="role">{accesos[sid]}</span>
      </span>
    );
  });
}

export default function TabUsuariosYAccesos({
  usuariosPaginados,
  usuariosFiltradosLength,
  rolesDeSistema,
  sistemas,
  setAccesoMatriz,
  setModal,
  paginaActual,
  setPaginaActual,
  porPagina,
  setPorPagina,
  totalPaginas,
}) {
  const [expandidos, setExpandidos] = useState({});

  const sistemaMap = useMemo(() => {
    return Object.fromEntries(sistemas.map((s) => [s.id, s]));
  }, [sistemas]);

  const toggleExpandir = (id) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const registroInicio =
    usuariosFiltradosLength === 0 ? 0 : (paginaActual - 1) * porPagina + 1;
  const registroFin = Math.min(
    paginaActual * porPagina,
    usuariosFiltradosLength,
  );

  return (
    <div
      className="ma-card"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div style={{ overflowX: "auto" }}>
        <table className="ma-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>Usuario</th>
              <th>Accesos por sistema</th>
              <th>Estado</th>
              <th>Último acceso</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosPaginados.map((u) => {
              const estaAbierto = !!expandidos[u.id];

              return (
                <React.Fragment key={u.id}>
                  <tr
                    style={{ borderBottom: estaAbierto ? "none" : undefined }}
                  >
                    <td style={{ textAlign: "center", paddingRight: 0 }}>
                      <button
                        className="btn-icon"
                        onClick={() => toggleExpandir(u.id)}
                        title={
                          estaAbierto
                            ? "Ocultar gestión de accesos"
                            : "Gestionar accesos"
                        }
                        style={{
                          transform: estaAbierto
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        <DynamicIcon name="FiArrowRight" />
                      </button>
                    </td>
                    <td>
                      <div className="ma-user-cell">
                        <div
                          className="ma-ava"
                          style={{ background: avaColor(u.nombre) }}
                        >
                          {iniciales(u.nombre)}
                        </div>
                        <div>
                          <b>{u.nombre}</b>
                          <small>{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        <AccesosChips accesos={u.accesos} sysMap={sistemaMap} />
                      </div>
                    </td>
                    <td>
                      <span className={"badge " + ESTADOS[u.estado][1]}>
                        {ESTADOS[u.estado][0]}
                      </span>
                    </td>
                    <td style={{ color: "var(--merco-muted)", fontSize: 13 }}>
                      {u.ultimo ||
                        (u.fec_ultimo_acceso
                          ? new Date(u.fec_ultimo_acceso).toLocaleString()
                          : "—")}
                    </td>
                    <td>
                      <div className="ma-actions">
                        <button
                          className="btn-icon"
                          title="Editar usuario"
                          onClick={() => setModal({ tipo: "usuario", data: u })}
                        >
                          <DynamicIcon name="FiEdit" />
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Eliminar usuario"
                          onClick={() => setModal({ tipo: "usuario", data: u })}
                        >
                          <DynamicIcon name="FiTrash2" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {estaAbierto && (
                    <tr
                      style={{
                        background:
                          "var(--merco-bg-subtle, rgba(255, 255, 255, 0.02))",
                      }}
                    >
                      <td
                        colSpan={6}
                        style={{ padding: "12px 20px 20px 48px" }}
                      >
                        <div
                          style={{
                            padding: 16,
                            borderRadius: 8,
                            border: "1px solid var(--merco-border, #333)",
                            background: "var(--merco-bg, #1a1a1a)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 13,
                              fontWeight: 600,
                              marginBottom: 12,
                              color: "var(--merco-muted)",
                            }}
                          >
                            <DynamicIcon name="FiSettings" />
                            <span>
                              Configuración rápida de roles para {u.nombre}:
                            </span>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fill, minmax(260px, 1fr))",
                              gap: 12,
                            }}
                          >
                            {sistemas.map((s, index) => {
                              const rolActual =
                                u.accesos[s.id] ||
                                u.accesos[String(s.id)] ||
                                u.accesos[Number(s.id)] ||
                                "";
                              const rolesPermitidos = rolesDeSistema(s.id);

                              return (
                                <div
                                  key={s.id ? `${s.id}-${index}` : index}
                                  style={{
                                    padding: "10px 12px",
                                    borderRadius: 6,
                                    border: rolActual
                                      ? `1px solid ${s.color || "#2f6fed"}66`
                                      : "1px solid var(--merco-border, #333)",
                                    background: rolActual
                                      ? `${s.color || "#2f6fed"}0d`
                                      : "transparent",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: 4,
                                        background: s.color || "#2f6fed",
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <DynamicIcon
                                        name={s.ic || "FiGrid"}
                                        fallback="FiGrid"
                                      />
                                    </div>
                                    <div style={{ overflow: "hidden" }}>
                                      <b
                                        style={{
                                          fontSize: 13,
                                          display: "block",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                        }}
                                      >
                                        {s.nombre}
                                      </b>
                                    </div>
                                  </div>

                                  <select
                                    className={
                                      "role-select" + (rolActual ? "" : " off")
                                    }
                                    value={rolActual}
                                    onChange={(e) =>
                                      setAccesoMatriz(
                                        u.id,
                                        s.id,
                                        e.target.value,
                                      )
                                    }
                                    style={{
                                      width: "100%",
                                      padding: "6px 8px",
                                      fontSize: 12,
                                      borderRadius: 4,
                                    }}
                                  >
                                    <option value="">
                                      Sin acceso (Denegado)
                                    </option>
                                    {rolesPermitidos.map((r) => (
                                      <option key={r.id} value={r.nombre}>
                                        {r.nombre}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {usuariosPaginados.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--merco-muted)",
                  }}
                >
                  No se encontraron usuarios con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px",
          borderTop: "1px solid var(--merco-border, rgba(255, 255, 255, 0.08))",
          flexWrap: "wrap",
          gap: 12,
          fontSize: 13,
          color: "var(--merco-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>
            Mostrando <b>{registroInicio}</b> a <b>{registroFin}</b> de{" "}
            <b>{usuariosFiltradosLength}</b> registros
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginLeft: 8,
            }}
          >
            <span>Filas por página:</span>
            <select
              value={porPagina}
              onChange={(e) => {
                setPorPagina(Number(e.target.value));
                setPaginaActual(1);
              }}
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                border: "1px solid var(--merco-border, #444)",
                background: "var(--merco-bg-subtle, rgba(255,255,255,0.05))",
                color: "inherit",
                fontSize: 12,
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="btn btn-ghost"
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              opacity: paginaActual === 1 ? 0.5 : 1,
              cursor: paginaActual === 1 ? "not-allowed" : "pointer",
            }}
          >
            Anterior
          </button>

          <span style={{ padding: "0 6px", fontWeight: 500 }}>
            Página {paginaActual} de {totalPaginas}
          </span>

          <button
            className="btn btn-ghost"
            disabled={paginaActual >= totalPaginas}
            onClick={() =>
              setPaginaActual((p) => Math.min(p + 1, totalPaginas))
            }
            style={{
              padding: "6px 12px",
              fontSize: 12,
              opacity: paginaActual >= totalPaginas ? 0.5 : 1,
              cursor: paginaActual >= totalPaginas ? "not-allowed" : "pointer",
            }}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
