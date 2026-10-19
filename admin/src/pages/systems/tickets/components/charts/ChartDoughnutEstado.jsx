import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function obtenerColorEstatus(nombreEstatus) {
  const est = (nombreEstatus || "").toLowerCase();
  if (est.includes("en proceso")) return "#3B82F6";
  if (est.includes("pendiente de usuario")) return "#F59E0B";
  if (est.includes("en espera proveedor")) return "#A855F7";
  if (est.includes("en aprobación")) return "#EC4899";
  if (est.includes("vencido") || est.includes("crítico")) return "#DC2626";
  if (est.includes("cerrado")) return "#059669";
  if (est.includes("cancelado")) return "#0EA5E9";
  return "#64748B";
}

export function ChartDoughnutEstado({ data, isDark, loading }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (loading || !data || data.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const labels = data.map((d) => d.estado);
    const values = data.map((d) => d.total);
    const backgroundColors = labels.map((nombre) => obtenerColorEstatus(nombre));

    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: backgroundColors,
            borderColor: isDark ? "#08192f" : "#FFFFFF",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: textColor } },
        },
      },
    });
    return () => chart.destroy();
  }, [data, isDark, loading]);

  return (
    <div style={{ height: 250, position: "relative", width: "100%" }}>
      {loading ? (
        <div style={{ textAlign: "center", paddingTop: 100 }}>Cargando gráfico...</div>
      ) : !data || data.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 100, color: "var(--merco-muted)", fontSize: "13px" }}>
          Sin estatus de tickets con los filtros seleccionados.
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
}