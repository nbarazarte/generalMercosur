import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../../components/IconCatalog";
import { useSistemas } from "../admin/hooks/useSistemas"; // Ajusta la ruta según donde guardes tu hook useSistemas
import { ModalSistema, ModalOpcion } from "./components/modales/SistemasModal"; // Ajusta la ruta según tus componentes SistemasModals

export default function Sistemas() {
  const {
    sistemas,
    modal,
    setModal,
    toast,
    totalOpciones,
    handleGuardarSistema,
    eliminarSistema,
    guardarOpcionSistema,
    eliminarOpcionSistema,
  } = useSistemas();

  return (
    <SystemLayout identificacion="Administración General" opcionMenu="Sistemas">
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
