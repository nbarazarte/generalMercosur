import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export function ChartBarCasosCerradosAnalista({ data, isDark, loading }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (loading || !data || data.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";
    const labels = data.map((d) => d.nombre_analista);
    const values = data.map((d) => d.tickets_cerrados);

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Casos Cerrados",
            data: values,
            backgroundColor: "#059669",
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { display: false } },
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
          Sin tickets cerrados con los filtros seleccionados.
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
}