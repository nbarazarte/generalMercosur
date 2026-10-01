import React, { useEffect, useMemo, useState } from "react";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon, IconPicker } from "../../components/IconCatalog";
import axios from "axios";

const API_URL = import.meta.env.VITE_URL_API_ADMIN;
const API_TOKEN = import.meta.env.VITE_TOKEN;

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
export default function Permisos() {
  const [tab, setTab] = useState("usuarios"); // 'usuarios' o 'roles'
  const [usuarios, setUsuarios] = useState(USUARIOS_INIT);

  const [sistemas, setSistemas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [catRoles, setCatRoles] = useState([]); // Catálogo de roles/permisos
  const [toast, setToast] = useState(null);

  const [flag, setFlag] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  useEffect(() => {
    const fetchSistemas = async () => {
      try {
        const response = await axios.get(`${API_URL}/fetchSistemas`, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });

        const dataArray = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : response.data?.sistemas || [];

        const sistemasMapeados = dataArray.map((row) => ({
          id: row.id,
          nombre: row.nombre,
          opciones: row.opciones || [],
        }));

        setSistemas(sistemasMapeados);
      } catch (err) {
        console.error("Error obteniendo sistemas:", err);
        showToast("Error al obtener los sistemas.", "error");
      }
    };

    const fetchRolesSistemasOpciones = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/fetchRolesSistemasOpciones`,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          },
        );
        setRoles([]);
        const rolesMapeados = response.data.map((row) => ({
          id: row.id || row.rol_sistema_id,
          rol_id: row.rol_id,
          sistema_id: row.sistema_id,
          nombre: row.nombre || row.rol,
          desc: row.desc || row.str_descripcion,
          ic: row.ic || row.str_icono || "FiShield",
          color: row.color || row.str_color || "#2f6fed",
          bg:
            row.bg ||
            (row.color || row.str_color
              ? `${row.color || row.str_color}22`
              : "rgba(47,111,237,.12)"),
          sistemas: Array.isArray(row.sistemas)
            ? row.sistemas
            : typeof row.sistemas === "string" && row.sistemas !== "all"
              ? [row.sistemas]
              : row.sistemas || "all",
          permisos: Array.isArray(row.permisos)
            ? row.permisos
            : typeof row.permisos === "string" && row.permisos.trim() !== ""
              ? row.permisos.split(",").map((p) => p.trim())
              : typeof row.opciones_asignadas === "string" &&
                  row.opciones_asignadas.trim() !== ""
                ? row.opciones_asignadas.split(",").map((p) => p.trim())
                : [],
          opcion_ids: Array.isArray(row.opcion_ids)
            ? row.opcion_ids.map(Number)
            : [],
        }));

        setRoles(rolesMapeados);
      } catch (err) {
        console.error("Error obteniendo roles:", err);
        showToast("Error al obtener los roles.", "error");
      }
    };

    const fetchCatRoles = async () => {
      try {
        const response = await axios.get(`${API_URL}/fetchCatRoles`, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        setCatRoles(response.data);
      } catch (err) {
        console.error("Error obteniendo catálogo de roles:", err);
      }
    };

    fetchSistemas();
    fetchRolesSistemasOpciones();
    fetchCatRoles();
  }, [flag]);

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
      sistemas: sistemas.length,
    }),
    [usuarios, sistemas],
  );

  const guardarUsuario = (data) => {
    setUsuarios((prev) =>
      data.id
        ? prev.map((u) => (u.id === data.id ? data : u))
        : [...prev, { ...data, id: Date.now(), ultimo: "—" }],
    );
    setModal(null);
    showToast(
      data.id
        ? "Usuario actualizado correctamente."
        : "Usuario creado exitosamente.",
    );
  };

  const eliminarUsuario = (id) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
    setModal(null);
    showToast("Usuario eliminado correctamente.");
  };

  const guardarRol = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/guardarRol`, data, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });

      setFlag(!flag);
      setModal(null);
      showToast(
        response.data?.message || "Rol guardado correctamente.",
        "success",
      );
    } catch (err) {
      console.error("Error completo de Axios:", err);
      const mensajeBackend = err.response?.data?.error || err.message;
      showToast(`Error al guardar el rol: ${mensajeBackend}`, "error");
    }
  };

  const asignarRolSistema = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/asignarRol`, data, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });

      setFlag(!flag);
      setModal(null);
      showToast(
        response.data?.message || "Rol asignado al sistema correctamente.",
        "success",
      );
    } catch (err) {
      console.error("Error completo de Axios:", err);
      const mensajeBackend = err.response?.data?.error || err.message;
      showToast(`Error al asignar rol: ${mensajeBackend}`, "error");
    }
  };

  const actualizarRolSistemaOpciones = async (data) => {
    try {
      const response = await axios.post(
        `${API_URL}/actualizarRolSistemaOpciones`,
        data,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        },
      );

      setFlag(!flag);
      setModal(null);
      showToast(
        response.data?.message ||
          "Opciones del rol actualizadas correctamente.",
        "success",
      );
    } catch (err) {
      console.error("Error completo de Axios:", err);
      const mensajeBackend = err.response?.data?.error || err.message;
      showToast(`Error al actualizar opciones: ${mensajeBackend}`, "error");
    }
  };

  const handleEliminarRol = async (rolId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este rol de este sistema?"))
      return;

    try {
      const response = await axios.post(
        `${API_URL}/eliminarRol/${rolId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        },
      );

      const data = response.data;
      setFlag(!flag);
      setModal(null);
      showToast(data.message || "Rol eliminado correctamente.", "success");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Error al eliminar el rol";
      console.error("Error:", errorMessage);
      showToast(`No se pudo eliminar: ${errorMessage}`, "error");
    }
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
    showToast("Accesos actualizados localmente.", "success");
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
            animation: "fadeIn 0.3s ease-in-out",
          }}
        >
          <DynamicIcon
            name={
              toast.type === "success" ? "FiCheckCircle" : "FiAlertTriangle"
            }
          />
          <span>{toast.message}</span>
        </div>
      )}

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
          Roles y Sistemas
        </button>
      </div>

      {tab === "usuarios" && (
        <>
          <ToolbarFiltros
            {...{
              roles,
              sistemas,
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
            sistemas={sistemas}
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
      {modal?.tipo === "asignarRolModal" && (
        <ModalAsignarRol
          sistemas={sistemas}
          catRoles={catRoles}
          onSaveAsignar={asignarRolSistema}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.tipo === "rol" && (
        <ModalRol
          data={modal.data}
          sistemas={sistemas}
          catRoles={catRoles}
          roles={roles}
          onSaveCrear={guardarRol}
          onSaveOpciones={actualizarRolSistemaOpciones}
          onDelete={handleEliminarRol}
          onDeleteCat={async (rolId) => {
            if (
              !window.confirm(
                "¿Seguro que deseas eliminar este rol del catálogo?",
              )
            )
              return;
            try {
              const response = await axios.post(
                `${API_URL}/eliminarRolCat/${rolId}`,
                {},
                {
                  headers: { Authorization: `Bearer ${API_TOKEN}` },
                },
              );
              setFlag(!flag);
              setModal(null);
              showToast(
                response.data?.message || "Rol eliminado del catálogo.",
                "success",
              );
            } catch (err) {
              const msg = err.response?.data?.error || err.message;
              showToast(`Error al eliminar: ${msg}`, "error");
            }
          }}
          onClose={() => setModal(null)}
        />
      )}
    </SystemLayout>
  );
}

function ToolbarFiltros({
  roles,
  sistemas,
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
          <DynamicIcon
            name="FiSearch"
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "var(--merco-text, inherit)",
              opacity: 0.6,
              fontSize: 16,
            }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 32px",
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
          {sistemas.map((s, index) => (
            <option key={s.id ? `${s.id}-${index}` : index} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
        >
          <option value="">Todos los roles</option>
          {roles.map((r, index) => (
            <option key={r.id ? `${r.id}-${index}` : index} value={r.nombre}>
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
          <span>
            <DynamicIcon name="FiPlus" />
          </span>{" "}
          Nuevo usuario
        </button>
      )}
    </div>
  );
}

function AccesosChips({ accesos, sysMap }) {
  const ids = Object.keys(accesos);
  if (!ids.length) return <span className="access-chip none">Sin accesos</span>;
  return ids.map((sid) => {
    const s = sysMap[sid];
    if (!s) return null;
    return (
      <span className="access-chip" key={sid}>
        <span
          className="ci"
          style={{
            background: s.color || "#2f6fed",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DynamicIcon name={s.ic || "FiGrid"} fallback="FiGrid" />
        </span>
        {s.nombre} · <span className="role">{accesos[sid]}</span>
      </span>
    );
  });
}

function TabUsuariosYAccesos({
  usuariosFiltrados,
  rolesDeSistema,
  sistemas,
  setAccesoMatriz,
  setModal,
}) {
  const [expandidos, setExpandidos] = useState({});

  const sysMap = useMemo(() => {
    return Object.fromEntries(sistemas.map((s) => [s.id, s]));
  }, [sistemas]);

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
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <AccesosChips accesos={u.accesos} sysMap={sysMap} />
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
                            const rolActual = u.accesos[s.id] || "";
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
      <div className="ma-roles">
        {roles?.map((r, indexRol) => {
          const sistemasArr = Array.isArray(r.sistemas)
            ? r.sistemas
            : [r.sistemas];

          const permisosArray = Array.isArray(r.permisos) ? r.permisos : [];

          return (
            <div className="role-card" key={indexRol}>
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

              <h3>{r.nombre}</h3>

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
        })}
      </div>
    </>
  );
}

function ModalUsuario({ data, sistemas, onSave, onDelete, onClose }) {
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

function ModalAsignarRol({ sistemas, catRoles, onSaveAsignar, onClose }) {
  const [rolAsignarId, setRolAsignarId] = useState("");
  const [sistemaAsignarId, setSistemaAsignarId] = useState("");

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div
        className="ma-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 500 }}
      >
        <div className="ma-modal-head">
          <h3>Asignar Rol</h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          className="ma-modal-body"
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div className="field">
            <label>Seleccionar Rol</label>
            <select
              value={rolAsignarId}
              onChange={(e) => setRolAsignarId(e.target.value)}
            >
              <option value="">Selecciona un rol...</option>
              {catRoles.map((r, index) => (
                <option key={r.id ? `${r.id}-${index}` : index} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Seleccionar Sistema Destino</label>
            <select
              value={sistemaAsignarId}
              onChange={(e) => setSistemaAsignarId(e.target.value)}
            >
              <option value="">Selecciona un sistema...</option>
              {sistemas?.map((s, index) => (
                <option key={s.id ? `${s.id}-${index}` : index} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "16px 20px",
            borderTop:
              "1px solid var(--merco-border, rgba(255, 255, 255, 0.08))",
            gap: 8,
          }}
        >
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={!rolAsignarId || !sistemaAsignarId}
            onClick={() =>
              onSaveAsignar({
                rolId: rolAsignarId,
                sistemaId: sistemaAsignarId,
              })
            }
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalRol({
  data,
  sistemas,
  catRoles,
  roles,
  onSaveCrear,
  onSaveOpciones,
  onDelete,
  onClose,
  onDeleteCat,
}) {
  const editar = !!data;
  const [modalTab, setModalTab] = useState(editar ? "permisos" : "crear");

  const [nombreRol, setNombreRol] = useState("");
  const [mostrarSugerenciasCrear, setMostrarSugerenciasCrear] = useState(false);

  const [rolEditarId, setRolEditarId] = useState("");
  const [nuevoNombreRol, setNuevoNombreRol] = useState("");

  const [rolEliminarId, setRolEliminarId] = useState("");

  const rolesFiltradosCrear = useMemo(() => {
    if (!nombreRol.trim()) return [];
    return catRoles.filter((r) =>
      r.nombre.toLowerCase().includes(nombreRol.toLowerCase()),
    );
  }, [nombreRol, catRoles]);

  const handleSelectRolEditar = (e) => {
    const id = e.target.value;
    setRolEditarId(id);
    const rolEncontrado = catRoles.find((r) => String(r.id) === String(id));
    setNuevoNombreRol(rolEncontrado ? rolEncontrado.nombre : "");
  };

  const sistemasVinculadosCat = useMemo(() => {
    if (!rolEliminarId) return [];
    return roles.filter((r) => Number(r.rol_id) === Number(rolEliminarId));
  }, [rolEliminarId, roles]);

  const estaVinculadoCat = sistemasVinculadosCat.length > 0;

  // Filtrar opciones duplicadas utilizando un Set basado en su ID o nombre
  const opcionesDelSistema = useMemo(() => {
    const sys = sistemas.find(
      (s) => s.id === data?.sistema_id || s.nombre === data?.sistemas,
    );
    if (!sys || !sys.opciones) return [];

    const unicos = [];
    const idsVistos = new Set();
    for (const op of sys.opciones) {
      const key = op.id !== undefined ? op.id : op.opcion;
      if (!idsVistos.has(key)) {
        idsVistos.add(key);
        unicos.push(op);
      }
    }
    return unicos;
  }, [sistemas, data]);

  const [opcionIdsSeleccionados, setOpcionIdsSeleccionados] = useState(
    data?.opcion_ids || [],
  );

  const toggleCheckbox = (opcionId) => {
    setOpcionIdsSeleccionados((prev) =>
      prev.includes(opcionId)
        ? prev.filter((id) => id !== opcionId)
        : [...prev, opcionId],
    );
  };

  const seleccionarTodos = () => {
    setOpcionIdsSeleccionados(opcionesDelSistema.map((o) => o.id));
  };

  const deseleccionarTodos = () => {
    setOpcionIdsSeleccionados([]);
  };

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div
        className="ma-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 600 }}
      >
        <div className="ma-modal-head">
          <h3>
            {editar
              ? `Editar Permisos: ${data.nombre} (${data.sistemas || ""})`
              : "Gestión de Roles"}
          </h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        {!editar ? (
          <div
            style={{
              display: "flex",
              borderBottom:
                "1px solid var(--merco-border, rgba(255, 255, 255, 0.08))",
              padding: "0 20px",
              background: "var(--merco-bg-subtle, rgba(255, 255, 255, 0.01))",
              overflowX: "auto",
            }}
          >
            <button
              type="button"
              onClick={() => setModalTab("crear")}
              style={{
                padding: "10px 14px",
                background: "transparent",
                border: "none",
                borderBottom:
                  modalTab === "crear"
                    ? "2px solid var(--merco-accent, #2f6fed)"
                    : "2px solid transparent",
                color:
                  modalTab === "crear"
                    ? "var(--merco-text, #fff)"
                    : "var(--merco-muted, #888)",
                fontWeight: modalTab === "crear" ? 600 : 400,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              1.- Crear Rol
            </button>
            <button
              type="button"
              onClick={() => setModalTab("editarNombre")}
              style={{
                padding: "10px 14px",
                background: "transparent",
                border: "none",
                borderBottom:
                  modalTab === "editarNombre"
                    ? "2px solid var(--merco-accent, #2f6fed)"
                    : "2px solid transparent",
                color:
                  modalTab === "editarNombre"
                    ? "var(--merco-text, #fff)"
                    : "var(--merco-muted, #888)",
                fontWeight: modalTab === "editarNombre" ? 600 : 400,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              2.- Editar Nombre
            </button>
            <button
              type="button"
              onClick={() => setModalTab("eliminarCat")}
              style={{
                padding: "10px 14px",
                background: "transparent",
                border: "none",
                borderBottom:
                  modalTab === "eliminarCat"
                    ? "2px solid var(--merco-accent, #2f6fed)"
                    : "2px solid transparent",
                color:
                  modalTab === "eliminarCat"
                    ? "var(--merco-text, #fff)"
                    : "var(--merco-muted, #888)",
                fontWeight: modalTab === "eliminarCat" ? 600 : 400,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              3.- Eliminar Rol
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: "12px 20px",
              borderBottom:
                "1px solid var(--merco-border, rgba(255, 255, 255, 0.08))",
              background: "var(--merco-bg-subtle, rgba(255, 255, 255, 0.01))",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--merco-text)",
            }}
          >
            Opciones del Rol
          </div>
        )}

        <div className="ma-modal-body">
          {modalTab === "permisos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--merco-text)",
                  }}
                >
                  Seleccione las opciones y permisos activos para este sistema:
                </label>
                {opcionesDelSistema.length > 0 && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                      userSelect: "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      ref={(el) => {
                        if (el) {
                          el.indeterminate =
                            opcionIdsSeleccionados.length > 0 &&
                            opcionIdsSeleccionados.length < opcionesDelSistema.length;
                        }
                      }}
                      checked={
                        opcionesDelSistema.length > 0 &&
                        opcionIdsSeleccionados.length === opcionesDelSistema.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          seleccionarTodos();
                        } else {
                          deseleccionarTodos();
                        }
                      }}
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: "var(--merco-accent, #2f6fed)",
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ color: "var(--merco-text)" }}>Seleccionar todos</span>
                  </label>
                )}
              </div>

              {opcionesDelSistema.length === 0 ? (
                <p
                  style={{
                    color: "var(--merco-muted)",
                    fontSize: 13,
                    textAlign: "center",
                    padding: 20,
                  }}
                >
                  Este sistema no tiene opciones registradas.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 10,
                    maxHeight: 260,
                    overflowY: "auto",
                    padding: 4,
                  }}
                >
                  {opcionesDelSistema.map((opcion) => {
                    const isChecked = opcionIdsSeleccionados.includes(
                      opcion.id,
                    );
                    return (
                      <label
                        key={opcion.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 6,
                          border: isChecked
                            ? "1px solid var(--merco-accent, #2f6fed)"
                            : "1px solid var(--merco-border, #333)",
                          background: isChecked
                            ? "rgba(47, 111, 237, 0.08)"
                            : "var(--merco-bg-subtle, rgba(255,255,255,0.02))",
                          cursor: "pointer",
                          fontSize: 13,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheckbox(opcion.id)}
                          style={{
                            width: 16,
                            height: 16,
                            accentColor: "var(--merco-accent, #2f6fed)",
                            cursor: "pointer",
                          }}
                        />
                        <span
                          style={{
                            userSelect: "none",
                            color: "var(--merco-text)",
                          }}
                        >
                          {opcion.opcion}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {modalTab === "crear" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field" style={{ position: "relative" }}>
                <label>Nombre del Nuevo Rol</label>
                <input
                  value={nombreRol}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNombreRol(val);
                    setMostrarSugerenciasCrear(val.trim() !== "");
                  }}
                  onFocus={() => {
                    if (nombreRol.trim()) setMostrarSugerenciasCrear(true);
                  }}
                  placeholder="Ej. Analista"
                />
                {mostrarSugerenciasCrear && rolesFiltradosCrear.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 100,
                      background: "var(--merco-bg, #1a1a1a)",
                      border: "1px solid var(--merco-border, #333)",
                      borderRadius: 6,
                      maxHeight: 180,
                      overflowY: "auto",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      marginTop: 4,
                    }}
                  >
                    {rolesFiltradosCrear.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          setNombreRol(r.nombre);
                          setMostrarSugerenciasCrear(false);
                        }}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: 13,
                          borderBottom: "1px solid var(--merco-border, #222)",
                          color: "var(--merco-text, #fff)",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background =
                            "rgba(47, 111, 237, 0.15)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "transparent")
                        }
                      >
                        {r.nombre}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {modalTab === "editarNombre" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field">
                <label>Seleccionar Rol a Editar</label>
                <select value={rolEditarId} onChange={handleSelectRolEditar}>
                  <option value="">Selecciona un rol...</option>
                  {catRoles.map((r, index) => (
                    <option
                      key={r.id ? `${r.id}-${index}` : index}
                      value={r.id}
                    >
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {rolEditarId && (
                <div className="field">
                  <label>Nuevo Nombre del Rol</label>
                  <input
                    value={nuevoNombreRol}
                    onChange={(e) => setNuevoNombreRol(e.target.value)}
                    placeholder="Escribe el nuevo nombre..."
                  />
                </div>
              )}
            </div>
          )}

          {modalTab === "eliminarCat" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  color: "var(--merco-muted)",
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                Selecciona un rol del catálogo general. Solo se permitirá
                eliminarlo si <b>no se encuentra vinculado a ningún sistema</b>.
              </div>

              <div className="field">
                <label>Seleccionar Rol a Eliminar</label>
                <select
                  value={rolEliminarId}
                  onChange={(e) => setRolEliminarId(e.target.value)}
                >
                  <option value="">Selecciona un rol...</option>
                  {catRoles.map((r, index) => (
                    <option
                      key={r.id ? `${r.id}-${index}` : index}
                      value={r.id}
                    >
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {rolEliminarId && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    background: estaVinculadoCat
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgba(16, 185, 129, 0.1)",
                    border: `1px solid ${estaVinculadoCat ? "#ef4444" : "#10b981"}`,
                    fontSize: 13,
                  }}
                >
                  {estaVinculadoCat ? (
                    <span style={{ color: "#ef4444" }}>
                      ⚠️ Este rol está vinculado a{" "}
                      {sistemasVinculadosCat.length} sistema(s).{" "}
                      <b>No se puede eliminar.</b>
                    </span>
                  ) : (
                    <span style={{ color: "#10b981" }}>
                      Este rol no está vinculado a ningún sistema. Puede
                      proceder con la eliminación.
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: editar ? "space-between" : "flex-end",
            alignItems: "center",
            padding: "16px 20px",
            borderTop:
              "1px solid var(--merco-border, rgba(255, 255, 255, 0.08))",
          }}
        >
          {editar && (
            <button
              type="button"
              className="btn btn-danger"
              disabled={opcionIdsSeleccionados.length > 0}
              style={{
                backgroundColor:
                  opcionIdsSeleccionados.length > 0 ? "#6c757d" : "#dc3545",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: 6,
                cursor:
                  opcionIdsSeleccionados.length > 0 ? "not-allowed" : "pointer",
                fontSize: 13,
              }}
              title={
                opcionIdsSeleccionados.length > 0
                  ? "No se puede eliminar porque tiene opciones asociadas"
                  : "Eliminar rol de este sistema"
              }
              onClick={() => onDelete(data.id)}
            >
              Eliminar rol de {data.sistemas }
            </button>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>

            {modalTab === "permisos" ? (
              <button
                className="btn btn-primary"
                onClick={() =>
                  onSaveOpciones({
                    rolSistemaId: data.id,
                    opcionIds: opcionIdsSeleccionados,
                  })
                }
              >
                Guardar permisos
              </button>
            ) : modalTab === "crear" ? (
              <button
                className="btn btn-primary"
                disabled={!nombreRol.trim()}
                onClick={() =>
                  onSaveCrear({ id: null, nombre: nombreRol, permisos: [] })
                }
              >
                Crear rol
              </button>
            ) : modalTab === "editarNombre" ? (
              <button
                className="btn btn-primary"
                disabled={!rolEditarId || !nuevoNombreRol.trim()}
                onClick={() =>
                  onSaveCrear({ id: rolEditarId, nombre: nuevoNombreRol })
                }
              >
                Guardar cambios
              </button>
            ) : (
              <button
                className="btn btn-danger"
                disabled={!rolEliminarId || estaVinculadoCat}
                style={{
                  backgroundColor: estaVinculadoCat ? "#6c757d" : "#dc3545",
                  color: "#fff",
                  border: "none",
                }}
                onClick={() => onDeleteCat(rolEliminarId)}
              >
                Eliminar rol
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}