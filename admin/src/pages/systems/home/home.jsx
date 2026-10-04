import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axiosSeguridad from "../../utils/axiosSeguridad";
import TextType from "../../components/TextType";
import { DynamicIcon } from "../../components/IconCatalog";
import { setSistemasOpciones } from "../../../store/authSlice";

export const MainAside = () => {
  const user = useSelector((state) => state.auth?.user);
  const nombre = user?.nombre;

  const saludo = useMemo(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Buenos días";
    if (hora >= 12 && hora < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  return (
    <div className="aside-content">
      <h1>
        <TextType
          text={`${saludo}, \n ${nombre}`}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor
          cursorCharacter="_"
          loop={false}
          deletingSpeed={50}
          cursorBlinkDuration={0.5}
        />
      </h1>
      <p className="subtitle">
        Accede a todos los sistemas de Mercosur Enterprise Portal
      </p>

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
              <polyline points="2 12 12 17 22 12" />
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

export const getMainAside = () => <MainAside />;

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const token = useSelector((state) => state.auth?.token);

  // Mapear sistemas de Redux
  const sistemasRedux = useMemo(() => {
    return (user?.sistemasOpciones || []).map((sistema) => ({
      id: sistema.id || sistema.sistema,
      nombre: sistema.sistema,
      descripcion: sistema.descripcion,
      url: sistema.ruta_sistema,
      icon: sistema.icono,
      color: sistema.color,
    }));
  }, [user?.sistemasOpciones]);

  const [sistemas, setSistemas] = useState(sistemasRedux);

  useEffect(() => {
    if (sistemasRedux.length > 0) {
      setSistemas(sistemasRedux);
    }
  }, [sistemasRedux]);

  // Carga de sistemas desde la API y sincronización con Redux
  useEffect(() => {
    if (!user?.id || !token) return;

    let isMounted = true;

    const fetchSistemas = async () => {
      try {
        const response = await axiosSeguridad.get(
          `/sistemas-opciones/${user.id}`,
        );

        if (isMounted && response.data) {
          const datosActualesJSON = JSON.stringify(
            user?.sistemasOpciones || [],
          );
          const datosNuevosJSON = JSON.stringify(response.data);

          if (datosActualesJSON !== datosNuevosJSON) {
            dispatch(setSistemasOpciones(response.data));

            const sistemasFormateados = response.data.map((sistema) => ({
              id: sistema.id || sistema.sistema,
              nombre: sistema.sistema,
              descripcion: sistema.descripcion,
              url: sistema.ruta_sistema,
              icon: sistema.icono,
              color: sistema.color,
            }));

            setSistemas(sistemasFormateados);
          }
        }
      } catch (err) {
        console.error("Error obteniendo sistemas y opciones:", err);
      }
    };

    fetchSistemas();

    return () => {
      isMounted = false;
    };
  }, [user?.id, token, user?.sistemasOpciones, dispatch]);

  // Manejo del tema (Light/Dark)
  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem("theme") ||
      (document.documentElement.classList.contains("dark") ? "dark" : "light")
    );
  });

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", theme);

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

  const usuario = user?.username;

  // Función encargada de redirigir según si la URL es absoluta o relativa
  const handleNavigate = (url) => {
    if (!url) return;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      window.location.href = url;
    } else {
      navigate(url);
    }
  };

  return (
    <div className="systems-wrapper w-full flex flex-col items-center">
      <div className="form-header text-center flex flex-col items-center justify-center w-full mb-6">
        <h2>Menú de Sistemas</h2>
        <p className="subtitle">¿A cuál deseas acceder, {usuario}?</p>
      </div>

      <div className="systems-grid grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto justify-center">
        {sistemas && sistemas.length > 0 ? (
          sistemas.map((sistema, i) => (
            <div
              key={sistema.id ? `${sistema.id}-${i}` : i}
              onClick={() => handleNavigate(sistema.url)}
              className="system-card glass-card animate-rise"
              style={{ animationDelay: `${i * 0.08}s`, cursor: "pointer" }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNavigate(sistema.url);
                }
              }}
            >
              <div
                className="system-icon"
                style={{
                  backgroundColor: sistema.color
                    ? `${sistema.color}22`
                    : "rgba(47, 111, 237, 0.15)",
                  color: sistema.color || "#2f6fed",
                }}
              >
                <DynamicIcon name={sistema.icon || "FiGrid"} />
              </div>

              <div className="system-info">
                <h3>{sistema.nombre}</h3>
                <p>{sistema.descripcion}</p>
              </div>
              <span className="system-arrow" aria-hidden="true">
                <DynamicIcon name="FiArrowRight" />
              </span>
            </div>
          ))
        ) : (
          <p className="text-center w-full text-gray-500 col-span-full">
            No hay sistemas disponibles para mostrar.
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
