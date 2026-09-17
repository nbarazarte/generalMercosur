import React from "react";
import { useSelector } from "react-redux";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

const RADIAN = Math.PI / 180;

const COLORS = [
  "#06b6d4", // Fichas Nuevas (Cian)
  "#ffd8a8", // Fichas en Pausa
  "#f97316", // Fichas por Revisión (Naranja)
  "#6366f1", // Fichas en Revisión (Índigo/Morado azulado)
  "#eab308", // Fichas de PEP (Amarillo/Oro)
  "#ef4444", // Fichas de NotiCrimen (Rojo)
  "#d946ef", // Fichas de Devueltas (Fucsia)
  "#10b981", // Fichas Aprobadas (Verde)
  "#475569", // Fichas Activas (Gris Pizarra)
  "#2563eb", // Fichas Firmadas (Azul Real)
];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null)
    return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const ncx = Number(cx);
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const ncy = Number(cy);
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
};

export default function GraficosTorta({ data = [], isAnimationActive = true }) {
  const muiMode = useSelector((state) => state.plantilla.muiMode);

  if (!data || data.length === 0) {
    return <p className="text-gray-400 py-10">No hay datos para mostrar</p>;
  }

  // Solución definitiva: Usar style inline para el color base y Tailwind para el modo oscuro
  const renderLegendText = (value, entry) => {
    const { payload } = entry;
    return (
      <span
        className="font-medium ml-1"
        style={{ color: muiMode === "dark" ? "#ffffff" : "#374151" }}
      >
        {value}:
        <span
          className="font-extrabold ml-1"
          style={{ color: muiMode === "dark" ? "#ffffff" : "#374151" }}
        >
          {payload?.value}
        </span>
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div style={{ width: "100%", maxWidth: "450px", height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius="100%"
              //innerRadius={60} // Si es dona
              paddingAngle={5}
              dataKey="value"
              isAnimationActive={isAnimationActive}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                backgroundColor: "#fff",
              }}
              itemStyle={{ color: "#000" }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={renderLegendText}
              wrapperStyle={{ paddingBottom: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
