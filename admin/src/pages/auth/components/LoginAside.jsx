export const LoginAside = () => {
  return (
    <div className="aside-content">
      <h1>
        Mercosur
        <br />
        Enterprise Portal
      </h1>

      <p className="subtitle">Tu portal de acceso centralizado</p>

      <div className="feature-list">
        <div
          className="feature-item"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            width: "100%",
          }}
        >
          <div
            className="feature-icon"
            style={{
              flexShrink: 0,
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "100%", height: "100%" }}
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <div className="feature-text" style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, wordBreak: "break-word" }}>
              Acceso Unificado
            </p>
            <p style={{ margin: "4px 0 0 0", wordBreak: "break-word" }}>
              Conéctate a todas tus herramientas operativas desde un solo lugar
            </p>
          </div>
        </div>

        <div
          className="feature-item"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            width: "100%",
          }}
        >
          <div
            className="feature-icon"
            style={{
              flexShrink: 0,
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "100%", height: "100%" }}
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 17 22 12" />
            </svg>
          </div>
          <div className="feature-text" style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, wordBreak: "break-word" }}>
              Arquitectura Modular
            </p>
            <p style={{ margin: "4px 0 0 0", wordBreak: "break-word" }}>
              Capacidad de integrar nuevas herramientas, módulos y servicios
            </p>
          </div>
        </div>

        <div
          className="feature-item"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            width: "100%",
          }}
        >
          <div
            className="feature-icon"
            style={{
              flexShrink: 0,
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "100%", height: "100%" }}
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className="feature-text" style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, wordBreak: "break-word" }}>
              Diseño Adaptativo
            </p>
            <p style={{ margin: "4px 0 0 0", wordBreak: "break-word" }}>
              Experiencia fluida desde cualquier dispositivo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAside;
