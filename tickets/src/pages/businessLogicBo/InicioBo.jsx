import React, { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import Logo from "../../components/Logo";
import Lottie from "lottie-react";
import Buscando from "../../assets/LottieFiles/Searching.json";
import GraficosTorta from "./GraficosTorta";
import GraficosBarras from "./GraficosBarras";
import axios from "axios";

const Inicio = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [chartDataSexo, setChartDataSexo] = useState([]);
  const [chartDataPaises, setChartDataPaises] = useState([]);
  const [chartDataEdades, setChartDataEdades] = useState([]);
  const lottieRef = useRef(null);

  const url =
    import.meta.env.VITE_APP_URL_API_LOCAL ||
    import.meta.env.REACT_APP_URL_API_LOCAL;
  const tokenApi =
    import.meta.env.VITE_APP_TOKEN || import.meta.env.REACT_APP_TOKEN;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEstatus, resSexo, resPaises, resEdades] = await Promise.all([
          axios.get(`${url}reporte_estatus_fichas`, {
            headers: { Authorization: `Bearer ${tokenApi}` },
          }),
          axios.get(`${url}reporte_sexo`, {
            headers: { Authorization: `Bearer ${tokenApi}` },
          }),
          axios.get(`${url}reporte_paises`, {
            headers: { Authorization: `Bearer ${tokenApi}` },
          }),
          axios.get(`${url}reporte_edades`, {
            headers: { Authorization: `Bearer ${tokenApi}` },
          }),
        ]);

        //console.log(resEstatus.data);

        if (resEstatus.data) {
          const result = resEstatus.data;
          setChartData([
            { name: "Nuevas", value: Number(result.incompletas || 0) },
            { name: "Pausadas", value: Number(result.pausadas || 0) },
            { name: "En Cumplimiento", value: Number(result.completas || 0) },
            {
              name: "LC/FT – Listas y Noticias",
              value: Number(result.enrevision || 0),
            },
            { name: "PEP", value: Number(result.pep || 0) },
            { name: "Notitia Criminis", value: Number(result.noticrimen || 0) },
            { name: "Devueltas", value: Number(result.devueltas || 0) },
            { name: "Aprobadas", value: Number(result.aprobadas || 0) },
            { name: "Activas", value: Number(result.activas || 0) },
            { name: "Firmadas", value: Number(result.firmadas || 0) },
          ]);
        }

        if (resSexo.data) {
          const result = resSexo.data;
          const dataArray = Array.isArray(result) ? result : [result];
          setChartDataSexo(
            dataArray.map((item) => ({
              name: item.sexo,
              value: Number(item.total || 0),
            })),
          );
        }

        if (resPaises.data) {
          const result = resPaises.data;
          const dataArray = Array.isArray(result) ? result : [result];
          setChartDataPaises(
            dataArray.map((item) => ({
              name: item.pais,
              value: Number(item.total || 0),
            })),
          );
        }

        if (resEdades.data) {
          const result = resEdades.data;
          const dataArray = Array.isArray(result) ? result : [result];
          setChartDataEdades(
            dataArray.map((item) => ({
              name: item.edad.toString(),
              value: Number(item.total || 0),
            })),
          );
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setTimeout(() => setLoading(false), 2000);
      }
    };
    fetchData();
  }, [url, tokenApi]);

  if (loading) {
    return (
      <Box className="w-full h-96 flex justify-center items-center p-4">
        <div className="flex flex-col items-center gap-2">
          <div style={{ width: "200px", height: "200px" }}>
            <Lottie
              lottieRef={lottieRef}
              animationData={Buscando}
              loop={true}
            />
          </div>
          <p className="text-center text-2xl text-gray-500 font-medium animate-pulse">
            Iniciando...
          </p>
        </div>
      </Box>
    );
  }

  return (
    <Box className="w-full flex justify-center p-0 bg-transparent">
      <div className="max-w-screen-xl w-full flex flex-col items-center">
        {/* Header con Logo */}
        {/*         <div className="hidden lg:flex items-center justify-center mb-6">
          <div className="w-64 filter dark:brightness-125">
            <Logo />
          </div>
        </div> */}

        {/* Bienvenida */}
        <div className="w-full px-4 text-left border-b border-gray-200 dark:border-gray-700 mb-10">
          <p className="text-blue-700 dark:text-blue-400 font-bold mb-4 text-lg">
            Bienvenido(a) al Back Office Legacy.
          </p>
        </div>

        {/* GRID PRINCIPAL: Sin fondos ni bordes en los contenedores */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* 1. Estatus de Fichas */}
          <div className="flex flex-col p-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 text-left">
              Estatus de Fichas
            </h2>
            <div className="w-full h-[350px]">
              <GraficosTorta data={chartData} />
            </div>
          </div>

          {/* 2. Clientes por Edades */}
          <div className="flex flex-col p-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 text-left">
              Clientes por Edad
            </h2>
            <div className="w-full h-[350px]">
              <GraficosBarras data={chartDataEdades} />
            </div>
          </div>

          {/* 3. Clientes por País */}
          <div className="flex flex-col p-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-left">
              Distribución Geográfica
            </h3>
            <div className="w-full h-[350px]">
              <GraficosBarras data={chartDataPaises} />
            </div>
          </div>

          {/* 4. Clientes por Género */}
          <div className="flex flex-col p-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-left">
              Clientes por Género
            </h3>
            <div className="w-full h-[350px]">
              <GraficosTorta data={chartDataSexo} />
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Inicio;
