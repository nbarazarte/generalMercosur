import React, { useState, useMemo, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import SystemLayout from "../../layouts/SystemLayout";
import "../../../systems.css"; // Clases globales (ma-stats, ma-card, etc.)

/* ====== CONFIGURACIÓN Y CONSTANTES ====== */
const CANALES = ['Wasapi', 'Tickets', 'Presencial', 'Telefónico', 'Correo electrónico', 'Telegram', 'Instagram'];
const TIPOS = ['Firma Electrónica', 'Generar Certificado', 'Web App', 'Legacy', 'Akkela', 'Caja Venezolana de Valores', 'Mercado de Valores', 'Otros'];
const AGENTES = ['Eleany 1', 'Maria J 2', 'Andrea 3', 'Ira 4', 'Moises 5', 'Vanessa 6', 'Dayerling 7', 'Yabelis 8', 'Cladimar 9', 'Yetsimar 10', 'Zulmar 11', 'Albert 12'];
const ESTADOS = ['Pendiente', 'En Proceso', 'Resuelto', 'Escalado'];
const SLA = { Alta: 4, Media: 24, Baja: 72 };
const NOW = new Date('2026-09-24T15:30:00');
const H = 3600 * 1000;

/* ====== DATOS INICIALES ====== */
const CLIENTES_INIT = [
  { cedula: '12.345.678', nombre: 'José Rodríguez', tel: '+58 412-1234567', correo: 'jrodriguez@correo.com' },
  { cedula: '15.987.654', nombre: 'María Gómez', tel: '+58 414-9876543', correo: 'mgomez@correo.com' },
  { cedula: '18.223.114', nombre: 'Carlos Pérez', tel: '+58 416-5551020', correo: 'cperez@correo.com' },
  { cedula: '20.556.789', nombre: 'Ana Fernández', tel: '+58 424-3344556', correo: 'afernandez@correo.com' },
  { cedula: '9.112.334', nombre: 'Luis Martínez', tel: '+58 412-7788990', correo: 'lmartinez@correo.com' },
];

const CASOS_INIT = [
  { id: 1042, cedula: '12.345.678', canal: 'Wasapi', tipo: 'Firma Electrónica', prioridad: 'Alta', estado: 'En Proceso', agente: 'Eleany 1', opened: new Date(NOW - 6 * H), desc: 'Cliente no puede renovar su firma electrónica, el token expiró.', obs: 'Escalado a soporte técnico.' },
  { id: 1041, cedula: '15.987.654', canal: 'Tickets', tipo: 'Generar Certificado', prioridad: 'Media', estado: 'Pendiente', agente: 'Maria J 2', opened: new Date(NOW - 3 * H), desc: 'Solicita certificado de custodia de valores.', obs: '' },
  { id: 1040, cedula: '18.223.114', canal: 'Telefónico', tipo: 'Mercado de Valores', prioridad: 'Alta', estado: 'Pendiente', agente: 'Andrea 3', opened: new Date(NOW - 9 * H), desc: 'Consulta sobre orden de compra no ejecutada.', obs: '' },
  { id: 1039, cedula: '20.556.789', canal: 'Correo electrónico', tipo: 'Web App', prioridad: 'Baja', estado: 'En Proceso', agente: 'Ira 4', opened: new Date(NOW - 30 * H), desc: 'No puede iniciar sesión en la Web App.', obs: 'Se envió instructivo.' },
  { id: 1038, cedula: '9.112.334', canal: 'Presencial', tipo: 'Caja Venezolana de Valores', prioridad: 'Media', estado: 'Resuelto', agente: 'Moises 5', opened: new Date(NOW - 40 * H), desc: 'Actualización de datos en la CVV.', obs: 'Resuelto en sucursal.' },
];

/* ====== FUNCIONES AUXILIARES ====== */
function fmtDT(d) {
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
}

function slaInfo(c) {
  if (c.estado === 'Resuelto') return { state: 'ok', label: 'Resuelto', mins: 0 };
  const due = new Date(c.opened.getTime() + SLA[c.prioridad] * H);
  const diff = due - NOW;
  const mins = Math.round(diff / 60000);
  if (diff <= 0) return { state: 'late', label: 'Vencido', mins };
  if (diff <= 2 * H) return { state: 'warn', label: 'Por vencer', mins, due };
  return { state: 'ok', label: 'En plazo', mins, due };
}

/* ============================ COMPONENTE PRINCIPAL ============================ */
export default function DashboardTickets() {
  const [tab, setTab] = useState("dashboard");
  const [casos, setCasos] = useState(CASOS_INIT);
  const [clientes, setClientes] = useState(CLIENTES_INIT);
  const [modalNuevo, setModalNuevo] = useState(false);

  // Filtros
  const [fBuscar, setFBuscar] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fPrioridad, setFPrioridad] = useState("");
  const [fCanal, setFCanal] = useState("");

  const clienteDe = (ced) => clientes.find(c => c.cedula === ced) || { nombre: '—', cedula: ced };

  const stats = useMemo(() => ({
    total: casos.length,
    activos: casos.filter(c => c.estado !== 'Resuelto').length,
    enSeguimiento: casos.filter(c => c.estado === 'En Proceso' || c.estado === 'Escalado').length,
    vencidos: casos.filter(c => slaInfo(c).state === 'late').length,
  }), [casos]);

  const agregarCaso = (nuevoCaso, nuevoCliente) => {
    if (nuevoCliente && !clientes.find(c => c.cedula === nuevoCliente.cedula)) {
      setClientes(prev => [...prev, nuevoCliente]);
    }
    setCasos(prev => [nuevoCaso, ...prev]);
    setModalNuevo(false);
  };

  return (
    <SystemLayout>
      {/* Tarjetas de Métricas / Stats (ma-stats) */}
      <div className="ma-stats">
        <div className="ma-stat">
          <div className="lbl">Total de casos</div>
          <div className="val">{stats.total}</div>
          <span className="chip chip-flat">registrados</span>
        </div>
        <div className="ma-stat">
          <div className="lbl">Casos activos</div>
          <div className="val">{stats.activos}</div>
          <span className="chip chip-up">↑ requieren atención</span>
        </div>
        <div className="ma-stat">
          <div className="lbl">En seguimiento</div>
          <div className="val">{stats.enSeguimiento}</div>
          <span className="chip chip-flat">en proceso / escalados</span>
        </div>
        <div className="ma-stat">
          <div className="lbl">Vencidos (SLA)</div>
          <div className="val" style={{ color: stats.vencidos > 0 ? "var(--merco-danger, #d1435b)" : "inherit" }}>
            {stats.vencidos}
          </div>
          <span className="chip chip-flat">fuera de tiempo</span>
        </div>
      </div>

      {/* Pestañas de Navegación Interna (ma-tabs) */}
      <div className="ma-tabs">
        <button
          className={"ma-tab" + (tab === "dashboard" ? " active" : "")}
          onClick={() => setTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={"ma-tab" + (tab === "casos" ? " active" : "")}
          onClick={() => setTab("casos")}
        >
          Casos / Tickets
        </button>
        <button
          className={"ma-tab" + (tab === "seguimiento" ? " active" : "")}
          onClick={() => setTab("seguimiento")}
        >
          Seguimiento SLA
        </button>
        <button
          className={"ma-tab" + (tab === "clientes" ? " active" : "")}
          onClick={() => setTab("clientes")}
        >
          Clientes
        </button>
      </div>

      {/* Toolbar Superior */}
      <div className="ma-toolbar">
        <div style={{ color: "var(--merco-muted, #69748c)", fontSize: 14 }}>
          {tab === "dashboard" && "Resumen operativo e indicadores clave"}
          {tab === "casos" && "Gestión completa de tickets"}
          {tab === "seguimiento" && "Alertas de cumplimiento de SLA"}
          {tab === "clientes" && "Directorio de clientes registrados"}
        </div>
        <button className="btn btn-accent" onClick={() => setModalNuevo(true)}>
          <span>➕</span> Nuevo caso
        </button>
      </div>

      {/* Contenido de Vistas */}
      {tab === "dashboard" && <TabDashboard casos={casos} clienteDe={clienteDe} />}
      {tab === "casos" && (
        <TabCasos
          casos={casos}
          clienteDe={clienteDe}
          fBuscar={fBuscar} setFBuscar={setFBuscar}
          fEstado={fEstado} setFEstado={setFEstado}
          fPrioridad={fPrioridad} setFPrioridad={setFPrioridad}
          fCanal={fCanal} setFCanal={setFCanal}
        />
      )}
      {tab === "seguimiento" && <TabSeguimiento casos={casos.filter(c => c.estado !== 'Resuelto')} clienteDe={clienteDe} />}
      {tab === "clientes" && <TabClientes clientes={clientes} casos={casos} />}

      {/* Modal Nuevo Caso */}
      {modalNuevo && <ModalCaso clientes={clientes} onClose={() => setModalNuevo(false)} onSave={agregarCaso} />}
    </SystemLayout>
  );
}

/* ==================== SUB-COMPONENTES ==================== */

function TabDashboard({ casos, clienteDe }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <div className="ma-card" style={{ padding: 18 }}>
          <b style={{ display: "block", marginBottom: 12 }}>Evolución de casos</b>
          <ChartLineEvol casos={casos} />
        </div>
        <div className="ma-card" style={{ padding: 18 }}>
          <b style={{ display: "block", marginBottom: 12 }}>Distribución por estado</b>
          <ChartDoughnutEstado casos={casos} />
        </div>
      </div>

      <div className="ma-card">
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--merco-border, #e2e8f0)" }}>
          <b>Casos recientes</b>
        </div>
        <table className="ma-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Agente</th>
            </tr>
          </thead>
          <tbody>
            {casos.slice(0, 5).map(c => {
              const cl = clienteDe(c.cedula);
              return (
                <tr key={c.id}>
                  <td><b>#{c.id}</b></td>
                  <td><b>{cl.nombre}</b> <small>({cl.cedula})</small></td>
                  <td><span className="tag">{c.tipo}</span></td>
                  <td>{c.prioridad}</td>
                  <td>{c.estado}</td>
                  <td>{c.agente}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabCasos({ casos, clienteDe, fBuscar, setFBuscar, fEstado, setFEstado, fPrioridad, setFPrioridad, fCanal, setFCanal }) {
  const filtrados = useMemo(() => {
    return casos.filter(c => {
      const cl = clienteDe(c.cedula);
      if (fEstado && c.estado !== fEstado) return false;
      if (fPrioridad && c.prioridad !== fPrioridad) return false;
      if (fCanal && c.canal !== fCanal) return false;
      if (fBuscar) {
        const q = fBuscar.toLowerCase();
        const txt = `${cl.cedula} ${cl.nombre} ${c.desc} #${c.id}`.toLowerCase();
        if (!txt.includes(q)) return false;
      }
      return true;
    });
  }, [casos, fBuscar, fEstado, fPrioridad, fCanal]);

  return (
    <>
      <div className="ma-toolbar" style={{ marginTop: 0 }}>
        <div className="ma-filters">
          <input
            className="inp"
            style={{ padding: "6px 12px", fontSize: 13 }}
            placeholder="Buscar por cédula, nombre o ID..."
            value={fBuscar}
            onChange={e => setFBuscar(e.target.value)}
          />
          <select value={fEstado} onChange={e => setFEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={fPrioridad} onChange={e => setFPrioridad(e.target.value)}>
            <option value="">Toda prioridad</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
          <select value={fCanal} onChange={e => setFCanal(e.target.value)}>
            <option value="">Todos los canales</option>
            {CANALES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="ma-card">
        <table className="ma-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Canal</th>
              <th>Tipo</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Agente</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(c => {
              const cl = clienteDe(c.cedula);
              return (
                <tr key={c.id}>
                  <td><b>#{c.id}</b></td>
                  <td><b>{cl.nombre}</b> <small>({cl.cedula})</small></td>
                  <td><span className="tag">{c.canal}</span></td>
                  <td>{c.tipo}</td>
                  <td>{c.prioridad}</td>
                  <td>{c.estado}</td>
                  <td>{c.agente}</td>
                  <td style={{ fontSize: 12, color: "var(--merco-muted)" }}>{fmtDT(c.opened)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TabSeguimiento({ casos, clienteDe }) {
  return (
    <div className="ma-card">
      <table className="ma-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>SLA Status</th>
          </tr>
        </thead>
        <tbody>
          {casos.map(c => {
            const cl = clienteDe(c.cedula);
            const s = slaInfo(c);
            return (
              <tr key={c.id}>
                <td><b>#{c.id}</b></td>
                <td><b>{cl.nombre}</b></td>
                <td>{c.tipo}</td>
                <td>{c.prioridad}</td>
                <td>{c.estado}</td>
                <td style={{ fontWeight: "bold", color: s.state === "late" ? "var(--merco-danger, #d1435b)" : "var(--merco-warning, #d8992a)" }}>
                  {s.label}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TabClientes({ clientes, casos }) {
  return (
    <div className="ma-card">
      <table className="ma-table">
        <thead>
          <tr>
            <th>Cédula</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Total Casos</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cl => (
            <tr key={cl.cedula}>
              <td><b>{cl.cedula}</b></td>
              <td>{cl.nombre}</td>
              <td>{cl.tel || "—"}</td>
              <td>{cl.correo || "—"}</td>
              <td><b>{casos.filter(c => c.cedula === cl.cedula).length}</b></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ==================== GRÁFICOS (CHART.JS) ==================== */

function ChartLineEvol({ casos }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
        datasets: [{
          label: "Casos Recibidos",
          data: [4, 6, 8, 5, 9, 3, 7],
          borderColor: "#2f6fed",
          backgroundColor: "rgba(47, 111, 237, 0.12)",
          fill: true,
          tension: 0.3,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
    });
    return () => chart.destroy();
  }, [casos]);

  return <div style={{ height: 220 }}><canvas ref={canvasRef} /></div>;
}

function ChartDoughnutEstado({ casos }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ESTADOS,
        datasets: [{
          data: ESTADOS.map(e => casos.filter(c => c.estado === e).length),
          backgroundColor: ["#2f6fed", "#d8992a", "#1f9d63", "#d1435b"],
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
    });
    return () => chart.destroy();
  }, [casos]);

  return <div style={{ height: 220 }}><canvas ref={canvasRef} /></div>;
}

/* ==================== MODAL DE CREACIÓN ==================== */

function ModalCaso({ clientes, onClose, onSave }) {
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [tel, setTel] = useState("");
  const [correo, setCorreo] = useState("");
  const [canal, setCanal] = useState(CANALES[0]);
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [prioridad, setPrioridad] = useState("Media");
  const [agente, setAgente] = useState(AGENTES[0]);
  const [desc, setDesc] = useState("");

  const handleCedulaChange = (val) => {
    setCedula(val);
    const ex = clientes.find(c => c.cedula === val.trim());
    if (ex) {
      setNombre(ex.nombre); setTel(ex.tel || ""); setCorreo(ex.correo || "");
    }
  };

  const submit = () => {
    if (!cedula || !nombre || !desc) return;
    const nuevoCaso = {
      id: Date.now(),
      cedula, canal, tipo, prioridad, estado: "Pendiente", agente,
      opened: new Date(), desc, obs: ""
    };
    onSave(nuevoCaso, { cedula, nombre, tel, correo });
  };

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={e => e.stopPropagation()}>
        <div className="ma-modal-head">
          <h3>Nuevo Caso de Atención</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="ma-modal-body">
          <div className="field-row">
            <div className="field">
              <label>Cédula del cliente</label>
              <input value={cedula} onChange={e => handleCedulaChange(e.target.value)} placeholder="Ej. 12.345.678" />
            </div>
            <div className="field">
              <label>Nombre del cliente</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre completo" />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Teléfono</label>
              <input value={tel} onChange={e => setTel(e.target.value)} placeholder="+58 ..." />
            </div>
            <div className="field">
              <label>Correo electrónico</label>
              <input value={correo} onChange={e => setCorreo(e.target.value)} placeholder="cliente@correo.com" />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Canal</label>
              <select value={canal} onChange={e => setCanal(e.target.value)}>
                {CANALES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tipo de consulta</label>
              <select value={tipo} onChange={e => setTipo(e.target.value)}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Prioridad</label>
              <select value={prioridad} onChange={e => setPrioridad(e.target.value)}>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div className="field">
              <label>Agente responsable</label>
              <select value={agente} onChange={e => setAgente(e.target.value)}>
                {AGENTES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Descripción del caso</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Detalles de la consulta o incidencia..." rows={3} />
          </div>
        </div>

        <div className="ma-modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!cedula || !nombre || !desc} onClick={submit}>
            Registrar Caso
          </button>
        </div>
      </div>
    </div>
  );
}