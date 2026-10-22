import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export function ChartBarCategoria({ data, isDark, loading }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (loading || !data || data.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";
    const labels = data.map((d) => d.nombre_categoria);
    const values = data.map((d) => d.total_tickets);

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: "#c8a45c", borderRadius: 4 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } },
        },
        plugins: { legend: { display: false } },
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
          Sin volumen de tickets por categoría con los filtros seleccionados.
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
}