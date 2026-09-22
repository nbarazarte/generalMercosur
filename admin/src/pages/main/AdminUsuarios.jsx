import { useMemo, useState } from "react";
import "./AdminUsuarios.css";

/* ------------------------------------------------------------------ *
 *  MercoAdmin — Gestión de Usuarios, Roles y Accesos
 *  MERCOSUR — Tu Casa de Bolsa
 *
 *  Modelo clave: el acceso es POR SISTEMA. Un usuario puede tener
 *  acceso solo a algunos sistemas, y su ROL puede ser distinto en
 *  cada sistema (p. ej. Administrador en Admin MEP y Solo Lectura
 *  en Base de Conocimiento).
 *
 *  Reemplaza los datos mock y las funciones onSave/onDelete por tus
 *  llamadas al backend.
 * ------------------------------------------------------------------ */

/* Sistemas reales de la plataforma (panel de sistemas del portal) */
const SISTEMAS = [
  { id: "adminmep", nombre: "Admin MEP", ic: "\u2699\uFE0F", color: "#2f6fed", desc: "Configuraci\u00f3n del sistema" },
  { id: "rrhh", nombre: "Recursos Humanos", ic: "\uD83D\uDC65", color: "#1f9d63", desc: "Ficha de empleado" },
  { id: "tickets", nombre: "Sistema Tickets", ic: "\uD83C\uDFA7", color: "#d8992a", desc: "Centraliza tus tickets" },
  { id: "kb", nombre: "Base de Conocimiento", ic: "\uD83D\uDCD6", color: "#8155d8", desc: "Informaci\u00f3n para clientes" },
];
const SYS = Object.fromEntries(SISTEMAS.map((s) => [s.id, s]));

/*
 * Catálogo de roles. Cada rol declara en qué sistemas es válido
 * mediante `sistemas` ("all" o una lista de ids). Así el rol varía
 * según el sistema al que se concede acceso.
 */
const ROLES = [
  { id: 1, nombre: "Administrador", desc: "Control total del sistema y su configuraci\u00f3n.", ic: "\uD83D\uDEE1\uFE0F", color: "#0b2545", bg: "rgba(11,37,69,.1)", sistemas: "all", permisos: ["Ver", "Crear", "Editar", "Eliminar", "Aprobar", "Exportar"] },
  { id: 2, nombre: "Supervisor", desc: "Supervisa la operaci\u00f3n y aprueba acciones.", ic: "\uD83D\uDC53", color: "#2f6fed", bg: "rgba(47,111,237,.12)", sistemas: "all", permisos: ["Ver", "Editar", "Aprobar", "Exportar"] },
  { id: 3, nombre: "Operador MEP", desc: "Opera la configuraci\u00f3n y par\u00e1metros de MEP.", ic: "\u26A1", color: "#123a63", bg: "rgba(18,58,99,.12)", sistemas: ["adminmep"], permisos: ["Ver", "Crear", "Editar"] },
  { id: 4, nombre: "Gestor RR.HH.", desc: "Administra fichas y datos de empleados.", ic: "\uD83D\uDCC1", color: "#1f9d63", bg: "rgba(31,157,99,.12)", sistemas: ["rrhh"], permisos: ["Ver", "Crear", "Editar", "Exportar"] },
  { id: 5, nombre: "Empleado", desc: "Consulta y actualiza su propia ficha.", ic: "\uD83D\uDC64", color: "#0f7a4c", bg: "rgba(31,157,99,.1)", sistemas: ["rrhh"], permisos: ["Ver", "Editar"] },
  { id: 6, nombre: "Agente de Soporte", desc: "Atiende y resuelve tickets de soporte.", ic: "\uD83C\uDFA7", color: "#d8992a", bg: "rgba(216,153,42,.14)", sistemas: ["tickets"], permisos: ["Ver", "Crear", "Editar"] },
  { id: 7, nombre: "Editor de Contenido", desc: "Crea y edita art\u00edculos de la base de conocimiento.", ic: "\u270D\uFE0F", color: "#8155d8", bg: "rgba(129,85,216,.12)", sistemas: ["kb"], permisos: ["Ver", "Crear", "Editar"] },
  { id: 8, nombre: "Solo Lectura", desc: "Consulta informaci\u00f3n sin poder editar.", ic: "\uD83D\uDC41\uFE0F", color: "#69748c", bg: "rgba(105,116,140,.14)", sistemas: "all", permisos: ["Ver"] },
];

const rolesDeSistema = (sysId) =>
  ROLES.filter((r) => r.sistemas === "all" || r.sistemas.includes(sysId));

const AVA_COLORS = ["#0b2545", "#2f6fed", "#1f9d63", "#d8992a", "#8155d8", "#d1435b", "#a8863f"];
const avaColor = (n) => AVA_COLORS[(n?.charCodeAt(0) || 0) % AVA_COLORS.length];
const iniciales = (n) => n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const ESTADOS = { active: ["Activo", "badge-active"], inactive: ["Inactivo", "badge-inactive"], pending: ["Pendiente", "badge-pending"] };

/*
 * Usuarios. `accesos` = mapa { sistemaId: rolNombre }. Solo aparecen
 * los sistemas a los que el usuario tiene acceso; el valor es su rol
 * en ESE sistema.
 */
const USUARIOS_INIT = [
  { id: 1, nombre: "Mar\u00eda Gonz\u00e1lez", email: "m.gonzalez@mercosur.com.py", estado: "active", ultimo: "Hoy, 09:14",
    accesos: { adminmep: "Administrador", rrhh: "Supervisor", tickets: "Supervisor", kb: "Administrador" } },
  { id: 2, nombre: "Carlos Ben\u00edtez", email: "c.benitez@mercosur.com.py", estado: "active", ultimo: "Hoy, 08:02",
    accesos: { adminmep: "Operador MEP", tickets: "Agente de Soporte" } },
  { id: 3, nombre: "Luc\u00eda Fern\u00e1ndez", email: "l.fernandez@mercosur.com.py", estado: "active", ultimo: "Ayer, 17:45",
    accesos: { rrhh: "Gestor RR.HH.", tickets: "Supervisor" } },
  { id: 4, nombre: "Roberto D\u00edaz", email: "r.diaz@mercosur.com.py", estado: "pending", ultimo: "\u2014",
    accesos: { rrhh: "Empleado", kb: "Solo Lectura" } },
  { id: 5, nombre: "Ana Villalba", email: "a.villalba@mercosur.com.py", estado: "active", ultimo: "Hoy, 10:31",
    accesos: { kb: "Editor de Contenido", rrhh: "Empleado" } },
  { id: 6, nombre: "Jorge Ram\u00edrez", email: "j.ramirez@mercosur.com.py", estado: "inactive", ultimo: "12/09/2026",
    accesos: { adminmep: "Solo Lectura" } },
];

/* ============================ COMPONENTE ============================ */
export default function Admin() {
  const [tab, setTab] = useState("usuarios");
  const [usuarios, setUsuarios] = useState(USUARIOS_INIT);
  const [busqueda, setBusqueda] = useState("");
  const [filtroSistema, setFiltroSistema] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modal, setModal] = useState(null); // {tipo, data}

  const usuariosFiltrados = useMemo(() => usuarios.filter((u) => {
    const q = busqueda.toLowerCase();
    return (!q || u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (!filtroSistema || u.accesos[filtroSistema])
      && (!filtroEstado || u.estado === filtroEstado);
  }), [usuarios, busqueda, filtroSistema, filtroEstado]);

  const stats = useMemo(() => ({
    total: usuarios.length,
    activos: usuarios.filter((u) => u.estado === "active").length,
    pendientes: usuarios.filter((u) => u.estado === "pending").length,
    sistemas: SISTEMAS.length,
  }), [usuarios]);

  const guardarUsuario = (data) => {
    setUsuarios((prev) => data.id
      ? prev.map((u) => (u.id === data.id ? data : u))
      : [...prev, { ...data, id: Date.now(), ultimo: "\u2014" }]);
    setModal(null);
  };
  const eliminarUsuario = (id) => { setUsuarios((prev) => prev.filter((u) => u.id !== id)); setModal(null); };

  /* Cambia (o quita con "") el rol de un usuario en un sistema desde la matriz */
  const setAccesoMatriz = (userId, sysId, rol) => {
    setUsuarios((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      const accesos = { ...u.accesos };
      if (rol) accesos[sysId] = rol; else delete accesos[sysId];
      return { ...u, accesos };
    }));
  };

  return (
    <div className="ma-shell">
      {/* ----------------- SIDEBAR ----------------- */}
      <aside className="ma-side">
        <div className="ma-brand">
          <div className="ma-logo">M</div>
          <div>
            <h1>MercoAdmin</h1>
            <span>MERCOSUR — Tu Casa de Bolsa</span>
          </div>
        </div>
        <nav className="ma-nav">
          <span className="ma-nav-label">Principal</span>
          <a><span className="ic">\u25A6</span> Panel</a>
          <a className="active"><span className="ic">\uD83D\uDC65</span> Usuarios y Accesos</a>
          <a><span className="ic">\u2699\uFE0F</span> Sistemas</a>
          <a><span className="ic">\uD83D\uDCCA</span> Reportes</a>
          <span className="ma-nav-label">Sistema</span>
          <a><span className="ic">\uD83D\uDD14</span> Auditor\u00eda</a>
          <a><span className="ic">\u2699\uFE0F</span> Configuraci\u00f3n</a>
        </nav>
        <div className="ma-side-foot">
          <div className="ma-avatar">MG</div>
          <div><b>Mar\u00eda Gonz\u00e1lez</b><small>Administrador</small></div>
        </div>
      </aside>

      {/* ----------------- MAIN ----------------- */}
      <div className="ma-main">
        <header className="ma-topbar">
          <div>
            <h2>Usuarios, Roles y Accesos</h2>
            <p>Cada usuario accede solo a los sistemas asignados, con un rol propio en cada uno.</p>
          </div>
          <div className="ma-search">
            <span className="ic">\uD83D\uDD0D</span>
            <input placeholder="Buscar usuario o correo..." value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)} />
          </div>
        </header>

        <main className="ma-content">
          <div className="ma-stats">
            <div className="ma-stat"><div className="lbl">Total de usuarios</div><div className="val">{stats.total}</div><span className="chip chip-up">\u2191 activos {stats.activos}</span></div>
            <div className="ma-stat"><div className="lbl">Roles definidos</div><div className="val">{ROLES.length}</div><span className="chip chip-flat">seg\u00fan sistema</span></div>
            <div className="ma-stat"><div className="lbl">Sistemas de la plataforma</div><div className="val">{stats.sistemas}</div><span className="chip chip-flat">m\u00f3dulos</span></div>
            <div className="ma-stat"><div className="lbl">Altas pendientes</div><div className="val">{stats.pendientes}</div><span className="chip chip-up">requieren aprobaci\u00f3n</span></div>
          </div>

          <div className="ma-tabs">
            <button className={"ma-tab" + (tab === "usuarios" ? " active" : "")} onClick={() => setTab("usuarios")}>Usuarios</button>
            <button className={"ma-tab" + (tab === "roles" ? " active" : "")} onClick={() => setTab("roles")}>Roles</button>
            <button className={"ma-tab" + (tab === "accesos" ? " active" : "")} onClick={() => setTab("accesos")}>Accesos por Sistema</button>
          </div>

          {tab === "usuarios" && (
            <TabUsuarios {...{ usuariosFiltrados, filtroSistema, setFiltroSistema, filtroEstado, setFiltroEstado, setModal }} />
          )}
          {tab === "roles" && <TabRoles setModal={setModal} />}
          {tab === "accesos" && <TabAccesos usuarios={usuarios} setAccesoMatriz={setAccesoMatriz} />}
        </main>
      </div>

      {modal?.tipo === "usuario" && (
        <ModalUsuario data={modal.data} onSave={guardarUsuario}
          onDelete={eliminarUsuario} onClose={() => setModal(null)} />
      )}
      {modal?.tipo === "rol" && (
        <ModalRol data={modal.data} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

/* ==================== helpers de render compartidos ==================== */
function AccesosChips({ accesos }) {
  const ids = Object.keys(accesos);
  if (!ids.length) return <span className="access-chip none">Sin accesos</span>;
  return ids.map((sid) => {
    const s = SYS[sid];
    return (
      <span className="access-chip" key={sid}>
        <span className="ci" style={{ background: s.color }}>{s.ic}</span>
        {s.nombre} \u00b7 <span className="role">{accesos[sid]}</span>
      </span>
    );
  });
}

/* ======================= TAB: USUARIOS ======================= */
function TabUsuarios({ usuariosFiltrados, filtroSistema, setFiltroSistema, filtroEstado, setFiltroEstado, setModal }) {
  return (
    <>
      <div className="ma-toolbar">
        <div className="ma-filters">
          <select value={filtroSistema} onChange={(e) => setFiltroSistema(e.target.value)}>
            <option value="">Todos los sistemas</option>
            {SISTEMAS.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
        <button className="btn btn-accent" onClick={() => setModal({ tipo: "usuario", data: null })}>
          <span>\u2795</span> Nuevo usuario
        </button>
      </div>

      <div className="ma-card">
        <table className="ma-table">
          <thead>
            <tr>
              <th>Usuario</th><th>Accesos y rol por sistema</th>
              <th>Estado</th><th>\u00daltimo acceso</th><th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="ma-user-cell">
                    <div className="ma-ava" style={{ background: avaColor(u.nombre) }}>{iniciales(u.nombre)}</div>
                    <div><b>{u.nombre}</b><small>{u.email}</small></div>
                  </div>
                </td>
                <td><AccesosChips accesos={u.accesos} /></td>
                <td><span className={"badge " + ESTADOS[u.estado][1]}>{ESTADOS[u.estado][0]}</span></td>
                <td style={{ color: "var(--merco-muted)", fontSize: 13 }}>{u.ultimo}</td>
                <td>
                  <div className="ma-actions">
                    <button className="btn-icon" title="Editar" onClick={() => setModal({ tipo: "usuario", data: u })}>\u270F\uFE0F</button>
                    <button className="btn-icon danger" title="Eliminar" onClick={() => setModal({ tipo: "usuario", data: u })}>\uD83D\uDDD1\uFE0F</button>
                  </div>
                </td>
              </tr>
            ))}
            {usuariosFiltrados.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--merco-muted)" }}>No se encontraron usuarios con los filtros aplicados.</td></tr>
            )}
          </tbody>
        </table>
        <div className="ma-pager">
          <span>Mostrando {usuariosFiltrados.length} usuario(s)</span>
          <div className="pages"><button className="active">1</button><button>2</button><button>3</button></div>
        </div>
      </div>
    </>
  );
}

/* ======================= TAB: ROLES ======================= */
function TabRoles({ setModal }) {
  return (
    <>
      <div className="ma-toolbar">
        <div style={{ color: "var(--merco-muted)", fontSize: 14 }}>Perfiles de permisos. Cada rol aplica a uno o varios sistemas.</div>
        <button className="btn btn-accent" onClick={() => setModal({ tipo: "rol", data: null })}><span>\u2795</span> Nuevo rol</button>
      </div>
      <div className="ma-roles">
        {ROLES.map((r) => (
          <div className="role-card" key={r.id}>
            <div className="rc-top">
              <div className="role-ic" style={{ background: r.bg, color: r.color }}>{r.ic}</div>
              <button className="btn-icon" onClick={() => setModal({ tipo: "rol", data: r })}>\u270F\uFE0F</button>
            </div>
            <h3>{r.nombre}</h3>
            <p>{r.desc}</p>
            <div style={{ marginTop: 12 }}>
              {r.permisos.map((p) => <span key={p} className="tag">{p}</span>)}
            </div>
            <div className="role-sys-tags">
              {r.sistemas === "all"
                ? <span className="tag tag-accent">Todos los sistemas</span>
                : r.sistemas.map((sid) => <span key={sid} className="tag tag-accent">{SYS[sid].ic} {SYS[sid].nombre}</span>)}
            </div>
            <div className="rc-meta">
              <div><b>{r.sistemas === "all" ? SISTEMAS.length : r.sistemas.length}</b> sistema(s)</div>
              <div><b>{r.permisos.length}</b> permisos</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ======================= TAB: ACCESOS POR SISTEMA ======================= */
function TabAccesos({ usuarios, setAccesoMatriz }) {
  return (
    <div className="ma-card">
      <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--merco-border)" }}>
        <b style={{ fontFamily: "var(--font-head)" }}>Matriz de accesos: usuario \u00d7 sistema</b>
        <p style={{ color: "var(--merco-muted)", fontSize: 13, marginTop: 2 }}>Asigna a cada usuario un rol por sistema. \u201cSin acceso\u201d revoca el ingreso a ese sistema.</p>
      </div>
      <div className="ma-matrix-wrap">
        <table className="ma-matrix">
          <thead>
            <tr>
              <th>Usuario</th>
              {SISTEMAS.map((s) => (
                <th key={s.id}>
                  <div className="sys-cell" style={{ justifyContent: "center" }}>
                    <div className="sys-ic" style={{ background: s.color }}>{s.ic}</div>{s.nombre}
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
                    <div className="ma-ava" style={{ background: avaColor(u.nombre), width: 30, height: 30, fontSize: 12 }}>{iniciales(u.nombre)}</div>
                    <div><b>{u.nombre}</b></div>
                  </div>
                </td>
                {SISTEMAS.map((s) => {
                  const rol = u.accesos[s.id] || "";
                  return (
                    <td key={s.id}>
                      <select className={"role-select" + (rol ? "" : " off")} value={rol}
                        onChange={(e) => setAccesoMatriz(u.id, s.id, e.target.value)}>
                        <option value="">Sin acceso</option>
                        {rolesDeSistema(s.id).map((r) => <option key={r.id} value={r.nombre}>{r.nombre}</option>)}
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

/* ======================= MODAL: USUARIO ======================= */
function ModalUsuario({ data, onSave, onDelete, onClose }) {
  const editar = !!data;
  const [nombre, setNombre] = useState(data?.nombre || "");
  const [email, setEmail] = useState(data?.email || "");
  const [estado, setEstado] = useState(data?.estado || "active");
  const [accesos, setAccesos] = useState(data?.accesos || {});

  const toggleSistema = (sid) => setAccesos((a) => {
    const n = { ...a };
    if (n[sid]) delete n[sid];
    else n[sid] = rolesDeSistema(sid)[0]?.nombre || ""; // rol por defecto del sistema
    return n;
  });
  const setRol = (sid, rol) => setAccesos((a) => ({ ...a, [sid]: rol }));

  const guardar = () => onSave({ id: data?.id, nombre, email, estado, accesos, ultimo: data?.ultimo || "\u2014" });

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-modal-head">
          <div>
            <h3>{editar ? "Editar usuario" : "Nuevo usuario"}</h3>
            <p>Marca los sistemas a los que accede y elige su rol en cada uno.</p>
          </div>
          <button className="btn-icon" onClick={onClose}>\u2715</button>
        </div>
        <div className="ma-modal-body">
          <div className="field-row">
            <div className="field">
              <label>Nombre completo</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Juan P\u00e9rez" />
            </div>
            <div className="field">
              <label>Correo corporativo</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@mercosur.com.py" />
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

          <div className="field">
            <label>Accesos a sistemas y rol</label>
            <p className="hint">Un usuario puede tener un rol distinto en cada sistema. Desmarca para revocar el acceso.</p>
            {SISTEMAS.map((s) => {
              const activo = !!accesos[s.id];
              return (
                <div className="sys-access-row" key={s.id}>
                  <label className="toggle">
                    <input type="checkbox" checked={activo} onChange={() => toggleSistema(s.id)} />
                    <span className="track" />
                  </label>
                  <div className="sys-cell">
                    <div className="sys-ic" style={{ background: s.color }}>{s.ic}</div>
                    <div><b>{s.nombre}</b></div>
                  </div>
                  <select className={"role-select" + (activo ? "" : " off")} disabled={!activo}
                    value={accesos[s.id] || ""} onChange={(e) => setRol(s.id, e.target.value)}>
                    {!activo && <option value="">Sin acceso</option>}
                    {rolesDeSistema(s.id).map((r) => <option key={r.id} value={r.nombre}>{r.nombre}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
        <div className="ma-modal-foot">
          {editar && <button className="btn btn-ghost" style={{ marginRight: "auto", color: "var(--merco-danger)" }} onClick={() => onDelete(data.id)}>Eliminar</button>}
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!nombre || !email} onClick={guardar}>{editar ? "Guardar cambios" : "Crear usuario"}</button>
        </div>
      </div>
    </div>
  );
}

/* ======================= MODAL: ROL ======================= */
function ModalRol({ data, onClose }) {
  const editar = !!data;
  const [nombre, setNombre] = useState(data?.nombre || "");
  const [desc, setDesc] = useState(data?.desc || "");
  const [permisos, setPermisos] = useState(data?.permisos || ["Ver"]);
  const [ambito, setAmbito] = useState(data?.sistemas === "all" ? "all" : "custom");
  const [sistemas, setSistemas] = useState(Array.isArray(data?.sistemas) ? data.sistemas : []);
  const TODOS = ["Ver", "Crear", "Editar", "Eliminar", "Aprobar", "Exportar"];

  const toggleP = (p) => setPermisos((ps) => ps.includes(p) ? ps.filter((x) => x !== p) : [...ps, p]);
  const toggleS = (sid) => setSistemas((ss) => ss.includes(sid) ? ss.filter((x) => x !== sid) : [...ss, sid]);

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-modal-head">
          <div>
            <h3>{editar ? "Editar rol" : "Nuevo rol"}</h3>
            <p>Define el nombre, los sistemas donde aplica y sus permisos.</p>
          </div>
          <button className="btn-icon" onClick={onClose}>\u2715</button>
        </div>
        <div className="ma-modal-body">
          <div className="field">
            <label>Nombre del rol</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Analista de Riesgos" />
          </div>
          <div className="field">
            <label>Descripci\u00f3n</label>
            <textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Alcance y responsabilidades del rol" />
          </div>
          <div className="field">
            <label>\u00c1mbito del rol</label>
            <select value={ambito} onChange={(e) => setAmbito(e.target.value)} style={{ maxWidth: 260 }}>
              <option value="all">Todos los sistemas</option>
              <option value="custom">Sistemas espec\u00edficos</option>
            </select>
          </div>
          {ambito === "custom" && (
            <div className="field">
              <label>Sistemas donde aplica</label>
              <div className="perm-list">
                {SISTEMAS.map((s) => (
                  <label className="perm-item" key={s.id}>
                    <input type="checkbox" checked={sistemas.includes(s.id)} onChange={() => toggleS(s.id)} />
                    <span>{s.ic} {s.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="field">
            <label>Permisos</label>
            <div className="perm-list">
              {TODOS.map((p) => (
                <label className="perm-item" key={p}>
                  <input type="checkbox" checked={permisos.includes(p)} onChange={() => toggleP(p)} />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="ma-modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!nombre} onClick={onClose}>{editar ? "Guardar cambios" : "Crear rol"}</button>
        </div>
      </div>
    </div>
  );
}
