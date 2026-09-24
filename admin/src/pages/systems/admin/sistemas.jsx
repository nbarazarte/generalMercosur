import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import SystemLayout from "../../layouts/SystemLayout";
import "../../../systems.css";

const SISTEMAS = [
  {
    id: "adminmep",
    nombre: "Admin MEP",
    ic: "⚙️",
    color: "#2f6fed",
    desc: "Configuración del sistema",
  },
  {
    id: "rrhh",
    nombre: "Recursos Humanos",
    ic: "👥",
    color: "#1f9d63",
    desc: "Ficha de empleado",
  },
  {
    id: "tickets",
    nombre: "Sistema Tickets",
    ic: "🎧",
    color: "#d8992a",
    desc: "Centraliza tus tickets",
  },
  {
    id: "kb",
    nombre: "Base de Conocimiento",
    ic: "📖",
    color: "#8155d8",
    desc: "Información para clientes",
  },
];
const SYS = Object.fromEntries(SISTEMAS.map((s) => [s.id, s]));

const ROLES = [
  {
    id: 1,
    nombre: "Administrador",
    desc: "Control total del sistema y su configuración.",
    ic: "🛡️",
    color: "#0b2545",
    bg: "rgba(11,37,69,.1)",
    sistemas: "all",
    permisos: ["Ver", "Crear", "Editar", "Eliminar", "Aprobar", "Exportar"],
  },
  {
    id: 2,
    nombre: "Supervisor",
    desc: "Supervisa la operación y aprueba acciones.",
    ic: "👓",
    color: "#2f6fed",
    bg: "rgba(47,111,237,.12)",
    sistemas: "all",
    permisos: ["Ver", "Editar", "Aprobar", "Exportar"],
  },
  {
    id: 3,
    nombre: "Operador MEP",
    desc: "Opera la configuración y parámetros de MEP.",
    ic: "⚡",
    color: "#123a63",
    bg: "rgba(18,58,99,.12)",
    sistemas: ["adminmep"],
    permisos: ["Ver", "Crear", "Editar"],
  },
  {
    id: 4,
    nombre: "Gestor RR.HH.",
    desc: "Administra fichas y datos de empleados.",
    ic: "📁",
    color: "#1f9d63",
    bg: "rgba(31,157,99,.12)",
    sistemas: ["rrhh"],
    permisos: ["Ver", "Crear", "Editar", "Exportar"],
  },
  {
    id: 5,
    nombre: "Empleado",
    desc: "Consulta y actualiza su propia ficha.",
    ic: "👤",
    color: "#0f7a4c",
    bg: "rgba(31,157,99,.1)",
    sistemas: ["rrhh"],
    permisos: ["Ver", "Editar"],
  },
  {
    id: 6,
    nombre: "Agente de Soporte",
    desc: "Atiende y resuelve tickets de soporte.",
    ic: "🎧",
    color: "#d8992a",
    bg: "rgba(216,153,42,.14)",
    sistemas: ["tickets"],
    permisos: ["Ver", "Crear", "Editar"],
  },
  {
    id: 7,
    nombre: "Editor de Contenido",
    desc: "Crea y edita artículos de la base de conocimiento.",
    ic: "✍️",
    color: "#8155d8",
    bg: "rgba(129,85,216,.12)",
    sistemas: ["kb"],
    permisos: ["Ver", "Crear", "Editar"],
  },
  {
    id: 8,
    nombre: "Solo Lectura",
    desc: "Consulta información sin poder editar.",
    ic: "👁️",
    color: "#69748c",
    bg: "rgba(105,116,140,.14)",
    sistemas: "all",
    permisos: ["Ver"],
  },
];

const rolesDeSistema = (sysId) =>
  ROLES.filter((r) => r.sistemas === "all" || r.sistemas.includes(sysId));

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

/* MAPEO DE ICONOS PARA OPCIONES DEL MENÚ DINÁMICO */
const ICONOS_OPCIONES = {
  "Usuarios y Accesos": "👥",
  "Roles y Permisos": "🛡️",
  Configuración: "⚙️",
  Auditoría: "📜",
};

/* ============================ COMPONENTE PRINCIPAL ============================ */
export default function Sistemas() {
  const [tab, setTab] = useState("usuarios");
  const [usuarios, setUsuarios] = useState(USUARIOS_INIT);
  const [busqueda, setBusqueda] = useState("");
  const [filtroSistema, setFiltroSistema] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modal, setModal] = useState(null);

  // Inicializado como arreglo con ADMIN_NAV por defecto para evitar errores de renderizado
  const [opcionesMenu, setOpcionesMenu] = useState([]);

  // Suscripción al estado de Redux
  const user = useSelector((state) => state.auth?.user);
  const usuario_id = user?.id;

  const API_URL = import.meta.env.VITE_URL_API_ADMIN;
  const API_TOKEN = import.meta.env.VITE_TOKEN;

  useEffect(() => {
    const rolOpciones = async () => {
      if (!usuario_id) return;

      try {
        const response = await axios.post(
          `${API_URL}/rolOpciones`,
          {
            usuario_id: usuario_id,
            sistema: "Administración General",
          },
          { headers: { Authorization: `Bearer ${API_TOKEN}` } },
        );

        const rows = response.data?.rows || [];

        if (rows.length > 0) {
          // Mapea las filas de la vista SQL al formato de navegación de SystemLayout
          const adminNav = rows.map((item) => ({
            to: item.ruta_opcion,
            label: item.opcion,
            //icon: ICONOS_OPCIONES[item.opcion] || "👥",
            icon: "",
          }));

          setOpcionesMenu(adminNav);
          //console.log("Menú cargado dinámicamente:", adminNav);
        }
      } catch (error) {
        console.error("Error al obtener las opciones del rol:", error);
      }
    };

    rolOpciones();
  }, [usuario_id, API_URL, API_TOKEN]);

  const usuariosFiltrados = useMemo(
    () =>
      usuarios.filter((u) => {
        const q = busqueda.toLowerCase();
        return (
          (!q ||
            u.nombre.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)) &&
          (!filtroSistema || u.accesos[filtroSistema]) &&
          (!filtroEstado || u.estado === filtroEstado)
        );
      }),
    [usuarios, busqueda, filtroSistema, filtroEstado],
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
    <SystemLayout
      navItems={opcionesMenu}
      title="Administración General"
      subtitle="Administra todos los sistemas, opciones roles y usuarios de Mercosur"
    >
      {/* Tarjetas de Métricas / Stats */}
      <div className="ma-stats">
        <div className="ma-stat">
          <div className="lbl">Total de usuarios</div>
          <div className="val">{stats.total}</div>
          <span className="chip chip-up">↑ activos {stats.activos}</span>
        </div>
        <div className="ma-stat">
          <div className="lbl">Roles definidos</div>
          <div className="val">{ROLES.length}</div>
          <span className="chip chip-flat">según sistema</span>
        </div>
        <div className="ma-stat">
          <div className="lbl">Sistemas de la plataforma</div>
          <div className="val">{stats.sistemas}</div>
          <span className="chip chip-flat">módulos</span>
        </div>
        <div className="ma-stat">
          <div className="lbl">Altas pendientes</div>
          <div className="val">{stats.pendientes}</div>
          <span className="chip chip-up">requieren aprobación</span>
        </div>
      </div>

      {/* Pestañas de Navegación Interna */}
      <div className="ma-tabs">
        <button
          className={"ma-tab" + (tab === "usuarios" ? " active" : "")}
          onClick={() => setTab("usuarios")}
        >
          Usuarios
        </button>
        <button
          className={"ma-tab" + (tab === "roles" ? " active" : "")}
          onClick={() => setTab("roles")}
        >
          Roles
        </button>
        <button
          className={"ma-tab" + (tab === "accesos" ? " active" : "")}
          onClick={() => setTab("accesos")}
        >
          Accesos por Sistema
        </button>
      </div>

      {/* Vistas Dinámicas según Pestaña */}
      {tab === "usuarios" && (
        <TabUsuarios
          {...{
            usuariosFiltrados,
            filtroSistema,
            setFiltroSistema,
            filtroEstado,
            setFiltroEstado,
            setModal,
          }}
        />
      )}
      {tab === "roles" && <TabRoles setModal={setModal} />}
      {tab === "accesos" && (
        <TabAccesos usuarios={usuarios} setAccesoMatriz={setAccesoMatriz} />
      )}

      {/* Modales */}
      {modal?.tipo === "usuario" && (
        <ModalUsuario
          data={modal.data}
          onSave={guardarUsuario}
          onDelete={eliminarUsuario}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.tipo === "rol" && (
        <ModalRol data={modal.data} onClose={() => setModal(null)} />
      )}
    </SystemLayout>
  );
}

/* ==================== SUB-COMPONENTES Y VISTAS ==================== */
function AccesosChips({ accesos }) {
  const ids = Object.keys(accesos);
  if (!ids.length) return <span className="access-chip none">Sin accesos</span>;
  return ids.map((sid) => {
    const s = SYS[sid];
    return (
      <span className="access-chip" key={sid}>
        <span className="ci" style={{ background: s.color }}>
          {s.ic}
        </span>
        {s.nombre} · <span className="role">{accesos[sid]}</span>
      </span>
    );
  });
}

function TabUsuarios({
  usuariosFiltrados,
  filtroSistema,
  setFiltroSistema,
  filtroEstado,
  setFiltroEstado,
  setModal,
}) {
  return (
    <>
      <div className="ma-toolbar">
        <div className="ma-filters">
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
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
        <button
          className="btn btn-accent"
          onClick={() => setModal({ tipo: "usuario", data: null })}
        >
          {" "}
          <span>➕</span> Nuevo usuario{" "}
        </button>
      </div>

      <div className="ma-card">
        <table className="ma-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Accesos y rol por sistema</th>
              <th>Estado</th>
              <th>Último acceso</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id}>
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
                  <AccesosChips accesos={u.accesos} />
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
                      title="Editar"
                      onClick={() => setModal({ tipo: "usuario", data: u })}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon danger"
                      title="Eliminar"
                      onClick={() => setModal({ tipo: "usuario", data: u })}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {usuariosFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan={5}
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
    </>
  );
}

function TabRoles({ setModal }) {
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
        {ROLES.map((r) => (
          <div className="role-card" key={r.id}>
            <div className="rc-top">
              <div
                className="role-ic"
                style={{ background: r.bg, color: r.color }}
              >
                {r.ic}
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
                  <span key={sid} className="tag tag-accent">
                    {SYS[sid].ic} {SYS[sid].nombre}
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

function TabAccesos({ usuarios, setAccesoMatriz }) {
  return (
    <div className="ma-card">
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid var(--merco-border)",
        }}
      >
        <b>Matriz de accesos: usuario × sistema</b>
        <p style={{ color: "var(--merco-muted)", fontSize: 13, marginTop: 2 }}>
          Asigna a cada usuario un rol por sistema. “Sin acceso” revoca el
          ingreso.
        </p>
      </div>
      <div className="ma-matrix-wrap">
        <table className="ma-matrix">
          <thead>
            <tr>
              <th>Usuario</th>
              {SISTEMAS.map((s) => (
                <th key={s.id}>
                  <div
                    className="sys-cell"
                    style={{ justifyContent: "center" }}
                  >
                    <div className="sys-ic" style={{ background: s.color }}>
                      {s.ic}
                    </div>
                    {s.nombre}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="ma-user-cell">
                    <div
                      className="ma-ava"
                      style={{
                        background: avaColor(u.nombre),
                        width: 30,
                        height: 30,
                        fontSize: 12,
                      }}
                    >
                      {iniciales(u.nombre)}
                    </div>
                    <div>
                      <b>{u.nombre}</b>
                    </div>
                  </div>
                </td>
                {SISTEMAS.map((s) => {
                  const rol = u.accesos[s.id] || "";
                  return (
                    <td key={s.id}>
                      <select
                        className={"role-select" + (rol ? "" : " off")}
                        value={rol}
                        onChange={(e) =>
                          setAccesoMatriz(u.id, s.id, e.target.value)
                        }
                      >
                        <option value="">Sin acceso</option>
                        {rolesDeSistema(s.id).map((r) => (
                          <option key={r.id} value={r.nombre}>
                            {r.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ModalUsuario({ data, onSave, onDelete, onClose }) {
  const editar = !!data;
  const [nombre, setNombre] = useState(data?.nombre || "");
  const [email, setEmail] = useState(data?.email || "");
  const [estado, setEstado] = useState(data?.estado || "active");
  const [accesos, setAccesos] = useState(data?.accesos || {});

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

function ModalRol({ data, onClose }) {
  return (
    <div className="ma-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-modal-head">
          <h3>{data ? "Editar rol" : "Nuevo rol"}</h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ma-modal-body">
          <div className="field">
            <label>Nombre del rol</label>
            <input
              defaultValue={data?.nombre || ""}
              placeholder="Ej. Analista de Riesgos"
            />
          </div>
        </div>
        <div className="ma-modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
