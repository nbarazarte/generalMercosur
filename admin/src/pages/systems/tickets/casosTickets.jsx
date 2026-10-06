import React, { useState, useMemo } from "react";
import SystemLayout from "../../layouts/SystemLayout";
import { DynamicIcon } from "../../components/IconCatalog";

/* ====== CONSTANTES DE CONFIGURACIÓN Y VALORES ====== */
const CANALES = [
  "Wasapi",
  "Tickets",
  "Presencial",
  "Telefónico",
  "Correo electrónico",
  "Telegram",
  "Instagram",
];
const AGENTES = [
  "Eleany 1",
  "Maria J 2",
  "Andrea 3",
  "Ira 4",
  "Moises 5",
  "Vanessa 6",
  "Dayerling 7",
  "Yabelis 8",
  "Cladimar 9",
  "Yetsimar 10",
  "Zulmar 11",
  "Albert 12",
];
const ESTADOS = ["Pendiente", "En Proceso", "Resuelto", "Escalado"];
const SLA = { Alta: 4, Media: 24, Baja: 72 };
const NOW = new Date("2026-09-24T15:30:00");
const H = 3600 * 1000;

/* ====== DATOS DE EJEMPLO DE CLIENTES Y CASOS ====== */
const CLIENTES_INIT = [
  {
    cedula: "12.345.678",
    nombre: "José Rodríguez",
    tel: "+58 412-1234567",
    correo: "jrodriguez@correo.com",
  },
  {
    cedula: "15.987.654",
    nombre: "María Gómez",
    tel: "+58 414-9876543",
    correo: "mgomez@correo.com",
  },
  {
    cedula: "18.223.114",
    nombre: "Carlos Pérez",
    tel: "+58 416-5551020",
    correo: "cperez@correo.com",
  },
  {
    cedula: "20.556.789",
    nombre: "Ana Fernández",
    tel: "+58 424-3344556",
    correo: "afernandez@correo.com",
  },
  {
    cedula: "9.112.334",
    nombre: "Luis Martínez",
    tel: "+58 412-7788990",
    correo: "lmartinez@correo.com",
  },
  {
    cedula: "25.667.001",
    nombre: "Daniela Suárez",
    tel: "+58 426-1122334",
    correo: "dsuarez@correo.com",
  },
  {
    cedula: "14.009.556",
    nombre: "Pedro Blanco",
    tel: "+58 414-6677889",
    correo: "pblanco@correo.com",
  },
  {
    cedula: "22.778.443",
    nombre: "Gabriela Ríos",
    tel: "+58 412-2233445",
    correo: "grios@correo.com",
  },
];

const CASOS_INIT = [
  {
    id: 1042,
    cedula: "12.345.678",
    canal: "Wasapi",
    tipo: "Firma Electrónica",
    prioridad: "Alta",
    estado: "En Proceso",
    agente: "Eleany 1",
    opened: new Date(NOW - 6 * H),
    desc: "Cliente no puede renovar su firma electrónica, el token expiró.",
    obs: "Escalado a soporte técnico de firma.",
  },
  {
    id: 1041,
    cedula: "15.987.654",
    canal: "Tickets",
    tipo: "Generar Certificado",
    prioridad: "Media",
    estado: "Pendiente",
    agente: "Maria J 2",
    opened: new Date(NOW - 3 * H),
    desc: "Solicita certificado de custodia de valores.",
    obs: "",
  },
  {
    id: 1040,
    cedula: "18.223.114",
    canal: "Telefónico",
    tipo: "Mercado de Valores",
    prioridad: "Alta",
    estado: "Pendiente",
    agente: "Andrea 3",
    opened: new Date(NOW - 9 * H),
    desc: "Consulta sobre orden de compra no ejecutada.",
    obs: "",
  },
  {
    id: 1039,
    cedula: "20.556.789",
    canal: "Correo electrónico",
    tipo: "Web App",
    prioridad: "Baja",
    estado: "En Proceso",
    agente: "Ira 4",
    opened: new Date(NOW - 30 * H),
    desc: "No puede iniciar sesión en la Web App del portal.",
    obs: "Se envió instructivo de recuperación.",
  },
  {
    id: 1038,
    cedula: "9.112.334",
    canal: "Presencial",
    tipo: "Caja Venezolana de Valores",
    prioridad: "Media",
    estado: "Resuelto",
    agente: "Moises 5",
    opened: new Date(NOW - 40 * H),
    desc: "Actualización de datos en la CVV.",
    obs: "Resuelto en sucursal.",
  },
  {
    id: 1037,
    cedula: "25.667.001",
    canal: "Instagram",
    tipo: "Otros",
    prioridad: "Baja",
    estado: "Resuelto",
    agente: "Vanessa 6",
    opened: new Date(NOW - 52 * H),
    desc: "Consulta general de horarios de atención.",
    obs: "",
  },
  {
    id: 1036,
    cedula: "14.009.556",
    canal: "Wasapi",
    tipo: "Legacy",
    prioridad: "Alta",
    estado: "Escalado",
    agente: "Dayerling 7",
    opened: new Date(NOW - 20 * H),
    desc: "Error en sistema Legacy al consultar saldo.",
    obs: "Escalado a área de sistemas.",
  },
  {
    id: 1035,
    cedula: "22.778.443",
    canal: "Telegram",
    tipo: "Akkela",
    prioridad: "Media",
    estado: "En Proceso",
    agente: "Yabelis 8",
    opened: new Date(NOW - 14 * H),
    desc: "Problema de acceso a plataforma Akkela.",
    obs: "",
  },
  {
    id: 1034,
    cedula: "12.345.678",
    canal: "Tickets",
    tipo: "Generar Certificado",
    prioridad: "Baja",
    estado: "Resuelto",
    agente: "Eleany 1",
    opened: new Date(NOW - 70 * H),
    desc: "Certificado de tenencia solicitado.",
    obs: "Enviado por correo.",
  },
  {
    id: 1033,
    cedula: "15.987.654",
    canal: "Telefónico",
    tipo: "Firma Electrónica",
    prioridad: "Media",
    estado: "Pendiente",
    agente: "Cladimar 9",
    opened: new Date(NOW - 26 * H),
    desc: "Consulta sobre vigencia de firma electrónica.",
    obs: "",
  },
  {
    id: 1032,
    cedula: "18.223.114",
    canal: "Correo electrónico",
    tipo: "Mercado de Valores",
    prioridad: "Baja",
    estado: "En Proceso",
    agente: "Yetsimar 10",
    opened: new Date(NOW - 10 * H),
    desc: "Información sobre nuevos instrumentos de renta fija.",
    obs: "",
  },
  {
    id: 1031,
    cedula: "20.556.789",
    canal: "Presencial",
    tipo: "Firma Electrónica",
    prioridad: "Alta",
    estado: "Resuelto",
    agente: "Zulmar 11",
    opened: new Date(NOW - 48 * H),
    desc: "Emisión de firma electrónica nueva.",
    obs: "Completado en sucursal.",
  },
  {
    id: 1030,
    cedula: "9.112.334",
    canal: "Wasapi",
    tipo: "Web App",
    prioridad: "Media",
    estado: "Resuelto",
    agente: "Albert 12",
    opened: new Date(NOW - 90 * H),
    desc: "Asistencia para registro en Web App.",
    obs: "",
  },
  {
    id: 1029,
    cedula: "25.667.001",
    canal: "Tickets",
    tipo: "Otros",
    prioridad: "Media",
    estado: "En Proceso",
    agente: "Eleany 1",
    opened: new Date(NOW - 2 * H),
    desc: "Solicitud de estado de cuenta detallado.",
    obs: "",
  },
];

/* ====== UTILIDADES DE FORMATO Y CÁLCULO DE SLA ====== */
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
    d.toLocaleDateString("es-VE", { day: "2-digit", month: "short" }) +
    " " +
    d.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
  );
}

function slaInfo(c) {
  if (c.estado === "Resuelto")
    return { state: "ok", label: "Resuelto", mins: 0 };
  const due = new Date(c.opened.getTime() + SLA[c.prioridad] * H);
  const diff = due - NOW;
  const mins = Math.round(diff / 60000);
  if (diff <= 0) return { state: "late", label: "Vencido", mins };
  if (diff <= 2 * H) return { state: "warn", label: "Por vencer", mins, due };
  return { state: "ok", label: "En plazo", mins, due };
}

function humanLeft(mins) {
  const a = Math.abs(mins);
  const h = Math.floor(a / 60),
    m = a % 60;
  const s = (h ? h + "h " : "") + (m + "m");
  return mins < 0 ? "hace " + s : "en " + s;
}

/* ============================ COMPONENTE CASOSTICKETS ============================ */
export default function CasosTickets() {
  const [casos] = useState(CASOS_INIT);
  const [clientes] = useState(CLIENTES_INIT);

  // Estados para los Filtros
  const [fBuscar, setFBuscar] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fPrioridad, setFPrioridad] = useState("");
  const [fCanal, setFCanal] = useState("");
  const [fAgente, setFAgente] = useState("");
  const [modal, setModal] = useState(null);

  const clienteDe = (ced) =>
    clientes.find((c) => c.cedula === ced) || { nombre: "—", cedula: ced };

  const limpiarFiltros = () => {
    setFBuscar("");
    setFEstado("");
    setFPrioridad("");
    setFCanal("");
    setFAgente("");
  };

  // Filtrado dinámico de casos
  const casosFiltrados = useMemo(() => {
    return casos
      .filter((c) => {
        const cl = clienteDe(c.cedula);
        if (fEstado && c.estado !== fEstado) return false;
        if (fPrioridad && c.prioridad !== fPrioridad) return false;
        if (fCanal && c.canal !== fCanal) return false;
        if (fAgente && c.agente !== fAgente) return false;
        if (fBuscar) {
          const q = fBuscar.toLowerCase().trim();
          const texto =
            `${cl.cedula} ${cl.nombre} ${c.desc} ${c.tipo} #${c.id}`.toLowerCase();
          if (!texto.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.opened - a.opened);
  }, [casos, fBuscar, fEstado, fPrioridad, fCanal, fAgente, clientes]);

  /* ====== CONSTANTES ADICIONALES PARA LAS LISTAS DE _ID ====== */
  const DEPARTAMENTOS = [
    { id: 1, nombre: "Soporte Técnico" },
    { id: 2, nombre: "Operaciones" },
    { id: 3, nombre: "Sistemas" },
    { id: 4, nombre: "Atención al Cliente" },
  ];

  const CATEGORIAS = [
    { id: 1, nombre: "Firma Electrónica" },
    { id: 2, nombre: "Web App" },
    { id: 3, nombre: "Mercado de Valores" },
    { id: 4, nombre: "Generar Certificado" },
    { id: 5, nombre: "Caja Venezolana de Valores" },
    { id: 6, nombre: "Otros" },
  ];

  const PRIORIDADES_LIST = [
    { id: 1, nombre: "Baja" },
    { id: 2, nombre: "Media" },
    { id: 3, nombre: "Alta" },
  ];

  const ESTATUS_LIST = [
    { id: 1, nombre: "Pendiente" },
    { id: 2, nombre: "En Proceso" },
    { id: 3, nombre: "Resuelto" },
    { id: 4, nombre: "Escalado" },
  ];

  const handleNuevoTicket = () => {
    console.log("Nuevo ticket");
  };

  const ModalTicket = () => {
    const [clienteId, setClienteId] = useState("");
    const [departamentoId, setDepartamentoId] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [prioridadId, setPrioridadId] = useState("");
    const [estatusId, setEstatusId] = useState("");
    const [canalId, setCanalId] = useState("");
    const [strAsunto, setStrAsunto] = useState("");
    const [strDescripcion, setStrDescripcion] = useState("");
    const [intSla, setIntSla] = useState(24);

    const handleSubmit = (e) => {
      e.preventDefault();
      const nuevoTicketData = {
        cliente_id: Number(clienteId),
        creador_agente_id: null,
        cierre_agente_id: null,
        departamento_id: Number(departamentoId),
        categoria_id: Number(categoriaId),
        prioridad_id: Number(prioridadId),
        estatus_id: Number(estatusId),
        canal_id: Number(canalId),
        str_asunto: strAsunto,
        str_descripcion: strDescripcion,
        int_sla: Number(intSla),
        dmt_fecha_cierre: null,
      };

      console.log("Guardando ticket:", nuevoTicketData);
      // Aquí realizas la petición a tu API para guardar en PostgreSQL
      setModal(false);
    };

    return (
      <div className="ma-overlay" onClick={() => setModal(false)}>
        <div
          className="ma-modal"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }}
        >
          <div className="ma-modal-head">
            <h3>Nuevo Ticket</h3>
            <button className="btn-icon" onClick={() => setModal(false)}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              className="ma-modal-body"
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {/* Fila 1: Canal y Categoría */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div className="field">
                  <label>Canal</label>
                  <select
                    className="inp"
                    value={canalId}
                    onChange={(e) => setCanalId(e.target.value)}
                    required
                  >
                    <option value="">Seleccione un canal...</option>
                    {CANALES.map((c, idx) => (
                      <option key={idx} value={idx + 1}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Categoría</label>
                  <select
                    className="inp"
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    required
                  >
                    <option value="">Seleccione una categoría...</option>
                    {CATEGORIAS.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila 2: Cliente y Departamento */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div className="field">
                  <label>Cliente</label>
                  <select
                    className="inp"
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    required
                  >
                    <option value="">Seleccione un cliente...</option>
                    {clientes.map((cl, idx) => (
                      <option key={idx} value={idx + 1}>
                        {cl.nombre} ({cl.cedula})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Departamento</label>
                  <select
                    className="inp"
                    value={departamentoId}
                    onChange={(e) => setDepartamentoId(e.target.value)}
                    required
                  >
                    <option value="">Seleccione un departamento...</option>
                    {DEPARTAMENTOS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila 3: Prioridad, Estatus y SLA */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                }}
              >
                <div className="field">
                  <label>Prioridad</label>
                  <select
                    className="inp"
                    value={prioridadId}
                    onChange={(e) => setPrioridadId(e.target.value)}
                    required
                  >
                    <option value="">Prioridad...</option>
                    {PRIORIDADES_LIST.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Estatus</label>
                  <select
                    className="inp"
                    value={estatusId}
                    onChange={(e) => setEstatusId(e.target.value)}
                    required
                  >
                    <option value="">Estatus...</option>
                    {ESTATUS_LIST.map((es) => (
                      <option key={es.id} value={es.id}>
                        {es.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>SLA en Horas</label>
                  <input
                    type="number"
                    className="inp"
                    value={intSla}
                    onChange={(e) => setIntSla(e.target.value)}
                  />
                </div>
              </div>

              {/* Asunto */}
              <div className="field">
                <label>Asunto</label>
                <input
                  className="inp"
                  value={strAsunto}
                  onChange={(e) => setStrAsunto(e.target.value)}
                  placeholder="Resumen del requerimiento..."
                  maxLength={100}
                  required
                />
              </div>

              {/* Descripción */}
              <div className="field">
                <label>Descripción</label>
                <textarea
                  className="inp"
                  rows={3}
                  value={strDescripcion}
                  onChange={(e) => setStrDescripcion(e.target.value)}
                  placeholder="Detalle completo de la solicitud..."
                  required
                />
              </div>
            </div>

            <div
              className="ma-modal-foot"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 15,
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setModal(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Crear Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <SystemLayout identificacion="Tickets" opcionMenu="Casos Tickets">
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
          {/* <div>
            <h2 style={{ fontSize: 20, color: "var(--merco-text)", margin: 0 }}>
              Casos Tickets
            </h2>
          </div> */}
        </div>

        {/* BARRA DE HERRAMIENTAS Y FILTROS */}
        <div className="ma-toolbar" style={{ marginTop: 0 }}>
          <div className="ma-filters">
            {/* Buscador general */}
            {/* <div
              className="ma-search"
              style={{ position: "relative", maxWidth: 260 }}
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
                placeholder="Cédula, nombre o descripción..."
                value={fBuscar}
                onChange={(e) => setFBuscar(e.target.value)}
                style={{
                  paddingLeft: 32, // Espacio para el icono a la izquierda
                }}
              />
            </div> */}

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
                placeholder="Cédula, nombre o descripción..."
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

            {/* Selects de Filtrado */}
            <select
              value={fEstado}
              onChange={(e) => setFEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>

            <select
              value={fPrioridad}
              onChange={(e) => setFPrioridad(e.target.value)}
            >
              <option value="">Toda prioridad</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>

            <select value={fCanal} onChange={(e) => setFCanal(e.target.value)}>
              <option value="">Todos los canales</option>
              {CANALES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={fAgente}
              onChange={(e) => setFAgente(e.target.value)}
            >
              <option value="">Todos los agentes</option>
              {AGENTES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <button className="btn btn-ghost btn-sm" onClick={limpiarFiltros}>
              Limpiar
            </button>
          </div>

          <div>
            <button className="btn btn-accent" onClick={() => setModal(true)}>
              <span>
                <DynamicIcon name="FiPlus" />
              </span>{" "}
              Nuevo ticket
            </button>
          </div>
        </div>

        {/* TABLA DE CASOS / TICKETS */}
        <div className="ma-card">
          <div style={{ overflowX: "auto" }}>
            <table className="ma-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>CLIENTE</th>
                  <th>CANAL</th>
                  <th>TIPO DE CONSULTA</th>
                  <th>PRIORIDAD</th>
                  <th>ESTADO</th>
                  <th>AGENTE</th>
                  <th>FECHA</th>
                  <th>SLA</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {casosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--merco-muted)",
                      }}
                    >
                      Sin casos que coincidan con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  casosFiltrados.map((c) => {
                    const cl = clienteDe(c.cedula);
                    const s = slaInfo(c);

                    return (
                      <tr key={c.id}>
                        <td>
                          <b
                            style={{
                              color: "var(--merco-text)",
                              fontWeight: 700,
                            }}
                          >
                            #{c.id}
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
                              {initials(cl.nombre)}
                            </div>
                            <div>
                              <b
                                style={{
                                  color: "var(--merco-text)",
                                  display: "block",
                                }}
                              >
                                {cl.nombre}
                              </b>
                              <small style={{ color: "var(--merco-muted)" }}>
                                {cl.cedula}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="tag">{c.canal}</span>
                        </td>
                        <td style={{ color: "var(--merco-text)" }}>{c.tipo}</td>
                        <td style={{ fontWeight: 600 }}>
                          <span
                            style={{
                              color:
                                c.prioridad === "Alta"
                                  ? "var(--merco-danger, #DC2626)"
                                  : c.prioridad === "Media"
                                    ? "var(--merco-warning, #D97706)"
                                    : "var(--merco-success, #1f9d63)",
                            }}
                          >
                            ● {c.prioridad}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 500,
                              background:
                                c.estado === "Pendiente"
                                  ? "rgba(47, 111, 237, 0.15)"
                                  : c.estado === "En Proceso"
                                    ? "rgba(216, 153, 42, 0.15)"
                                    : c.estado === "Resuelto"
                                      ? "rgba(31, 157, 99, 0.15)"
                                      : "rgba(209, 67, 91, 0.15)",
                              color:
                                c.estado === "Pendiente"
                                  ? "var(--merco-blue, #2f6fed)"
                                  : c.estado === "En Proceso"
                                    ? "var(--merco-warning, #d8992a)"
                                    : c.estado === "Resuelto"
                                      ? "var(--merco-success, #1f9d63)"
                                      : "var(--merco-danger, #d1435b)",
                            }}
                          >
                            ● {c.estado}
                          </span>
                        </td>
                        <td style={{ color: "var(--merco-muted)" }}>
                          {c.agente}
                        </td>
                        <td
                          style={{
                            whiteSpace: "nowrap",
                            color: "var(--merco-muted)",
                            fontSize: 12,
                          }}
                        >
                          {fmtDT(c.opened)}
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 600,
                              color:
                                s.state === "late"
                                  ? "var(--merco-danger, #DC2626)"
                                  : s.state === "warn"
                                    ? "var(--merco-warning, #D97706)"
                                    : "var(--merco-success, #1f9d63)",
                            }}
                          >
                            {s.label}
                          </span>
                          {c.estado !== "Resuelto" && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--merco-muted)",
                              }}
                            >
                              {humanLeft(s.mins)}
                            </div>
                          )}
                        </td>
                        <td>
                          <button className="btn-icon" title="Ver detalle">
                            <DynamicIcon name="FiEye" />
                          </button>
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
            <b>{casosFiltrados.length}</b>{" "}
            {casosFiltrados.length === 1
              ? "caso encontrado"
              : "casos encontrados"}
          </div>
        </div>
      </div>

      {modal && <ModalTicket />}
    </SystemLayout>
  );
}
