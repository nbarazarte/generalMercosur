import { useEffect, useMemo, useState } from "react";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon, IconPicker } from "../../components/IconCatalog";
import { useSelector, useDispatch } from "react-redux";

// Instancias de Axios personalizadas según tu estructura de carpetas
import axiosAdmin from "../../utils/axiosAdmin";
import axiosSeguridad from "../../utils/axiosSeguridad";

import { setSistemasOpciones } from "../../../store/authSlice";

/* ============================ COMPONENTE PRINCIPAL ============================ */
export default function Sistemas() {
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [sistemas, setSistemas] = useState([]);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const token = useSelector((state) => state.auth?.token);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Función reutilizable para obtener los sistemas de la API principal
  const fetchSistemasGlobales = async () => {
    try {
      if (!token) {
        throw new Error("Falta el token de sesión.");
      }

      const response = await axiosAdmin.get(`/fetchSistemas`);

      const sistemasObtenidos = response.data.sistemas || [];

      setSistemas(sistemasObtenidos);
    } catch (error) {
      const isNetworkError =
        error.message === "Network Error" || !error.response;

      const errorMessage =
        (typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message) ||
        (isNetworkError && error.message !== "Falta el token de sesión."
          ? "No hay conexión con el servidor."
          : error.message);

      console.error("Error al cargar sistemas:", errorMessage);
      showToast(`Error al cargar los sistemas: ${errorMessage}`, "error");
    }
  };

  // Función opcional para refrescar el estado de Redux de las opciones del usuario
  const fetchSistemasUsuario = async () => {
    if (!user?.id || !token) return;
    try {
      const response = await axiosSeguridad.get(
        `/sistemas-opciones/${user.id}`,
      );

      if (response.data) {
        const datosActualesJSON = JSON.stringify(user?.sistemasOpciones || []);
        const datosNuevosJSON = JSON.stringify(response.data);

        if (datosActualesJSON !== datosNuevosJSON) {
          dispatch(setSistemasOpciones(response.data));
        }
      }
    } catch (err) {
      console.error("Error obteniendo sistemas y opciones del usuario:", err);
    }
  };

  // 1. Carga inicial de datos globales
  useEffect(() => {
    if (token) {
      fetchSistemasGlobales();
    }
  }, [token]);

  // 2. Sincronización secundaria con Redux/API de seguridad local al cargar usuario
  useEffect(() => {
    if (token) {
      fetchSistemasUsuario();
    }
  }, [user?.id, token]);

  const totalOpciones = useMemo(
    () => sistemas.reduce((acc, sys) => acc + (sys.opciones?.length || 0), 0),
    [sistemas],
  );

  const handleGuardarSistema = async (sistemaData) => {
    try {
      if (!token) {
        throw new Error("Falta el token de sesión.");
      }

      // 1. Actualización optimista local (evita parpadeo de íconos/datos)
      setSistemas((prevSistemas) => {
        if (sistemaData.id) {
          return prevSistemas.map((sys) =>
            sys.id === sistemaData.id ? { ...sys, ...sistemaData } : sys,
          );
        }
        return prevSistemas;
      });

      setModal(null);

      // 2. Envío a la API
      const response = await axiosAdmin.post(`/guardarSistema`, sistemaData);

      const { sistema: sistemaProcesado, esEdicion, message } = response.data;

      // 3. Sincronización backend en segundo plano
      await fetchSistemasGlobales();
      await fetchSistemasUsuario();

      const mensajeExito =
        message ||
        (esEdicion
          ? "Sistema actualizado exitosamente."
          : "Sistema creado exitosamente.");

      showToast(mensajeExito, "success");
      return { success: true, data: sistemaProcesado, message: mensajeExito };
    } catch (error) {
      // Revertir en caso de error pidiendo el estado real del backend
      await fetchSistemasGlobales();

      const isNetworkError =
        error.message === "Network Error" || !error.response;

      const errorMessage =
        (typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.error || error.response?.data?.message) ||
        (isNetworkError && error.message !== "Falta el token de sesión.")
          ? "No hay conexión con el servidor."
          : error.message;

      console.error("Error al guardar sistema:", errorMessage);
      showToast(`Error: ${errorMessage}`, "error");
      return { success: false, error: errorMessage };
    }
  };

  const eliminarSistema = async (id) => {
    try {
      if (!token) {
        throw new Error("Falta el token de sesión.");
      }

      // Actualización optimista
      setSistemas((prev) => prev.filter((s) => s.id !== id));
      setModal(null);

      const response = await axiosAdmin.delete(`/eliminarSistema/${id}`);

      await fetchSistemasGlobales();
      await fetchSistemasUsuario();

      showToast(
        response.data.message || "Sistema eliminado correctamente.",
        "success",
      );
    } catch (error) {
      await fetchSistemasGlobales();

      const isNetworkError =
        error.message === "Network Error" || !error.response;

      const errorMessage =
        (typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.error || error.response?.data?.message) ||
        (isNetworkError && error.message !== "Falta el token de sesión."
          ? "No hay conexión con el servidor."
          : error.message);

      console.error("Error al eliminar sistema:", errorMessage);
      showToast(`Error al eliminar: ${errorMessage}`, "error");
    }
  };

  const guardarOpcionSistema = async (sistemaId, opcionData) => {
    try {
      if (!token) {
        throw new Error("Falta el token de sesión.");
      }

      // 1. Actualización optimista de la opción e ícono en pantalla
      setSistemas((prevSistemas) =>
        prevSistemas.map((sys) => {
          if (sys.id !== sistemaId) return sys;

          const opcionesActuales = sys.opciones || [];
          const existe = opcionesActuales.some((o) => o.id === opcionData.id);

          const nuevasOpciones = existe
            ? opcionesActuales.map((o) =>
                o.id === opcionData.id ? { ...o, ...opcionData } : o,
              )
            : [...opcionesActuales, opcionData];

          return { ...sys, opciones: nuevasOpciones };
        }),
      );

      setModal(null);

      const payload = {
        id: opcionData.id,
        sistemaId: sistemaId,
        opcion: opcionData.opcion,
        ruta_opcion: opcionData.ruta_opcion,
        ic: opcionData.ic,
      };

      // 2. Envío a la API
      const response = await axiosAdmin.post(`/guardarOpcion`, payload);

      // 3. Sincronización en segundo plano
      await fetchSistemasGlobales();
      await fetchSistemasUsuario();

      showToast(
        response.data.message || "Opción guardada correctamente.",
        "success",
      );
    } catch (error) {
      await fetchSistemasGlobales();

      const isNetworkError =
        error.message === "Network Error" || !error.response;

      const errorMessage =
        (typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.error || error.response?.data?.message) ||
        (isNetworkError && error.message !== "Falta el token de sesión."
          ? "No hay conexión con el servidor."
          : error.message);

      console.error("Error al guardar opción:", errorMessage);
      showToast(`Error: ${errorMessage}`, "error");
    }
  };

  const eliminarOpcionSistema = async (sistemaId, opcionId) => {
    try {
      if (!token) {
        throw new Error("Falta el token de sesión.");
      }

      // Actualización optimista local
      setSistemas((prevSistemas) =>
        prevSistemas.map((sys) => {
          if (sys.id !== sistemaId) return sys;
          return {
            ...sys,
            opciones: (sys.opciones || []).filter((o) => o.id !== opcionId),
          };
        }),
      );

      const response = await axiosAdmin.delete(`/eliminarOpcion/${opcionId}`);

      await fetchSistemasGlobales();
      await fetchSistemasUsuario();

      showToast(
        response.data.message || "Opción eliminada correctamente.",
        "success",
      );
    } catch (error) {
      await fetchSistemasGlobales();

      const isNetworkError =
        error.message === "Network Error" || !error.response;

      const errorMessage =
        (typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.error || error.response?.data?.message) ||
        (isNetworkError && error.message !== "Falta el token de sesión."
          ? "No hay conexión con el servidor."
          : error.message);

      console.error("Error al eliminar opción:", errorMessage);
      showToast(`Error al eliminar: ${errorMessage}`, "error");
    }
  };

  return (
    <SystemLayout identificacion="Administración General">
      {/* NOTIFICACIÓN TOAST */}
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
            Sistemas
          </h2>
        </div>
      </div>

      <div className="ma-stats">
        <div className="ma-stat">
          <div className="lbl">Sistemas Registrados</div>
          <div className="val">{sistemas.length}</div>
          <span className="chip chip-flat">módulos activos</span>
        </div>
        <div className="ma-stat">
          <div className="lbl">Total Opciones de Menú</div>
          <div className="val">{totalOpciones}</div>
          <span className="chip chip-flat">rutas configuradas</span>
        </div>
      </div>

      <div className="ma-toolbar" style={{ marginTop: 20 }}>
        <div style={{ color: "var(--merco-muted)", fontSize: 14 }}>
          Administra los sistemas registrados y gestiona las opciones de
          navegación (rutas) de cada uno.
        </div>
        <button
          className="btn btn-accent"
          onClick={() => setModal({ tipo: "sistema", data: null })}
        >
          <span>
            <DynamicIcon name="FiPlus" />
          </span>{" "}
          Nuevo Sistema
        </button>
      </div>

      <div
        className="ma-roles"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {sistemas.map((sys) => (
          <div className="role-card" key={sys.id || sys.nombre}>
            <div className="rc-top">
              <div
                className="role-ic"
                style={{
                  background: sys.color + "22",
                  color: sys.color,
                  fontSize: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DynamicIcon name={sys.ic} />
              </div>
              <button
                className="btn-icon"
                title="Editar sistema"
                onClick={() => setModal({ tipo: "sistema", data: sys })}
              >
                <DynamicIcon name="FiEdit" />
              </button>
            </div>
            <h3>{sys.nombre}</h3>

            <span
              style={{
                background: sys.color + "22",
                color: sys.color,
                fontSize: 12,
                display: "flex",
                alignItems: "left",
                justifyContent: "left",
                borderRadius: "6px",
                padding: "6px",
              }}
            >
              {sys.desc}
            </span>

            <div
              style={{
                marginTop: 16,
                borderTop: "1px dashed var(--merco-border)",
                paddingTop: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <b style={{ fontSize: 13 }}>
                  Opciones / Rutas ({sys.opciones?.length || 0})
                </b>
                <button
                  className="btn btn-ghost"
                  style={{ padding: "2px 8px", fontSize: 12 }}
                  onClick={() =>
                    setModal({ tipo: "opcion", sistema: sys, data: null })
                  }
                >
                  + Agregar Opción
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sys.opciones && sys.opciones.length > 0 ? (
                  sys.opciones.map((opc, idx) => (
                    <div
                      key={opc.id ? `${opc.id}-${idx}` : idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background:
                          "var(--merco-bg-subtle, rgba(255, 255, 255, 0.05))",
                        border:
                          "1px solid var(--merco-border, rgba(255, 255, 255, 0.1))",
                        color: "var(--merco-text, inherit)",
                        padding: "8px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ display: "flex", fontSize: 16 }}>
                          <DynamicIcon name={opc.ic} fallback="FiGrid" />
                        </span>
                        <div>
                          <div
                            style={{
                              color: "var(--merco-text, currentColor)",
                              fontWeight: 600,
                            }}
                          >
                            {opc.opcion}
                          </div>
                          <code
                            style={{
                              fontSize: 11,
                              color: "var(--merco-muted, #888)",
                            }}
                          >
                            {opc.ruta_opcion}
                          </code>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          className="btn-icon"
                          style={{ padding: 2, cursor: "pointer" }}
                          title="Editar opción"
                          onClick={() =>
                            setModal({
                              tipo: "opcion",
                              sistema: sys,
                              data: opc,
                            })
                          }
                        >
                          <DynamicIcon name="FiEdit" />
                        </button>
                        <button
                          className="btn-icon danger"
                          style={{ padding: 2, cursor: "pointer" }}
                          title="Eliminar opción"
                          onClick={() => {
                            if (
                              window.confirm(
                                `¿Seguro que deseas quitar la opción "${opc.opcion}" de ${sys.nombre}?`,
                              )
                            ) {
                              eliminarOpcionSistema(sys.id, opc.id);
                            }
                          }}
                        >
                          <DynamicIcon name="FiTrash2" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--merco-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    Sin opciones de menú registradas.
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal?.tipo === "sistema" && (
        <ModalSistema
          data={modal.data}
          onSave={handleGuardarSistema}
          onDelete={(id) => {
            if (
              window.confirm(
                "¿Seguro que deseas eliminar este sistema completo y todas sus opciones?",
              )
            ) {
              eliminarSistema(id);
            }
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.tipo === "opcion" && (
        <ModalOpcion
          sistema={modal.sistema}
          data={modal.data}
          onSave={(opc) => guardarOpcionSistema(modal.sistema.id, opc)}
          onClose={() => setModal(null)}
        />
      )}
    </SystemLayout>
  );
}

/* MODAL CREAR / EDITAR SISTEMA */
function ModalSistema({ data, onSave, onDelete, onClose }) {
  const editar = !!data;
  const [ruta, setRuta] = useState(data?.ruta || "");
  const [nombre, setNombre] = useState(data?.nombre || "");
  const [desc, setDesc] = useState(data?.desc || "");
  const [ic, setIc] = useState(data?.ic || "FiSettings");
  const [color, setColor] = useState(data?.color || "#2f6fed");

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-modal-head">
          <h3>{editar ? "Editar sistema" : "Nuevo sistema"}</h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ma-modal-body">
          <div className="field-row">
            <div className="field">
              <label>Nombre del sistema</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="ej. Control de Inventario"
              />
            </div>

            <div className="field">
              <label>Ruta del sistema</label>
              <input
                value={ruta}
                onChange={(e) =>
                  setRuta(
                    e.target.value
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9/_-]/g, ""),
                  )
                }
                placeholder="ej. /sistema"
              />
            </div>
          </div>

          <div className="field">
            <label>Descripción</label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Descripción corta de la función del módulo"
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
              Seleccionar Ícono del Sistema:
              <span style={{ fontSize: 18, display: "inline-flex" }}>
                <DynamicIcon name={ic} />
              </span>
            </label>
            <IconPicker value={ic} onChange={setIc} />
          </div>

          <div className="field">
            <label>Color distintivo</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ height: 40, cursor: "pointer", width: "100%" }}
            />
          </div>
        </div>
        <div className="ma-modal-foot">
          {editar && nombre !== "Administración General" && (
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
            disabled={!nombre || !ruta || !desc || !ic || !color}
            onClick={() =>
              onSave({
                id: data?.id,
                ruta,
                nombre,
                desc,
                ic,
                color,
                opciones: data?.opciones || [],
              })
            }
          >
            {editar ? "Guardar cambios" : "Crear sistema"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* MODAL CREAR / EDITAR OPCIÓN */
function ModalOpcion({ sistema, data, onSave, onClose }) {
  const editar = !!data;
  const [opcion, setOpcion] = useState(data?.opcion || "");
  const [ruta, setRuta] = useState(data?.ruta_opcion || "");
  const [ic, setIc] = useState(data?.ic || "FiGrid");

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-modal-head">
          <h3>
            {editar
              ? `Editar Opción de ${sistema?.nombre}`
              : `Nueva Opción para ${sistema?.nombre}`}
          </h3>
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
              placeholder="ej. Reportes de Ventas"
            />
          </div>
          <div className="field">
            <label>Ruta de Navegación (URL)</label>
            <input
              value={ruta}
              onChange={(e) => setRuta(e.target.value)}
              placeholder="ej. /inventario/reportes"
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
              Seleccionar Ícono de la Opción:
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
                id: data?.id,
                opcion,
                ruta_opcion: ruta,
                ic,
                tiene_permiso: data?.tiene_permiso ?? true,
              })
            }
          >
            {editar ? "Guardar Cambios" : "Agregar Opción"}
          </button>
        </div>
      </div>
    </div>
  );
}
