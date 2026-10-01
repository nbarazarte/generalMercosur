import React, { useState, useMemo } from "react";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../components/IconCatalog";

/* ====== CONSTANTES Y VALORES DE CONFIGURACIÓN ====== */
const TIPOS_PERSONA = ["Natural", "Jurídica"];
const ESTADOS_EXPEDIENTE = ["Aprobado", "Pendiente", "En Revisión", "Rechazado"];
const NIVELES_RIESGO = ["Bajo", "Medio", "Alto"];

/* ====== DATOS DE EJEMPLO DE EXPEDIENTES / CLIENTES ====== */
const EXPEDIENTES_INIT = [
  {
    id: "EXP-1001",
    cedula: "12.345.678",
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
  },
  {
    id: "EXP-1002",
    cedula: "15.987.654",
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
  },
  {
    id: "EXP-1004",
    cedula: "20.556.789",
    nombre: "Ana Fernández",
    tipoPersona: "Natural",
    correo: "afernandez@correo.com",
    tel: "+58 424-3344556",
    estado: "Rechazado",
    riesgo: "Medio",
    ejecutivo: "Ira 4",
    ultimaActualizacion: new Date("2026-09-20T16:45:00"),
    documentosCompletos: 4,
    documentosTotales: 10,
  },
  {
    id: "EXP-1005",
    cedula: "J-40112334-5",
    nombre: "Corporación Micagroup C.A.",
    tipoPersona: "Jurídica",
    correo: "admin@micagroup.com",
    tel: "+58 212-7788990",
    estado: "Aprobado",
    riesgo: "Bajo",
    ejecutivo: "Moises 5",
    ultimaActualizacion: new Date("2026-09-18T11:30:00"),
    documentosCompletos: 15,
    documentosTotales: 15,
  },
  {
    id: "EXP-1006",
    cedula: "25.667.001",
    nombre: "Daniela Suárez",
    tipoPersona: "Natural",
    correo: "dsuarez@correo.com",
    tel: "+58 426-1122334",
    estado: "En Revisión",
    riesgo: "Bajo",
    ejecutivo: "Vanessa 6",
    ultimaActualizacion: new Date("2026-09-15T08:10:00"),
    documentosCompletos: 8,
    documentosTotales: 10,
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
    d.toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
  );
}

/* ============================ COMPONENTE EXPEDIENTE ============================ */
export default function Empleados() {
  const [expedientes] = useState(EXPEDIENTES_INIT);

  // Estados para los Filtros
  const [fBuscar, setFBuscar] = useState("");
  const [fTipoPersona, setFTipoPersona] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fRiesgo, setFRiesgo] = useState("");

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

  return (
    <SystemLayout identificacion="Mi Expediente">
      <div
        style={{
          fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
          padding: "10px 0",
        }}
      >
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
              Expedientes Digitales
            </h2>
          </div>
          <button className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <DynamicIcon name="FiPlus" />
            <span>Nuevo Expediente</span>
          </button>
        </div>

        {/* BARRA DE HERRAMIENTAS Y FILTROS */}
        <div className="ma-toolbar" style={{ marginTop: 0 }}>
          <div className="ma-filters">
            {/* Buscador general */}
            <div
              className="ma-search"
              style={{ position: "relative", maxWidth: 280 }}
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
                className="inp"
                placeholder="Nº Expediente, RIF/Cédula, Cliente..."
                value={fBuscar}
                onChange={(e) => setFBuscar(e.target.value)}
                style={{
                  paddingLeft: 32,
                }}
              />
            </div>

            {/* Selects de Filtrado */}
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
                            <div style={{ fontSize: 11, color: "var(--merco-muted)", marginBottom: 3 }}>
                              {exp.documentosCompletos} / {exp.documentosTotales} ({pctDocs}%)
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
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn-icon" title="Ver Expediente">
                              <DynamicIcon name="FiFolder" />
                            </button>
                            <button className="btn-icon" title="Editar">
                              <DynamicIcon name="FiEdit" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PIE DE TABLA / CONTADOR */}
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
    </SystemLayout>
  );
}