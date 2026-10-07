import React, { useState, useMemo, useEffect } from "react";
import ReactDOM from "react-dom";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../components/IconCatalog";


/* ====== CONSTANTES Y VALORES DE CONFIGURACIÓN ====== */
const TIPOS_PERSONA = ["Natural", "Jurídica"];
const ESTADOS_EXPEDIENTE = ["Aprobado", "Pendiente", "En Revisión", "Rechazado"];
const NIVELES_RIESGO = ["Bajo", "Medio", "Alto"];

/* ====== PESTAÑAS CONFIGURADAS PARA LA FICHA ====== */
const TABS = [
  { id: "identificacion", label: "Identificación", icon: "FiUser" },
  { id: "documentos", label: "Doc. Legales", icon: "FiFileText" },
  { id: "recaudos", label: "Recaudos", icon: "FiFolder" },
  { id: "operativos", label: "Operativos", icon: "FiShield" },
  { id: "soportes", label: "Soportes", icon: "FiPaperclip" },
];

/* ====== DATOS DE EJEMPLO DE EXPEDIENTES ====== */
const EXPEDIENTES_INIT = [
  {
    id: "EXP-1001",
    cedula: "V-12.345.678",
    nombre: "José Rodríguez",
    tipoPersona: "Natural",
    correo: "jrodriguez@correo.com",
    tel: "+58 412-1234567",
    estado: "Aprobado",
    riesgo: "Bajo",
    ejecutivo: "Eleany 1",
    ultimaActualizacion: new Date("2026-09-24T10:15:00"),
    documentosCompletos: 10,
    documentosTotales: 10,
    f_ingreso: "2026-01-15",
    est_colaborador: "Activo",
    creado_por: "Ana Rodríguez",
    f_creacion: "2026-01-15",
    ci: "SI",
    f_venc_ci: "2029-01-15",
    rif: "SI",
    f_venc_rif: "2029-01-15",
    contrato: "SI",
    f_venc_contrato: "2027-06-30",
  },
  {
    id: "EXP-1002",
    cedula: "V-15.987.654",
    nombre: "María Gómez",
    tipoPersona: "Natural",
    correo: "mgomez@correo.com",
    tel: "+58 414-9876543",
    estado: "Pendiente",
    riesgo: "Medio",
    ejecutivo: "Maria J 2",
    ultimaActualizacion: new Date("2026-09-23T14:20:00"),
    documentosCompletos: 7,
    documentosTotales: 10,
    f_ingreso: "2026-03-10",
    est_colaborador: "Activo",
    creado_por: "Ana Rodríguez",
    f_creacion: "2026-03-10",
    ci: "SI",
    f_venc_ci: "2028-06-01",
    rif: "SI",
    f_venc_rif: "2026-10-15",
    contrato: "NO",
    f_venc_contrato: "",
  },
  {
    id: "EXP-1003",
    cedula: "J-30981234-0",
    nombre: "Inversiones Mercantil C.A.",
    tipoPersona: "Jurídica",
    correo: "contacto@inversionesmercantil.com",
    tel: "+58 212-5551020",
    estado: "En Revisión",
    riesgo: "Alto",
    ejecutivo: "Andrea 3",
    ultimaActualizacion: new Date("2026-09-22T09:00:00"),
    documentosCompletos: 12,
    documentosTotales: 15,
    f_ingreso: "2025-11-01",
    est_colaborador: "Activo",
    creado_por: "Carlos Méndez",
    f_creacion: "2025-11-01",
  },
];

/* ====== UTILIDADES DE FORMATO ====== */
function initials(n) {
  return n
    ? n
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "—";
}

function fmtDT(d) {
  return (
    d.toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
  );
}

/* ============================ COMPONENTE PRINCIPAL ============================ */
export default function Empleados() {
  const [expedientes, setExpedientes] = useState(EXPEDIENTES_INIT);

  // Estados para Filtros
  const [fBuscar, setFBuscar] = useState("");
  const [fTipoPersona, setFTipoPersona] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fRiesgo, setFRiesgo] = useState("");

  // Estado para el modal/ficha
  const [modal, setModal] = useState({ open: false, data: null });

  const limpiarFiltros = () => {
    setFBuscar("");
    setFTipoPersona("");
    setFEstado("");
    setFRiesgo("");
  };

  // Filtrado dinámico de expedientes
  const expedientesFiltrados = useMemo(() => {
    return expedientes
      .filter((exp) => {
        if (fTipoPersona && exp.tipoPersona !== fTipoPersona) return false;
        if (fEstado && exp.estado !== fEstado) return false;
        if (fRiesgo && exp.riesgo !== fRiesgo) return false;
        if (fBuscar) {
          const q = fBuscar.toLowerCase().trim();
          const texto =
            `${exp.id} ${exp.cedula} ${exp.nombre} ${exp.correo} ${exp.ejecutivo}`.toLowerCase();
          if (!texto.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.ultimaActualizacion - a.ultimaActualizacion);
  }, [expedientes, fBuscar, fTipoPersona, fEstado, fRiesgo]);

  const handleGuardarExpediente = (expData) => {
    if (modal.data) {
      setExpedientes((prev) =>
        prev.map((e) => (e.id === expData.id ? { ...e, ...expData } : e))
      );
    } else {
      const nuevo = {
        ...expData,
        id: `EXP-${1000 + expedientes.length + 1}`,
        ultimaActualizacion: new Date(),
        documentosCompletos: 1,
        documentosTotales: 10,
        estado: "Pendiente",
        riesgo: "Bajo",
        tipoPersona: "Natural",
        ejecutivo: "Analista Creador",
      };
      setExpedientes((prev) => [nuevo, ...prev]);
    }
    setModal({ open: false, data: null });
  };

  /* ====== MODAL FICHA DE EXPEDIENTE (PORTAL CON ESTILOS DE CASOSTICKETS) ====== */
  const ModalFichaExpediente = () => {
    const isEdit = !!modal.data;
    const item = modal.data || {};

    const [activeTab, setActiveTab] = useState("identificacion");

    // Detector de tema en tiempo real (mismo patrón que casosTickets.jsx)
    const [isDarkMode, setIsDarkMode] = useState(
      () =>
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark")
    );

    useEffect(() => {
      const observer = new MutationObserver(() => {
        const darkActive =
          document.documentElement.classList.contains("dark") ||
          document.body.classList.contains("dark");
        setIsDarkMode(darkActive);
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => observer.disconnect();
    }, []);

    // Estados del formulario
    const [form, setForm] = useState({
      id: item.id || "Automático",
      cedula: item.cedula || "",
      nombre: item.nombre || "",
      f_ingreso: item.f_ingreso || "",
      est_colaborador: item.est_colaborador || "",
      creado_por: item.creado_por || "Analista Creador",
      f_creacion:
        item.f_creacion || new Date().toISOString().split("T")[0],

      ci: item.ci || "",
      f_venc_ci: item.f_venc_ci || "",
      rif: item.rif || "",
      f_venc_rif: item.f_venc_rif || "",
      contrato: item.contrato || "",
      f_venc_contrato: item.f_venc_contrato || "",

      ft_carnet: item.ft_carnet || "",
      ref_pers: item.ref_pers || "",
      compr_domicilio: item.compr_domicilio || "",
      acdo_confidencialidad: item.acdo_confidencialidad || "",
      cv: item.cv || "",
      cert_estudios: item.cert_estudios || "",
      cert_capacitacion: item.cert_capacitacion || "",
      acept_cap_gral: item.acept_cap_gral || "",
      acept_cap_area: item.acept_cap_area || "",
      cant_cap_cumpl: item.cant_cap_cumpl || 0,
      cant_otr_cursos: item.cant_otr_cursos || 0,

      ivss: item.ivss || "",
      f_reg_ivss: item.f_reg_ivss || "",
      ince: item.ince || "",
      f_reg_ince: item.f_reg_ince || "",
      faov: item.faov || "",
      f_reg_faov: item.f_reg_faov || "",
      cst_medica: item.cst_medica || "",
      reposos: item.reposos || 0,
      vacaciones: item.vacaciones || 0,
      permisos: item.permisos || 0,
      amonestaciones: item.amonestaciones || "",
      cant_amon: item.cant_amon || 0,
    });

    const [adjuntos, setAdjuntos] = useState(item.adjuntos || []);

    const handleChange = (e) => {
      const { id, value } = e.target;
      setForm((prev) => ({ ...prev, [id]: value }));
    };

    const handleFileAdd = (e) => {
      const files = Array.from(e.target.files);
      const newFiles = files.map((f) => ({ name: f.name, size: f.size }));
      setAdjuntos((prev) => [...prev, ...newFiles]);
    };

    const handleRemoveFile = (idx) => {
      setAdjuntos((prev) => prev.filter((_, i) => i !== idx));
    };

    // Alertas de vencimiento
    const hoy = new Date().toISOString().split("T")[0];
    const alertas = [];
    if (form.f_venc_ci && form.f_venc_ci <= hoy)
      alertas.push(`La Cédula de Identidad está vencida (${form.f_venc_ci})`);
    if (form.f_venc_rif && form.f_venc_rif <= hoy)
      alertas.push(`El RIF está vencido (${form.f_venc_rif})`);
    if (form.f_venc_contrato && form.f_venc_contrato <= hoy)
      alertas.push(`El Contrato está vencido (${form.f_venc_contrato})`);

    const onSubmit = (e) => {
      e.preventDefault();
      if (!form.nombre.trim()) {
        alert("Por favor ingrese el nombre completo.");
        return;
      }
      handleGuardarExpediente({ ...form, adjuntos });
    };

    return ReactDOM.createPortal(
      <div
        className="ma-overlay"
        onClick={() => setModal({ open: false, data: null })}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 99999,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <div
          className="ma-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 820,
            maxHeight: "92vh",
            overflowY: "auto",
            zIndex: 100000,
            boxSizing: "border-box",
            padding: 0,
          }}
        >
          {/* CABECERA IDÉNTICA A CASOSTICKETS */}
          <div className="ma-modal-head">
            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              {isEdit ? `Editar Expediente` : "Nuevo Expediente"}
              {isEdit && (
                <span style={{ fontSize: 13, opacity: 0.7 }}>
                  (#{form.id})
                </span>
              )}
            </h3>
            <button
              className="btn-icon"
              type="button"
              onClick={() => setModal({ open: false, data: null })}
            >
              ✕
            </button>
          </div>

          {/* NAVEGACIÓN POR PESTAÑAS SINTONIZADA AL ESTILO DE LA APP */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--merco-border, #ccc)",
              background: "var(--merco-bg-subtle, rgba(0, 0, 0, 0.03))",
              padding: "0 10px",
              overflowX: "auto",
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 16px",
                    border: "none",
                    background: "none",
                    borderBottom: isActive
                      ? "2px solid var(--merco-accent, #f95700)"
                      : "2px solid transparent",
                    color: isActive
                      ? "var(--merco-accent, #f95700)"
                      : "var(--merco-muted, inherit)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                >
                  <DynamicIcon name={tab.icon} style={{ fontSize: 15 }} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={onSubmit}>
            <div
              className="ma-modal-body"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minHeight: 280,
              }}
            >
              {/* ALERTAS */}
              {alertas.length > 0 && (
                <div
                  style={{
                    background: isDarkMode ? "rgba(245, 166, 35, 0.2)" : "rgba(245, 166, 35, 0.15)",
                    borderLeft: "4px solid #f95700",
                    padding: "10px 14px",
                    borderRadius: 6,
                    color: isDarkMode ? "#ffcc80" : "#8A5A00",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#f95700",
                    }}
                  >
                    <DynamicIcon name="FiAlertTriangle" /> Alertas de Vencimiento
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11 }}>
                    {alertas.map((al, idx) => (
                      <li key={idx}>{al}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* TAB 1: IDENTIFICACIÓN */}
              {activeTab === "identificacion" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="field">
                      <label>N° Expediente</label>
                      <input
                        className="inp"
                        id="id"
                        value={form.id}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="field">
                      <label>Cédula</label>
                      <input
                        className="inp"
                        id="cedula"
                        value={form.cedula}
                        onChange={handleChange}
                        placeholder="V-00.000.000"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Apellidos y Nombres</label>
                    <input
                      className="inp"
                      id="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Nombre completo"
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="field">
                      <label>F. Ingreso</label>
                      <input
                        type="date"
                        className="inp"
                        id="f_ingreso"
                        value={form.f_ingreso}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="field">
                      <label>Est. Colaborador</label>
                      <select
                        className="inp"
                        id="est_colaborador"
                        value={form.est_colaborador}
                        onChange={handleChange}
                      >
                        <option value="">Seleccionar</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                        <option value="Suspendido">Suspendido</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="field">
                      <label>Creado Por</label>
                      <input
                        className="inp"
                        id="creado_por"
                        value={form.creado_por}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="field">
                      <label>F. Creación</label>
                      <input
                        className="inp"
                        id="f_creacion"
                        value={form.f_creacion}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DOCUMENTOS LEGALES */}
              {activeTab === "documentos" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="field">
                      <label>C.I.</label>
                      <select
                        className="inp"
                        id="ci"
                        value={form.ci}
                        onChange={handleChange}
                      >
                        <option value=""></option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>F. Venc. C.I.</label>
                      <input
                        type="date"
                        className="inp"
                        id="f_venc_ci"
                        value={form.f_venc_ci}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="field">
                      <label>RIF</label>
                      <select
                        className="inp"
                        id="rif"
                        value={form.rif}
                        onChange={handleChange}
                      >
                        <option value=""></option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>F. Venc. RIF</label>
                      <input
                        type="date"
                        className="inp"
                        id="f_venc_rif"
                        value={form.f_venc_rif}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="field">
                      <label>Contrato</label>
                      <select
                        className="inp"
                        id="contrato"
                        value={form.contrato}
                        onChange={handleChange}
                      >
                        <option value=""></option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>F. Venc. Contrato</label>
                      <input
                        type="date"
                        className="inp"
                        id="f_venc_contrato"
                        value={form.f_venc_contrato}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RECAUDOS Y ACADÉMICOS */}
              {activeTab === "recaudos" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="field">
                      <label>Ft. Carnet</label>
                      <select
                        className="inp"
                        id="ft_carnet"
                        value={form.ft_carnet}
                        onChange={handleChange}
                      >
                        <option value=""></option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Ref. Pers.</label>
                      <select
                        className="inp"
                        id="ref_pers"
                        value={form.ref_pers}
                        onChange={handleChange}
                      >
                        <option value=""></option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="field">
                      <label>Compr. Domicilio</label>
                      <select
                        className="inp"
                        id="compr_domicilio"
                        value={form.compr_domicilio}
                        onChange={handleChange}
                      >
                        <option value=""></option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Acdo. Confidencialidad</label>
                      <select
                        className="inp"
                        id="acdo_confidencialidad"
                        value={form.acdo_confidencialidad}
                        onChange={handleChange}
                      >
                        <option value=""></option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="field">
                      <label>CV</label>
                      <select
                        className="inp"
                        id="cv"
                        value={form.cv}
                        onChange={handleChange}
                      >
                        <option value=""></option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Cert. Estudios</label>
                      <select
                        className="inp"
                        id="cert_estudios"
                        value={form.cert_estudios}
                        onChange={handleChange}
                      >
                        <option value=""></option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="field">
                      <label>Cap. Cumplidas</label>
                      <input
                        type="number"
                        className="inp"
                        id="cant_cap_cumpl"
                        value={form.cant_cap_cumpl}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="field">
                      <label>Otros Cursos</label>
                      <input
                        type="number"
                        className="inp"
                        id="cant_otr_cursos"
                        value={form.cant_otr_cursos}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: OPERATIVOS / SEGURIDAD SOCIAL */}
              {activeTab === "operativos" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="field">
                      <label>IVSS</label>
                      <select
                        className="inp"
                        id="ivss"
                        value={form.ivss}
                        onChange={handleChange}
                      >
                        <option value=""></option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>F. Reg. IVSS</label>
                      <input
                        type="date"
                        className="inp"
                        id="f_reg_ivss"
                        value={form.f_reg_ivss}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="field">
                      <label>FAOV</label>
                      <select
                        className="inp"
                        id="faov"
                        value={form.faov}
                        onChange={handleChange}
                      >
                        <option value=""></option>
                        <option value="SI">SI</option>
                        <option value="NO">NO</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>F. Reg. FAOV</label>
                      <input
                        type="date"
                        className="inp"
                        id="f_reg_faov"
                        value={form.f_reg_faov}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div className="field">
                      <label>Vacaciones</label>
                      <input
                        type="number"
                        className="inp"
                        id="vacaciones"
                        value={form.vacaciones}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="field">
                      <label>Permisos</label>
                      <input
                        type="number"
                        className="inp"
                        id="permisos"
                        value={form.permisos}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SOPORTES DIGITALES */}
              {activeTab === "soportes" && (
                <div
                  style={{
                    border: "2px dashed var(--merco-border, #ccc)",
                    borderRadius: 8,
                    padding: "24px 20px",
                    textAlign: "center",
                    background: "var(--merco-bg-subtle, rgba(0, 0, 0, 0.02))",
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--merco-muted, inherit)",
                      marginBottom: 12,
                    }}
                  >
                    Selecciona o arrastra archivos para adjuntar a este expediente.
                  </p>
                  <input
                    type="file"
                    id="f-file-input"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleFileAdd}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      document.getElementById("f-file-input").click()
                    }
                  >
                    <DynamicIcon name="FiPlus" /> Seleccionar Archivos
                  </button>

                  {/* Lista de adjuntos */}
                  {adjuntos.length > 0 && (
                    <div
                      style={{
                        marginTop: 18,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        textAlign: "left",
                      }}
                    >
                      {adjuntos.map((file, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 10px",
                            background: "var(--merco-bg-card, #fff)",
                            border: "1px solid var(--merco-border, #ccc)",
                            borderRadius: 6,
                            fontSize: 12,
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              color: "var(--merco-text, inherit)",
                            }}
                          >
                            <DynamicIcon name="FiFile" /> {file.name}
                          </span>
                          <button
                            type="button"
                            className="btn-icon"
                            style={{
                              color: "var(--merco-danger, #d1435b)",
                            }}
                            onClick={() => handleRemoveFile(idx)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PIE DE PÁGINA IDÉNTICO A CASOSTICKETS */}
            <div
              className="ma-modal-foot"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setModal({ open: false, data: null })}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <DynamicIcon name="FiSave" /> Guardar Expediente
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <SystemLayout identificacion="Mi Expediente" opcionMenu="Empleados">
      <div
        style={{
          fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
          padding: "10px 0",
        }}
      >
        {/* BARRA DE HERRAMIENTAS Y FILTROS */}
        <div className="ma-toolbar" style={{ marginTop: 0 }}>
          <div className="ma-filters">
            <div
              style={{ position: "relative", minWidth: 170, flex: "1 1 150px" }}
            >
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
                placeholder="Nº Expediente, RIF/Cédula, Cliente..."
                value={fBuscar}
                onChange={(e) => setFBuscar(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  borderRadius: 6,
                  border: "1px solid var(--merco-border, #444)",
                  background:
                    "var(--merco-bg-subtle, rgba(255, 255, 255, 0.05))",
                  color: "var(--merco-text, inherit)",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <select
              value={fTipoPersona}
              onChange={(e) => setFTipoPersona(e.target.value)}
            >
              <option value="">Tipo Persona (Todos)</option>
              {TIPOS_PERSONA.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={fEstado}
              onChange={(e) => setFEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              {ESTADOS_EXPEDIENTE.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>

            <select
              value={fRiesgo}
              onChange={(e) => setFRiesgo(e.target.value)}
            >
              <option value="">Nivel de Riesgo (Todos)</option>
              {NIVELES_RIESGO.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <button className="btn btn-ghost btn-sm" onClick={limpiarFiltros}>
              Limpiar
            </button>
          </div>

          <div>
            <button
              className="btn btn-accent"
              onClick={() => setModal({ open: true, data: null })}
            >
              <span>
                <DynamicIcon name="FiPlus" />
              </span>{" "}
              Nuevo Expediente
            </button>
          </div>
        </div>

        {/* TABLA DE EXPEDIENTES */}
        <div className="ma-card">
          <div style={{ overflowX: "auto" }}>
            <table className="ma-table">
              <thead>
                <tr>
                  <th>Nº EXPEDIENTE</th>
                  <th>CLIENTE</th>
                  <th>TIPO</th>
                  <th>ESTADO</th>
                  <th>RIESGO</th>
                  <th>DOCUMENTACIÓN</th>
                  <th>EJECUTIVO</th>
                  <th>ÚLTIMA ACT.</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {expedientesFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--merco-muted)",
                      }}
                    >
                      Sin expedientes que coincidan con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  expedientesFiltrados.map((exp) => {
                    const pctDocs = Math.round(
                      (exp.documentosCompletos / exp.documentosTotales) * 100
                    );

                    return (
                      <tr key={exp.id}>
                        <td>
                          <b
                            style={{
                              color: "var(--merco-text)",
                              fontWeight: 700,
                            }}
                          >
                            {exp.id}
                          </b>
                        </td>
                        <td>
                          <div className="ma-user-cell">
                            <div
                              className="ma-ava"
                              style={{
                                background: "var(--secondary)",
                                color: "var(--merco-text)",
                              }}
                            >
                              {initials(exp.nombre)}
                            </div>
                            <div>
                              <b
                                style={{
                                  color: "var(--merco-text)",
                                  display: "block",
                                }}
                              >
                                {exp.nombre}
                              </b>
                              <small style={{ color: "var(--merco-muted)" }}>
                                {exp.cedula}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="tag">{exp.tipoPersona}</span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 500,
                              background:
                                exp.estado === "Aprobado"
                                  ? "rgba(31, 157, 99, 0.15)"
                                  : exp.estado === "Pendiente"
                                    ? "rgba(47, 111, 237, 0.15)"
                                    : exp.estado === "En Revisión"
                                      ? "rgba(216, 153, 42, 0.15)"
                                      : "rgba(209, 67, 91, 0.15)",
                              color:
                                exp.estado === "Aprobado"
                                  ? "var(--merco-success, #1f9d63)"
                                  : exp.estado === "Pendiente"
                                    ? "var(--merco-blue, #2f6fed)"
                                    : exp.estado === "En Revisión"
                                      ? "var(--merco-warning, #d8992a)"
                                      : "var(--merco-danger, #d1435b)",
                            }}
                          >
                            ● {exp.estado}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          <span
                            style={{
                              color:
                                exp.riesgo === "Alto"
                                  ? "var(--merco-danger, #DC2626)"
                                  : exp.riesgo === "Medio"
                                    ? "var(--merco-warning, #D97706)"
                                    : "var(--merco-success, #1f9d63)",
                            }}
                          >
                            ● {exp.riesgo}
                          </span>
                        </td>
                        <td>
                          <div style={{ minWidth: 110 }}>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--merco-muted)",
                                marginBottom: 3,
                              }}
                            >
                              {exp.documentosCompletos} / {exp.documentosTotales}{" "}
                              ({pctDocs}%)
                            </div>
                            <div
                              style={{
                                width: "100%",
                                height: 6,
                                borderRadius: 3,
                                background: "rgba(0,0,0,0.08)",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${pctDocs}%`,
                                  height: "100%",
                                  background:
                                    pctDocs === 100
                                      ? "var(--merco-success, #1f9d63)"
                                      : "var(--merco-blue, #2f6fed)",
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td style={{ color: "var(--merco-muted)" }}>
                          {exp.ejecutivo}
                        </td>
                        <td
                          style={{
                            whiteSpace: "nowrap",
                            color: "var(--merco-muted)",
                            fontSize: 12,
                          }}
                        >
                          {fmtDT(exp.ultimaActualizacion)}
                        </td>
                        <td>
                          <button
                            className="btn-icon"
                            title="Editar Expediente"
                            onClick={() => setModal({ open: true, data: exp })}
                          >
                            <DynamicIcon name="FiEdit" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "12px 18px",
              borderTop: "1px solid var(--merco-border)",
              fontSize: 12.5,
              color: "var(--merco-muted)",
            }}
          >
            <b>{expedientesFiltrados.length}</b>{" "}
            {expedientesFiltrados.length === 1
              ? "expediente encontrado"
              : "expedientes encontrados"}
          </div>
        </div>
      </div>

      {modal.open && <ModalFichaExpediente />}
    </SystemLayout>
  );
}