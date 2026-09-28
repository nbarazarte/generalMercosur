import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import TextType from "../../components/TextType";
import { DynamicIcon } from "../../components/IconCatalog";
import { setSistemasOpciones } from "../../../store/authSlice"; // Importar la nueva acción

const API_URL = import.meta.env.VITE_URL_API_LOCAL_SEGURIDAD;
const API_TOKEN = import.meta.env.VITE_TOKEN;

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

export const getMainAside = () => <MainAside />;

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);

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

  // Carga de sistemas desde la API y sincronización con Redux
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const fetchSistemas = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/sistemas-opciones/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${user?.token || API_TOKEN}`,
            },
          },
        );

        if (isMounted && response.data) {
          // Comparamos si la respuesta devuelta por la API es exactamente igual a lo que ya está en Redux
          const datosActualesJSON = JSON.stringify(
            user?.sistemasOpciones || [],
          );
          const datosNuevosJSON = JSON.stringify(response.data);

          // SOLO despachamos si hay diferencias respecto al estado inicial/actual
          if (datosActualesJSON !== datosNuevosJSON) {
            // 1. Sincronizar Redux
            dispatch(setSistemasOpciones(response.data));

            // 2. Formatear para la grilla local
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
  }, [user?.id, user?.token, user?.sistemasOpciones, dispatch]);

  const usuario = user?.username;

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
            <div
              className="system-icon"
              style={{
                backgroundColor: sistema.color
                  ? `${sistema.color}22`
                  : "rgba(47, 111, 237, 0.15)",
                color: sistema.color || "#2f6fed",
              }}
            >
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
