import { DynamicIcon } from "./IconCatalog";

export default function SessionWarningModal({
    showWarning,
    timeLeft,
    onExtend,
    onLogout,
}) {
    if (!showWarning) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 99999,
            }}
        >
            <div
                style={{
                    background: "var(--merco-bg, #ffffff)",
                    color: "var(--merco-text, #333)",
                    padding: "24px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                    maxWidth: "400px",
                    width: "90%",
                    textAlign: "center",
                    border: "1px solid var(--merco-border, #e2e8f0)",
                }}
            >
                <h3
                    style={{
                        margin: "0 0 12px 0",
                        fontSize: "1.2rem",
                        color: "var(--merco-warning, #d8992a)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                    }}
                >
                    <DynamicIcon name="FiAlertTriangle" />
                    <span>Tu sesión está por expirar</span>
                </h3>
                <p
                    style={{
                        margin: "0 0 20px 0",
                        fontSize: "0.95rem",
                        lineHeight: 1.5,
                    }}
                >
                    Por motivos de seguridad, tu sesión caducará en{" "}
                    <b>{timeLeft} segundos</b> por inactividad. ¿Deseas mantenerla activa?
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                    <button
                        onClick={onExtend}
                        className="btn btn-primary"
                        style={{
                            padding: "8px 16px",
                            background: "#10b981",
                            border: "none",
                            color: "#fff",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        Sí, extender sesión
                    </button>
                    <button
                        onClick={onLogout}
                        className="btn btn-ghost"
                        style={{
                            padding: "8px 16px",
                            background: "#ef4444",
                            border: "none",
                            color: "#fff",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
