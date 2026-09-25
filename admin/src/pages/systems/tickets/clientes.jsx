import React, { useState, useMemo } from "react";
import SystemLayout from "../../layouts/SystemLayout";

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

const NOW = new Date("2026-09-24T15:30:00");
const H = 3600 * 1000;

const CASOS_INIT = [
  { id: 1042, cedula: "12.345.678", opened: new Date(NOW - 6 * H) },
  { id: 1041, cedula: "15.987.654", opened: new Date(NOW - 3 * H) },
  { id: 1040, cedula: "18.223.114", opened: new Date(NOW - 9 * H) },
  { id: 1039, cedula: "20.556.789", opened: new Date(NOW - 30 * H) },
  { id: 1038, cedula: "9.112.334", opened: new Date(NOW - 40 * H) },
  { id: 1037, cedula: "25.667.001", opened: new Date(NOW - 52 * H) },
  { id: 1036, cedula: "14.009.556", opened: new Date(NOW - 20 * H) },
  { id: 1035, cedula: "22.778.443", opened: new Date(NOW - 14 * H) },
  { id: 1034, cedula: "12.345.678", opened: new Date(NOW - 70 * H) },
  { id: 1033, cedula: "15.987.654", opened: new Date(NOW - 26 * H) },
  { id: 1032, cedula: "18.223.114", opened: new Date(NOW - 10 * H) },
  { id: 1031, cedula: "20.556.789", opened: new Date(NOW - 48 * H) },
  { id: 1030, cedula: "9.112.334", opened: new Date(NOW - 90 * H) },
  { id: 1029, cedula: "25.667.001", opened: new Date(NOW - 2 * H) },
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

function fmtDate(d) {
  return d
    ? d.toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
}

/* ============================ COMPONENTE CLIENTES ============================ */
export default function Clientes() {
  const [clientes] = useState(CLIENTES_INIT);
  const [casos] = useState(CASOS_INIT);
  const [buscar, setBuscar] = useState("");

  // Filtrado de clientes por cédula o nombre
  const clientesFiltrados = useMemo(() => {
    const q = buscar.toLowerCase().trim();
    return clientes.filter(
      (cl) => !q || (cl.cedula + " " + cl.nombre).toLowerCase().includes(q),
    );
  }, [clientes, buscar]);

  return (
    <SystemLayout identificacion="Tickets">
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
              Clientes
            </h2>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA Y HERRAMIENTAS */}
        <div className="ma-toolbar" style={{ marginTop: 0 }}>
          <div className="ma-search" style={{ maxWidth: 300 }}>
            <input
              className="inp"
              placeholder="Buscar por cédula o nombre..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
        </div>

        {/* TABLA DE CLIENTES */}
        <div className="ma-card">
          <div style={{ overflowX: "auto" }}>
            <table className="ma-table">
              <thead>
                <tr>
                  <th>CÉDULA</th>
                  <th>CLIENTE</th>
                  <th>TELÉFONO</th>
                  <th>CORREO</th>
                  <th>CASOS</th>
                  <th>ÚLTIMA ATENCIÓN</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--merco-muted)",
                      }}
                    >
                      Sin clientes encontrados
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((cl) => {
                    const casosCliente = casos.filter(
                      (c) => c.cedula === cl.cedula,
                    );
                    const ultimoCaso = casosCliente
                      .slice()
                      .sort((a, b) => b.opened - a.opened)[0];

                    return (
                      <tr key={cl.cedula}>
                        <td>
                          <b style={{ color: "var(--merco-text)" }}>
                            {cl.cedula}
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
                            </div>
                          </div>
                        </td>
                        <td style={{ color: "var(--merco-muted)" }}>
                          {cl.tel || "—"}
                        </td>
                        <td style={{ color: "var(--merco-muted)" }}>
                          {cl.correo || "—"}
                        </td>
                        <td>
                          <span className="tag">
                            {casosCliente.length}{" "}
                            {casosCliente.length === 1 ? "caso" : "casos"}
                          </span>
                        </td>
                        <td style={{ color: "var(--merco-muted)" }}>
                          {ultimoCaso ? fmtDate(ultimoCaso.opened) : "—"}
                        </td>
                        <td>
                          <button
                            className="btn-icon"
                            title="Ver detalle del cliente"
                          >
                            👁️
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
            <b>{clientesFiltrados.length}</b>{" "}
            {clientesFiltrados.length === 1
              ? "cliente registrado"
              : "clientes registrados"}
          </div>
        </div>
      </div>
    </SystemLayout>
  );
}
