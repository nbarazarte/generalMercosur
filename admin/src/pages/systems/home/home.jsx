import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import TextType from "../../components/TextType";
import { DynamicIcon } from "../../components/IconCatalog";

export const MainAside = () => {
  // Suscripción al estado de Redux
  const user = useSelector((state) => state.auth?.user);
  const nombre = user?.nombre;

  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Buenos días";
    if (hora >= 12 && hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="aside-content">
      <h1>
        <TextType
          text={`${getSaludo()}, \n ${nombre}`}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor
          cursorCharacter="_"
          loop={false}
          deletingSpeed={50}
          cursorBlinkDuration={0.5}
          // Si en el futuro quieres velocidad variable, el componente espera esto:
          // variableSpeed={{ min: 60, max: 120 }}
        />
      </h1>
      <p className="subtitle">
        Accede a todos los sistemas de Mercosur Enterprise Portal desde un solo
        lugar.
      </p>

      <div className="feature-list">
        <div className="feature-item">
          <div className="feature-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="feature-text">
            <p>Acceso seguro</p>
            <p>Autenticación centralizada</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
            </svg>
          </div>
          <div className="feature-text">
            <p>Todo en un panel</p>
            <p>Cambia de sistema al instante</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mantiene compatibilidad con el código anterior por si lo llamas como getMainAside()
export const getMainAside = () => <MainAside />;

const Home = () => {
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth?.user);

  const sistemasOpciones = user?.sistemasOpciones || [];

  const sistemas = sistemasOpciones.map((sistema) => ({
    id: sistema.id,
    nombre: sistema.sistema,
    descripcion: sistema.descripcion,
    url: sistema.ruta_sistema,
    icon: sistema.icono,
  }));

  //console.log("Sistemas desde Redux:", sistemas);

  // Fallback en cascada: Redux -> localStorage -> "Usuario"
  const usuario = user?.username;

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem("theme") ||
      (document.documentElement.classList.contains("dark") ? "dark" : "light")
    );
  });

  useEffect(() => {
    // Sincroniza la clase en <html>
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", theme);

    // Escucha si otra parte de la app cambia la clase en <html>
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [theme]);

  return (
    <div className="systems-wrapper">
      <div className="form-header text-center flex flex-col items-center justify-center w-full">
        <h2>Menú de Sistemas</h2>
        <p className="subtitle">¿A cuál deseas acceder, {usuario}?</p>
      </div>

      <div className="systems-grid">
        {sistemas.map((sistema, i) => (
          <div
            key={sistema.id ? `${sistema.id}-${i}` : i}
            onClick={() => navigate(sistema.url)}
            className="system-card glass-card animate-rise"
            style={{ animationDelay: `${i * 0.08}s`, cursor: "pointer" }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(sistema.url);
              }
            }}
          >
            <div className="system-icon">
              <DynamicIcon name={sistema.icon} />
            </div>
            <div className="system-info">
              <h3>{sistema.nombre}</h3>
              <p>{sistema.descripcion}</p>
            </div>
            <span className="system-arrow" aria-hidden="true">
              <DynamicIcon name="FiArrowRight" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
