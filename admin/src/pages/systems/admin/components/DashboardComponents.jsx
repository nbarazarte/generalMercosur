import React, { useState, useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import { DynamicIcon, IconPicker } from "../../../../components/IconCatalog";
import axiosAdmin from "../../../../api/axiosAdmin";

export function initials(n) {
  return n
    ? n
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "—";
}

export function KPICard({ icon, val, label, trend, trendColor, iconColor }) {
  return (
    <div className="ma-stat">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 20,
            color: iconColor || "var(--merco-muted)",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <DynamicIcon name={icon} fallback="FiActivity" />
        </span>
      </div>
      <div className="val">{val}</div>
      <div className="lbl" style={{ marginTop: 2 }}>
        {label}
      </div>
      {trend && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: trendColor || "var(--merco-muted)",
            marginTop: 6,
          }}
        >
          {trend}
        </div>
      )}
    </div>
  );
}

export function UltimosAccesosCard() {
  const [accesos, setAccesos] = useState([]);

  useEffect(() => {
    axiosAdmin
      .get("/dashboard/ultimos-accesos")
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setAccesos(data);
      })
      .catch((err) => console.error("Error al obtener últimos accesos:", err));
  }, []);

  return (
    <div className="ma-card" style={{ padding: 18 }}>
      <div
        style={{
          marginBottom: 16,
          borderBottom: "1px solid var(--merco-border)",
          paddingBottom: 10,
        }}
      >
        <span
          style={{
            fontWeight: "bold",
            fontSize: 15,
            color: "var(--merco-text)",
          }}
        >
          Últimos Accesos de Usuarios
        </span>{" "}
        <small style={{ color: "var(--merco-muted)" }}>
          Auditoría (Base de Datos)
        </small>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxHeight: 240,
          overflowY: "auto",
        }}
      >
        {accesos.length > 0 ? (
          accesos.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                paddingBottom: 10,
                borderBottom: "1px solid var(--merco-border)",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid rgba(31, 157, 99, 0.4)",
                  background: "rgba(31, 157, 99, 0.12)",
                  color: "#1F9D63",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                <DynamicIcon name="FiUserCheck" fallback="FiUser" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b
                  style={{
                    fontSize: 13,
                    color: "var(--merco-text)",
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.usuario}
                </b>
                <small
                  style={{
                    color: "var(--merco-muted)",
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.email} · {item.detalle}
                </small>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <small style={{ color: "var(--merco-muted)" }}>
                  {item.tiempo}
                </small>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              color: "var(--merco-muted)",
              fontSize: 13,
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            No hay registros de accesos recientes en la base de datos.
          </div>
        )}
      </div>
    </div>
  );
}

export function ChartBarSistemas({ isDark }) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axiosAdmin
      .get("/usuarios-por-sistema")
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setChartData(data);
      })
      .catch((err) =>
        console.error("Error al obtener usuarios por sistema:", err),
      );
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Usuarios con Acceso",
            data: [],
            backgroundColor: [],
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
          x: { ticks: { precision: 0 }, grid: {} },
          y: { ticks: {}, grid: { display: false } },
        },
        plugins: { legend: { display: false } },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.05)";

    chart.data.labels = chartData.map((s) => s.nombre);
    chart.data.datasets[0].data = chartData.map((s) => s.total_usuarios);
    chart.data.datasets[0].backgroundColor = chartData.map(
      (s) => s.color || "#2f6fed",
    );

    chart.options.scales.x.ticks.color = textColor;
    chart.options.scales.x.grid.color = gridColor;
    chart.options.scales.y.ticks.color = textColor;

    chart.update();
  }, [isDark, chartData]);

  return (
    <div style={{ position: "relative", width: "100%", height: 210 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export function ChartDoughnutRoles({ usuarios, isDark }) {
  const canvasRef = useRef(null);

  const roleData = useMemo(() => {
    const conteo = {};
    usuarios.forEach((u) => {
      if (u.accesos) {
        const rolesUnicosDelUsuario = new Set(
          Object.values(u.accesos).filter((r) => r && r.trim() !== ""),
        );
        rolesUnicosDelUsuario.forEach((rolNombre) => {
          conteo[rolNombre] = (conteo[rolNombre] || 0) + 1;
        });
      }
    });

    return Object.keys(conteo).map((nombre) => ({
      nombre,
      total_asignaciones: conteo[nombre],
    }));
  }, [usuarios]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";

    const labels = roleData.map((r) => r.nombre);
    const data = roleData.map((r) => r.total_asignaciones);

    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels.length ? labels : ["Sin asignación"],
        datasets: [
          {
            data: data.length ? data : [1],
            backgroundColor: [
              "#0b2545",
              "#2f6fed",
              "#123a63",
              "#1f9d63",
              "#0f7a4c",
              "#d8992a",
              "#8155d8",
              "#69748c",
            ],
            borderColor: isDark ? "#08192f" : "#FFFFFF",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: textColor, boxWidth: 12 },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [isDark, roleData]);

  return (
    <div style={{ position: "relative", width: "100%", height: 210 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export function ChartDoughnutDepartamentos({ usuarios, isDark }) {
  const canvasRef = useRef(null);

  const deptoData = useMemo(() => {
    const conteo = {};
    if (Array.isArray(usuarios)) {
      usuarios.forEach((u) => {
        const depto =
          u.departamento || u.departamento_nombre || "Sin departamento";
        conteo[depto] = (conteo[depto] || 0) + 1;
      });
    }

    return Object.keys(conteo).map((nombre) => ({
      nombre,
      total: conteo[nombre],
    }));
  }, [usuarios]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";

    const labels = deptoData.map((d) => d.nombre);
    const data = deptoData.map((d) => d.total);

    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels.length ? labels : ["Sin datos"],
        datasets: [
          {
            data: data.length ? data : [1],
            backgroundColor: [
              "#2f6fed",
              "#1f9d63",
              "#d8992a",
              "#ee176d",
              "#8155d8",
              "#0b2545",
              "#123a63",
              "#0f7a4c",
            ],
            borderColor: isDark ? "#08192f" : "#FFFFFF",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: textColor, boxWidth: 12 },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [isDark, deptoData]);

  return (
    <div style={{ position: "relative", width: "100%", height: 210 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export function ModalOpcionRapida({ sistema, onSave, onClose }) {
  const [opcion, setOpcion] = useState("");
  const [ruta, setRuta] = useState("");
  const [ic, setIc] = useState("FiGrid");

  return (
    <div className="ma-overlay" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-modal-head">
          <h3>Nueva Ruta para {sistema?.nombre}</h3>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ma-modal-body">
          <div className="field">
            <label>Nombre de la Opción</label>
            <input
              value={opcion}
              onChange={(e) => setOpcion(e.target.value)}
              placeholder="ej. Reporte de Accesos"
            />
          </div>
          <div className="field">
            <label>Ruta (URL)</label>
            <input
              value={ruta}
              onChange={(e) => setRuta(e.target.value)}
              placeholder="ej. /admin/reportes-accesos"
            />
          </div>
          <div className="field">
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Seleccionar Ícono:
              <span style={{ fontSize: 18, display: "inline-flex" }}>
                <DynamicIcon name={ic} />
              </span>
            </label>
            <IconPicker value={ic} onChange={setIc} />
          </div>
        </div>
        <div className="ma-modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={!opcion || !ruta}
            onClick={() => onSave({ opcion, ruta_opcion: ruta, ic })}
          >
            Guardar Ruta
          </button>
        </div>
      </div>
    </div>
  );
}
