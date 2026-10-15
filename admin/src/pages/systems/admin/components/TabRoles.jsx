import React, { useState, useMemo } from "react";
import { DynamicIcon } from "../../../../components/IconCatalog";

export default function TabRoles({ roles, catRoles, setModal }) {
  const [rolFiltro, setRolFiltro] = useState("todos");
  const [sistemaFiltro, setSistemaFiltro] = useState("todos");

  const rolesDisponibles = useMemo(() => {
    const unicos = new Set();
    catRoles?.forEach((r) => {
      if (r.nombre) unicos.add(r.nombre.trim());
    });
    return Array.from(unicos);
  }, [catRoles]);

  const sistemasDisponibles = Array.from(
    new Set(
      roles?.flatMap((r) =>
        Array.isArray(r.sistemas) ? r.sistemas : [r.sistemas],
      ) || [],
    ),
  ).filter(Boolean);

  const rolesFiltrados = roles?.filter((r) => {
    const matchRol =
      rolFiltro === "todos" ||
      (r.nombre &&
        r.nombre.trim().toLowerCase() === rolFiltro.trim().toLowerCase());

    const sistemasArr = Array.isArray(r.sistemas) ? r.sistemas : [r.sistemas];
    const matchSistema =
      sistemaFiltro === "todos" || sistemasArr.includes(sistemaFiltro);

    return matchRol && matchSistema;
  });

  return (
    <>
      <div className="ma-toolbar">
        <div style={{ color: "var(--merco-muted)", fontSize: 14 }}>
          Lista de roles y opciones configuradas para los sistemas
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-accent"
            onClick={() => setModal({ tipo: "asignarRolModal", data: null })}
          >
            <span>
              <DynamicIcon name="FiLink" />
            </span>{" "}
            Asignar Rol
          </button>

          <button
            className="btn btn-accent"
            onClick={() => setModal({ tipo: "rol", data: null })}
          >
            <span>
              <DynamicIcon name="FiPlus" />
            </span>{" "}
            Gestión de Roles
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          margin: "16px 0",
          flexWrap: "wrap",
        }}
      >
        <select
          value={rolFiltro}
          onChange={(e) => setRolFiltro(e.target.value)}
          style={{
            flex: 1,
            minWidth: "220px",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid var(--merco-border, #ccc)",
            background: "var(--merco-surface, #fff)",
            color: "inherit",
            fontSize: 14,
            textTransform: "capitalize",
          }}
        >
          <option value="todos">Todos los roles</option>
          {rolesDisponibles.map((rolName, idx) => (
            <option
              key={idx}
              value={rolName}
              style={{ textTransform: "capitalize" }}
            >
              {rolName}
            </option>
          ))}
        </select>

        <select
          value={sistemaFiltro}
          onChange={(e) => setSistemaFiltro(e.target.value)}
          style={{
            flex: 1,
            minWidth: "220px",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid var(--merco-border, #ccc)",
            background: "var(--merco-surface, #fff)",
            color: "inherit",
            fontSize: 14,
          }}
        >
          <option value="todos">Todos los sistemas</option>
          {sistemasDisponibles.map((sis, idx) => (
            <option key={idx} value={sis}>
              {sis}
            </option>
          ))}
        </select>
      </div>

      <div className="ma-roles">
        {rolesFiltrados?.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "30px",
              color: "var(--merco-muted)",
            }}
          >
            No se encontraron roles que coincidan con los filtros.
          </div>
        ) : (
          rolesFiltrados?.map((r, indexRol) => {
            const sistemasArr = Array.isArray(r.sistemas)
              ? r.sistemas
              : [r.sistemas];

            const permisosArray = Array.isArray(r.permisos) ? r.permisos : [];

            return (
              <div
                className="role-card role-card-animated"
                key={r.nombre + indexRol}
              >
                <div className="rc-top">
                  <div
                    className="role-ic"
                    style={{
                      background: `${r.color || "#2f6fed"}22`,
                      color: r.color || "#2f6fed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    <DynamicIcon name={r.ic || "FiShield"} />
                  </div>
                  <button
                    className="btn-icon"
                    title="Editar rol"
                    onClick={() => setModal({ tipo: "rol", data: r })}
                  >
                    <DynamicIcon name="FiEdit" />
                  </button>
                </div>

                <h3 style={{ textTransform: "capitalize" }}>{r.nombre}</h3>

                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                    margin: "4px 0 8px 0",
                  }}
                >
                  {sistemasArr.map((sys, idx) => (
                    <span
                      key={idx}
                      className="tag tag-accent"
                      style={{
                        background: `${r.color || "#2f6fed"}22`,
                        color: r.color || "#2f6fed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                      }}
                    >
                      {sys}
                    </span>
                  ))}
                </div>

                {r.desc && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--merco-muted)",
                      margin: "0 0 10px 0",
                      lineHeight: 1.4,
                    }}
                  >
                    {r.desc}
                  </p>
                )}

                <div style={{ marginTop: "auto" }}>
                  <span
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.5px",
                      color: "var(--merco-muted)",
                      display: "block",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    Opciones ({permisosArray.length})
                  </span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {permisosArray.map((p, idxPermiso) => (
                      <span key={idxPermiso} className="tag">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
