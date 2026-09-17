import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const GraficosBarras = ({ data }) => {
  // 1. Quitamos el .slice() para que entren todos los países.
  // Solo ordenamos de mayor a menor.
  const allData = [...data].sort((a, b) => b.value - a.value);

  // 2. Calculamos una altura dinámica: si hay muchos países, aumentamos el alto
  // 30px por cada país es una buena medida.
  const dynamicHeight = Math.max(300, allData.length * 35);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    /* Contenedor con scroll vertical para que no rompa el diseño de tu página */
    <div
      style={{
        width: "100%",
        height: "350px", // Altura fija del recuadro
        overflowY: "auto", // Si hay muchos países, aparece scroll
        overflowX: "hidden",
      }}
    >
      <div style={{ width: "100%", height: `${dynamicHeight}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={allData}
            margin={{ top: 10, right: 50, left: 10, bottom: 10 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              fontSize={10}
              width={110}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip cursor={{ fill: "transparent" }} />

            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              barSize={20}
              minPointSize={5} // Asegura que los de valor 1 sean visibles
              label={{
                position: "right",
                fontSize: 10,
                fontWeight: "bold",
                fill: "#555",
              }}
            >
              {allData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficosBarras;
