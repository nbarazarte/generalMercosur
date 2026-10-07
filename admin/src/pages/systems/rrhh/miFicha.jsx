import React, { useState, useEffect } from "react";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../components/IconCatalog";

/* ====== PESTAÑAS CONFIGURADAS ====== */
const TABS = [
  { id: "identificacion", label: "Identificación", icon: "FiUser" },
  { id: "documentos", label: "Doc. Legales", icon: "FiFileText" },
  { id: "recaudos", label: "Recaudos", icon: "FiFolder" },
  { id: "operativos", label: "Operativos", icon: "FiShield" },
  { id: "soportes", label: "Soportes", icon: "FiPaperclip" },
];

export default function MiFicha() {
  const [activeTab, setActiveTab] = useState("identificacion");

  // Detector de tema en tiempo real
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
    id: "EXP-1001",
    cedula: "V-12.345.678",
    nombre: "José Rodríguez",
    f_ingreso: "2026-01-15",
    est_colaborador: "Activo",
    creado_por: "Ana Rodríguez",
    f_creacion: "2026-01-15",

    // Documentos Legales
    ci: "SI",
    f_venc_ci: "2029-01-15",
    rif: "SI",
    f_venc_rif: "2029-01-15",
    contrato: "SI",
    f_venc_contrato: "2027-06-30",

    // Recaudos
    ft_carnet: "SI",
    ref_pers: "SI",
    compr_domicilio: "SI",
    acdo_confidencialidad: "SI",
    cv: "SI",
    cert_estudios: "SI",
    cert_capacitacion: "SI",
    acept_cap_gral: "SI",
    acept_cap_area: "SI",
    cant_cap_cumpl: 4,
    cant_otr_cursos: 2,

    // Operativos
    ivss: "SI",
    f_reg_ivss: "2026-01-16",
    ince: "SI",
    f_reg_ince: "2026-01-16",
    faov: "SI",
    f_reg_faov: "2026-01-16",
    cst_medica: "SI",
    reposos: 0,
    vacaciones: 15,
    permisos: 1,
    amonestaciones: "NO",
    cant_amon: 0,
  });

  const [adjuntos, setAdjuntos] = useState([
    { name: "Cedula_Identidad.pdf", size: 1024 * 350 },
    { name: "RIF_Actualizado.pdf", size: 1024 * 512 },
  ]);

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

  // Comprobación de alertas de vencimiento
  const hoy = new Date().toISOString().split("T")[0];
  const alertas = [];
  if (form.f_venc_ci && form.f_venc_ci <= hoy)
    alertas.push(`La Cédula de Identidad está vencida (${form.f_venc_ci})`);
  if (form.f_venc_rif && form.f_venc_rif <= hoy)
    alertas.push(`El RIF está vencido (${form.f_venc_rif})`);
  if (form.f_venc_contrato && form.f_venc_contrato <= hoy)
    alertas.push(`El Contrato está vencido (${form.f_venc_contrato})`);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Expediente guardado correctamente.");
    console.log("Datos de la Ficha del Empleado:", { ...form, adjuntos });
  };

  return (
    <SystemLayout identificacion="Mi Expediente" opcionMenu="Mi ficha">
      <div
        style={{
          fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
          padding: "10px 0",
        }}
      >
        <div className="ma-card" style={{ padding: 0, overflow: "hidden" }}>
          {/* CABECERA PRINCIPAL DE LA FICHA */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--merco-border, #ccc)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 4,
                  height: 24,
                  backgroundColor: "var(--merco-accent, #f95700)",
                  borderRadius: 2,
                }}
              />
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--merco-text, inherit)",
                  }}
                >
                  Expediente de Empleado
                </h2>
                <small style={{ color: "var(--merco-muted)" }}>
                  Nº Expediente: <b>{form.id}</b>
                </small>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                <DynamicIcon name="FiSave" /> Guardar Cambios
              </button>
            </div>
          </div>

          {/* BARRA DE PESTAÑAS (TABS) */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--merco-border, #ccc)",
              background: "var(--merco-bg-subtle, rgba(0, 0, 0, 0.03))",
              padding: "0 16px",
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
                    padding: "14px 20px",
                    border: "none",
                    background: "none",
                    borderBottom: isActive
                      ? "3px solid var(--merco-accent, #f95700)"
                      : "3px solid transparent",
                    color: isActive
                      ? "var(--merco-accent, #f95700)"
                      : "var(--merco-muted, inherit)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 14,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                >
                  <DynamicIcon name={tab.icon} style={{ fontSize: 16 }} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* CUERPO DEL FORMULARIO */}
          <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
            {/* ALERTAS EN CASO DE VENCIMIENTO */}
            {alertas.length > 0 && (
              <div
                style={{
                  background: isDarkMode
                    ? "rgba(245, 166, 35, 0.2)"
                    : "rgba(245, 166, 35, 0.15)",
                  borderLeft: "4px solid #f95700",
                  padding: "12px 16px",
                  borderRadius: 6,
                  color: isDarkMode ? "#ffcc80" : "#8A5A00",
                  marginBottom: 20,
                }}
              >
                <h4
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#f95700",
                  }}
                >
                  <DynamicIcon name="FiAlertTriangle" /> Alertas de Vencimiento
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                  {alertas.map((al, idx) => (
                    <li key={idx}>{al}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* TAB 1: IDENTIFICACIÓN */}
            {activeTab === "identificacion" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
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
                    <label>Cédula / Identificación</label>
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
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
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
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
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
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  <div className="field">
                    <label>C.I. Presentada</label>
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
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  <div className="field">
                    <label>RIF Presentado</label>
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
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  <div className="field">
                    <label>Contrato Firmado</label>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
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
                    <label>Ref. Personales</label>
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
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
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
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  <div className="field">
                    <label>Curriculum Vitae (CV)</label>
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
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
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
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
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
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
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
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  <div className="field">
                    <label>Días Vacaciones Disponibles</label>
                    <input
                      type="number"
                      className="inp"
                      id="vacaciones"
                      value={form.vacaciones}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field">
                    <label>Permisos Tomados</label>
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
                  padding: "32px 20px",
                  textAlign: "center",
                  background: "var(--merco-bg-subtle, rgba(0, 0, 0, 0.02))",
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--merco-muted, inherit)",
                    marginBottom: 16,
                  }}
                >
                  Selecciona o arrastra archivos para adjuntar documentos a este expediente.
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
                  className="btn btn-ghost"
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
                      marginTop: 24,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      textAlign: "left",
                      maxWidth: 600,
                      margin: "24px auto 0 auto",
                    }}
                  >
                    {adjuntos.map((file, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          background: "var(--merco-bg-card, #fff)",
                          border: "1px solid var(--merco-border, #ccc)",
                          borderRadius: 6,
                          fontSize: 13,
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
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

            {/* BOTÓN INFERIOR DE ACCIÓN */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 24,
                paddingTop: 16,
                borderTop: "1px solid var(--merco-border, #ccc)",
              }}
            >
              <button type="submit" className="btn btn-primary">
                <DynamicIcon name="FiSave" /> Guardar Expediente
              </button>
            </div>
          </form>
        </div>
      </div>
    </SystemLayout>
  );
}