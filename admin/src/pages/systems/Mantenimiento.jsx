import { useNavigate } from "react-router-dom";
import SystemLayout from "../layouts/SystemLayout";
import { DynamicIcon } from "../../components/IconCatalog";

export default function Mantenimiento() {
  const navigate = useNavigate();

  return (
    <SystemLayout identificacion="Sistema" opcionMenu="Mantenimiento">
      <div
        style={{
          fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
          padding: "20px 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 160px)",
        }}
      >
        <div
          className="ma-card"
          style={{
            maxWidth: "600px",
            width: "100%",
            padding: "40px 30px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          }}
        >
          {/* Contenedor del Icono con Anidación Visual */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(216, 153, 42, 0.15)",
              color: "var(--merco-warning, #d8992a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "38px",
              marginBottom: "10px",
            }}
          >
            <DynamicIcon name="FiAlertTriangle" fallback="FiSettings" />
          </div>

          {/* Títulos y Descripción */}
          <div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--merco-warning, #d8992a)",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Mantenimiento Programado
            </span>
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 700,
                color: "var(--merco-text)",
              }}
            >
              Sistema en Mantenimiento
            </h2>
            <p
              style={{
                margin: "12px 0 0 0",
                fontSize: "14px",
                color: "var(--merco-muted)",
                lineHeight: "1.6",
              }}
            >
              Estamos realizando labores de optimización y actualización en los
              servidores de la plataforma. El servicio se reestablecerá pronto.
            </p>
          </div>

          {/* Tarjeta de estado / Tiempo estimado */}
          <div
            style={{
              width: "100%",
              background: "var(--merco-bg-subtle, rgba(255, 255, 255, 0.03))",
              border: "1px solid var(--merco-border)",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <div>
              <small
                style={{
                  display: "block",
                  color: "var(--merco-muted)",
                  fontSize: "11px",
                }}
              >
                ESTADO
              </small>
              <b
                style={{
                  color: "var(--merco-warning, #d8992a)",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                ● En progreso
              </b>
            </div>
            <div
              style={{
                width: "1px",
                height: "30px",
                background: "var(--merco-border)",
              }}
            />
            <div>
              <small
                style={{
                  display: "block",
                  color: "var(--merco-muted)",
                  fontSize: "11px",
                }}
              >
                REESTABLECIMIENTO
              </small>
              <b style={{ color: "var(--merco-text)", fontSize: "13px" }}>
                En breves minutos
              </b>
            </div>
          </div>

          {/* Botón de redirección a /home */}
          <button
            className="btn btn-accent"
            onClick={() => navigate("/home")}
            style={{
              marginTop: "10px",
              padding: "10px 24px",
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <DynamicIcon name="FiHome" />
            Volver al Inicio
          </button>
        </div>
      </div>
    </SystemLayout>
  );
}
