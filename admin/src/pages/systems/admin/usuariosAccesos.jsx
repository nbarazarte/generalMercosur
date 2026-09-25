import React, { useMemo, useState } from "react";
import SystemLayout from "../../layouts/SystemLayout";

/* IMPORTAMOS EL CATÁLOGO DE ÍCONOS DESDE LA RUTA CORRECTA */
import { DynamicIcon, IconPicker } from "../../components/IconCatalog";

const SISTEMAS = [
  {
    id: "adminmep",
    nombre: "Admin MEP",
    ic: "FiSettings",
    color: "#2f6fed",
    desc: "Configuración del sistema",
  },
  {
    id: "rrhh",
    nombre: "Recursos Humanos",
    ic: "FiUsers",
    color: "#1f9d63",
    desc: "Ficha de empleado",
  },
  {
    id: "tickets",
    nombre: "Sistema Tickets",
    ic: "FiHeadphones",
    color: "#d8992a",
    desc: "Centraliza tus tickets",
  },
  {
    id: "kb",
    nombre: "Base de Conocimiento",
    ic: "FiBook",
    color: "#8155d8",
    desc: "Información para clientes",
  },
];
const SYS = Object.fromEntries(SISTEMAS.map((s) => [s.id, s]));

const ROLES_INIT = [
  {
    id: 1,
    nombre: "Administrador",
    desc: "Control total del sistema y su configuración.",
    ic: "FiShield",
    color: "#0b2545",
    bg: "rgba(11,37,69,.12)",
    sistemas: "all",
    permisos: ["Ver", "Crear", "Editar", "Eliminar", "Aprobar", "Exportar"],
  },
  {
    id: 2,
    nombre: "Supervisor",
    desc: "Supervisa la operación y aprueba acciones.",
    ic: "FiEye",
    color: "#2f6fed",
    bg: "rgba(47,111,237,.12)",
    sistemas: "all",
    permisos: ["Ver", "Editar", "Aprobar", "Exportar"],
  },
  {
    id: 3,
    nombre: "Operador MEP",
    desc: "Opera la configuración y parámetros de MEP.",
    ic: "FiZap",
    color: "#123a63",
    bg: "rgba(18,58,99,.12)",
    sistemas: ["adminmep"],
    permisos: ["Ver", "Crear", "Editar"],
  },
  {
    id: 4,
    nombre: "Gestor RR.HH.",
    desc: "Administra fichas y datos de empleados.",
    ic: "FiFolder",
    color: "#1f9d63",
    bg: "rgba(31,157,99,.12)",
    sistemas: ["rrhh"],
    permisos: ["Ver", "Crear", "Editar", "Exportar"],
  },
  {
    id: 5,
    nombre: "Empleado",
    desc: "Consulta y actualiza su propia ficha.",
    ic: "FiUser",
    color: "#0f7a4c",
    bg: "rgba(31,157,99,.1)",
    sistemas: ["rrhh"],
    permisos: ["Ver", "Editar"],
  },
  {
    id: 6,
    nombre: "Agente de Soporte",
    desc: "Atiende y resuelve tickets de soporte.",
    ic: "FiHeadphones",
    color: "#d8992a",
    bg: "rgba(216,153,42,.14)",
    sistemas: ["tickets"],
    permisos: ["Ver", "Crear", "Editar"],
  },
  {
    id: 7,
    nombre: "Editor de Contenido",
    desc: "Crea y edita artículos de la base de conocimiento.",
    ic: "FiFileText",
    color: "#8155d8",
    bg: "rgba(129,85,216,.12)",
    sistemas: ["kb"],
    permisos: ["Ver", "Crear", "Editar"],
  },
  {
    id: 8,
    nombre: "Solo Lectura",
    desc: "Consulta información sin poder editar.",
    ic: "FiLock",
    color: "#69748c",
    bg: "rgba(105,116,140,.14)",
    sistemas: "all",
    permisos: ["Ver"],
  },
];

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

const USUARIOS_INIT = [
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

const parsearFechaUltimoAcceso = (str) => {
  if (!str || str === "—") return null;
  const hoy = new Date();

  if (str.startsWith("Hoy")) {
    return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  }
  if (str.startsWith("Ayer")) {
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    return new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate());
  }

  const partes = str.split("/");
  if (partes.length === 3) {
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const anio = parseInt(partes[2], 10);
    return new Date(anio, mes, dia);
  }

  return null;
};

/* ============================ COMPONENTE PRINCIPAL ============================ */
export default function UsuariosAccesos() {
  const [tab, setTab] = useState("usuarios"); // 'usuarios' o 'roles'
  const [usuarios, setUsuarios] = useState(USUARIOS_INIT);
  const [roles, setRoles] = useState(ROLES_INIT);

  const [busqueda, setBusqueda] = useState("");
  const [filtroSistema, setFiltroSistema] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroUltimoAcceso, setFiltroUltimoAcceso] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [modal, setModal] = useState(null);

  const rolesDeSistema = (sysId) =>
    roles.filter((r) => r.sistemas === "all" || r.sistemas.includes(sysId));

  const usuariosFiltrados = useMemo(
    () =>
      usuarios.filter((u) => {
        const q = busqueda.toLowerCase().trim();
        const coincideBusqueda =
          !q ||
          u.nombre.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q);

        const coincideSistema = !filtroSistema || u.accesos[filtroSistema];

        const coincideRol =
          !filtroRol ||
          Object.values(u.accesos).some((rolNombre) => rolNombre === filtroRol);

        const coincideEstado = !filtroEstado || u.estado === filtroEstado;

        let coincideUltimoAcceso = true;
        if (filtroUltimoAcceso === "hoy") {
          coincideUltimoAcceso = u.ultimo.startsWith("Hoy");
        } else if (filtroUltimoAcceso === "ayer") {
          coincideUltimoAcceso = u.ultimo.startsWith("Ayer");
        } else if (filtroUltimoAcceso === "nunca") {
          coincideUltimoAcceso = u.ultimo === "—";
        } else if (filtroUltimoAcceso === "rango") {
          const fechaUser = parsearFechaUltimoAcceso(u.ultimo);
          if (!fechaUser) {
            coincideUltimoAcceso = false;
          } else {
            const desde = fechaDesde
              ? new Date(fechaDesde + "T00:00:00")
              : null;
            const hasta = fechaHasta
              ? new Date(fechaHasta + "T23:59:59")
              : null;

            if (desde && fechaUser < desde) coincideUltimoAcceso = false;
            if (hasta && fechaUser > hasta) coincideUltimoAcceso = false;
          }
        }

        return (
          coincideBusqueda &&
          coincideSistema &&
          coincideRol &&
          coincideEstado &&
          coincideUltimoAcceso
        );
      }),
    [
      usuarios,
      busqueda,
      filtroSistema,
      filtroRol,
      filtroEstado,
      filtroUltimoAcceso,
      fechaDesde,
      fechaHasta,
    ],
  );

  const stats = useMemo(
    () => ({
      total: usuarios.length,
      activos: usuarios.filter((u) => u.estado === "active").length,
      pendientes: usuarios.filter((u) => u.estado === "pending").length,
      sistemas: SISTEMAS.length,
    }),
    [usuarios],
  );

  const guardarUsuario = (data) => {
    setUsuarios((prev) =>
      data.id
        ? prev.map((u) => (u.id === data.id ? data : u))
        : [...prev, { ...data, id: Date.now(), ultimo: "—" }],
    );
    setModal(null);
  };

  const eliminarUsuario = (id) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
    setModal(null);
  };

  const guardarRol = (data) => {
    setRoles((prev) =>
      data.id
        ? prev.map((r) => (r.id === data.id ? { ...r, ...data } : r))
        : [
            ...prev,
            {
              ...data,
              id: Date.now(),
              permisos: ["Ver"],
            },
          ],
    );
    setModal(null);
  };

  const setAccesoMatriz = (userId, sysId, rol) => {
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

  return (
    <SystemLayout identificacion="Administración General">
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
            Usuarios y Accesos
          </h2>
        </div>
      </div>

      <div className="ma-stats">
        <div className="ma-stat">
          <div className="lbl">Total de usuarios</div>
          <div className="val">{stats.total}</div>
          <span className="chip chip-up">↑ activos {stats.activos}</span>
        </div>
        <div className="ma-stat">
          <div className="lbl">Roles definidos</div>
          <div className="val">{roles.length}</div>
          <span className="chip chip-flat">según sistema</span>
        </div>
        <div className="ma-stat">
          <div className="lbl">Sistemas integrados</div>
          <div className="val">{stats.sistemas}</div>
          <span className="chip chip-flat">módulos</span>
        </div>
        <div className="ma-stat">
          <div className="lbl">Altas pendientes</div>
          <div className="val">{stats.pendientes}</div>
          <span className="chip chip-up">requieren aprobación</span>
        </div>
      </div>

      <div className="ma-tabs">
        <button
          className={"ma-tab" + (tab === "usuarios" ? " active" : "")}
          onClick={() => setTab("usuarios")}
        >
          Usuarios y Accesos
        </button>
        <button
          className={"ma-tab" + (tab === "roles" ? " active" : "")}
          onClick={() => setTab("roles")}
        >
          Roles
        </button>
      </div>

      {tab === "usuarios" && (
        <>
          <ToolbarFiltros
            {...{
              roles,
              busqueda,
              setBusqueda,
              filtroSistema,
              setFiltroSistema,
              filtroRol,
              setFiltroRol,
              filtroEstado,
              setFiltroEstado,
              filtroUltimoAcceso,
              setFiltroUltimoAcceso,
              fechaDesde,
              setFechaDesde,
              fechaHasta,
              setFechaHasta,
              setModal,
              mostrarBotonNuevo: true,
            }}
          />
          <TabUsuariosYAccesos
            usuariosFiltrados={usuariosFiltrados}
            rolesDeSistema={rolesDeSistema}
            setAccesoMatriz={setAccesoMatriz}
            setModal={setModal}
          />
        </>
      )}

      {tab === "roles" && <TabRoles roles={roles} setModal={setModal} />}

      {modal?.tipo === "usuario" && (
        <ModalUsuario
          data={modal.data}
          onSave={guardarUsuario}
          onDelete={eliminarUsuario}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.tipo === "rol" && (
        <ModalRol
          data={modal.data}
          onSave={guardarRol}
          onClose={() => setModal(null)}
        />
      )}
    </SystemLayout>
  );
}

/* ==================== BARRA DE FILTROS ==================== */
function ToolbarFiltros({
  roles,
  busqueda,
  setBusqueda,
  filtroSistema,
  setFiltroSistema,
  filtroRol,
  setFiltroRol,
  filtroEstado,
  setFiltroEstado,
  filtroUltimoAcceso,
  setFiltroUltimoAcceso,
  fechaDesde,
  setFechaDesde,
  fechaHasta,
  setFechaHasta,
  setModal,
  mostrarBotonNuevo,
}) {
  return (
    <div className="ma-toolbar" style={{ marginBottom: 16 }}>
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
        <div style={{ position: "relative", minWidth: 170, flex: "1 1 150px" }}>
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid var(--merco-border, #444)",
              background: "var(--merco-bg-subtle, rgba(255, 255, 255, 0.05))",
              color: "var(--merco-text, inherit)",
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>

        <select
          value={filtroSistema}
          onChange={(e) => setFiltroSistema(e.target.value)}
        >
          <option value="">Todos los sistemas</option>
          {SISTEMAS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
        >
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.nombre}>
              {r.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="pending">Pendiente</option>
        </select>

        <select
          value={filtroUltimoAcceso}
          onChange={(e) => setFiltroUltimoAcceso(e.target.value)}
        >
          <option value="">Último acceso (Todos)</option>
          <option value="hoy">Hoy</option>
          <option value="ayer">Ayer</option>
          <option value="rango">Rango de fechas...</option>
          <option value="nunca">Sin acceso (—)</option>
        </select>

        {filtroUltimoAcceso === "rango" && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--merco-bg-subtle, rgba(255, 255, 255, 0.03))",
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
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
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
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                fontSize: 12,
              }}
            />
          </div>
        )}

        {(busqueda ||
          filtroSistema ||
          filtroRol ||
          filtroEstado ||
          filtroUltimoAcceso ||
          fechaDesde ||
          fechaHasta) && (
          <button
            className="btn btn-ghost"
            style={{ padding: "6px 12px", fontSize: 13 }}
            onClick={() => {
              setBusqueda("");
              setFiltroSistema("");
              setFiltroRol("");
              setFiltroEstado("");
              setFiltroUltimoAcceso("");
              setFechaDesde("");
              setFechaHasta("");
            }}
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {mostrarBotonNuevo && (
        <button
          className="btn btn-accent"
          onClick={() => setModal({ tipo: "usuario", data: null })}
        >
          <span>➕</span> Nuevo usuario
        </button>
      )}
    </div>
  );
}

/* ==================== SUB-COMPONENTES ==================== */
function AccesosChips({ accesos }) {
  const ids = Object.keys(accesos);
  if (!ids.length) return <span className="access-chip none">Sin accesos</span>;
  return ids.map((sid) => {
    const s = SYS[sid];
    if (!s) return null;
    return (
      <span className="access-chip" key={sid}>
        <span
          className="ci"
          style={{
            background: s.color,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DynamicIcon name={s.ic} fallback="FiGrid" />
        </span>
        {s.nombre} · <span className="role">{accesos[sid]}</span>
      </span>
    );
  });
}

/* PESTAÑA UNIFICADA: USUARIOS Y ACCESOS */
function TabUsuariosYAccesos({
  usuariosFiltrados,
  rolesDeSistema,
  setAccesoMatriz,
  setModal,
}) {
  const [expandidos, setExpandidos] = useState({});

  const toggleExpandir = (id) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="ma-card" style={{ overflowX: "auto" }}>
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
          {usuariosFiltrados.map((u) => {
            const estaAbierto = !!expandidos[u.id];

            return (
              <React.Fragment key={u.id}>
                {/* Fila principal del usuario */}
                <tr style={{ borderBottom: estaAbierto ? "none" : undefined }}>
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
                      ▶
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
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <AccesosChips accesos={u.accesos} />
                    </div>
                  </td>
                  <td>
                    <span className={"badge " + ESTADOS[u.estado][1]}>
                      {ESTADOS[u.estado][0]}
                    </span>
                  </td>
                  <td style={{ color: "var(--merco-muted)", fontSize: 13 }}>
                    {u.ultimo}
                  </td>
                  <td>
                    <div className="ma-actions">
                      <button
                        className="btn-icon"
                        title="Editar usuario"
                        onClick={() => setModal({ tipo: "usuario", data: u })}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Eliminar usuario"
                        onClick={() => setModal({ tipo: "usuario", data: u })}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Fila Desplegable en acordeón exactamente debajo del usuario */}
                {estaAbierto && (
                  <tr
                    style={{
                      background:
                        "var(--merco-bg-subtle, rgba(255, 255, 255, 0.02))",
                    }}
                  >
                    <td colSpan={6} style={{ padding: "12px 20px 20px 48px" }}>
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
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 12,
                            color: "var(--merco-muted)",
                          }}
                        >
                          ⚙️ Configuración rápida de roles para {u.nombre}:
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(260px, 1fr))",
                            gap: 12,
                          }}
                        >
                          {SISTEMAS.map((s) => {
                            const rolActual = u.accesos[s.id] || "";
                            const rolesPermitidos = rolesDeSistema(s.id);

                            return (
                              <div
                                key={s.id}
                                style={{
                                  padding: "10px 12px",
                                  borderRadius: 6,
                                  border: rolActual
                                    ? `1px solid ${s.color}66`
                                    : "1px solid var(--merco-border, #333)",
                                  background: rolActual
                                    ? `${s.color}0d`
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
                                      background: s.color,
                                      color: "#fff",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <DynamicIcon
                                      name={s.ic}
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
                                    setAccesoMatriz(u.id, s.id, e.target.value)
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "6px 8px",
                                    fontSize: 12,
                                    borderRadius: 4,
                                  }}
                                >
                                  <option value="">
                                    🚫 Sin acceso (Denegado)
                                  </option>
                                  {rolesPermitidos.map((r) => (
                                    <option key={r.id} value={r.nombre}>
                                      🔑 {r.nombre}
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

          {usuariosFiltrados.length === 0 && (
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
  );
}

function TabRoles({ roles, setModal }) {
  return (
    <>
      <div className="ma-toolbar">
        <div style={{ color: "var(--merco-muted)", fontSize: 14 }}>
          Perfiles de permisos. Cada rol aplica a uno o varios sistemas.
        </div>
        <button
          className="btn btn-accent"
          onClick={() => setModal({ tipo: "rol", data: null })}
        >
          <span>➕</span> Nuevo rol
        </button>
      </div>
      <div className="ma-roles">
        {roles.map((r) => (
          <div className="role-card" key={r.id}>
            <div className="rc-top">
              <div
                className="role-ic"
                style={{
                  background: r.bg || r.color + "22",
                  color: r.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                <DynamicIcon name={r.ic} fallback="FiShield" />
              </div>
              <button
                className="btn-icon"
                onClick={() => setModal({ tipo: "rol", data: r })}
              >
                ✏️
              </button>
            </div>
            <h3>{r.nombre}</h3>
            <p>{r.desc}</p>
            <div style={{ marginTop: 12 }}>
              {r.permisos.map((p) => (
                <span key={p} className="tag">
                  {p}
                </span>
              ))}
            </div>
            <div className="role-sys-tags">
              {r.sistemas === "all" ? (
                <span className="tag tag-accent">Todos los sistemas</span>
              ) : (
                r.sistemas.map((sid) => (
                  <span
                    key={sid}
                    className="tag tag-accent"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <DynamicIcon name={SYS[sid]?.ic} fallback="FiGrid" />
                    {SYS[sid]?.nombre || sid}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ModalUsuario({ data, onSave, onDelete, onClose }) {
  const editar = !!data;
  const [nombre, setNombre] = useState(data?.nombre || "");
  const [email, setEmail] = useState(data?.email || "");
  const [estado, setEstado] = useState(data?.estado || "active");
  const [accesos] = useState(data?.accesos || {});

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-modal-head">
          <h3>{editar ? "Editar usuario" : "Nuevo usuario"}</h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ma-modal-body">
          <div className="field-row">
            <div className="field">
              <label>Nombre completo</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div className="field">
              <label>Correo corporativo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@mercosur.com.py"
              />
            </div>
          </div>
          <div className="field" style={{ maxWidth: 220 }}>
            <label>Estado de la cuenta</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>
        </div>
        <div className="ma-modal-foot">
          {editar && (
            <button
              className="btn btn-ghost"
              style={{ marginRight: "auto", color: "var(--merco-danger)" }}
              onClick={() => onDelete(data.id)}
            >
              Eliminar
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={!nombre || !email}
            onClick={() =>
              onSave({
                id: data?.id,
                nombre,
                email,
                estado,
                accesos,
                ultimo: data?.ultimo || "—",
              })
            }
          >
            {editar ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalRol({ data, onSave, onClose }) {
  const editar = !!data;
  const [nombre, setNombre] = useState(data?.nombre || "");
  const [desc, setDesc] = useState(data?.desc || "");
  const [ic, setIc] = useState(data?.ic || "FiShield");
  const [color, setColor] = useState(data?.color || "#2f6fed");
  const [sistemas] = useState(data?.sistemas || "all");

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-modal-head">
          <h3>{editar ? "Editar rol" : "Nuevo rol"}</h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ma-modal-body">
          <div className="field">
            <label>Nombre del rol</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Analista de Riesgos"
            />
          </div>
          <div className="field">
            <label>Descripción</label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ej. Acceso a reportes y configuraciones generales"
            />
          </div>

          <div className="field">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Seleccionar Ícono del Rol:
              <span
                style={{
                  fontSize: 18,
                  display: "inline-flex",
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: color + "22",
                  color: color,
                }}
              >
                <DynamicIcon name={ic} fallback="FiShield" />
              </span>
            </label>
            <IconPicker value={ic} onChange={setIc} />
          </div>

          <div className="field">
            <label>Color distintivo del Rol</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ height: 40, cursor: "pointer", width: "100%" }}
            />
          </div>
        </div>
        <div className="ma-modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={!nombre}
            onClick={() =>
              onSave({
                id: data?.id,
                nombre,
                desc,
                ic,
                color,
                bg: color + "22",
                sistemas,
              })
            }
          >
            {editar ? "Guardar cambios" : "Crear rol"}
          </button>
        </div>
      </div>
    </div>
  );
}
