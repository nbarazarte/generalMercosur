import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import FormatoFicha from "./FormatoFicha"; // El componente que ya tienes

// Datos de prueba para ver cómo se llenan los campos mientras diseñas
const mockDatos = {
  nombres: "JUAN ALBERTO",
  apellidos: "PEREZ RODRIGUEZ",
  cedula: "V-12.345.678",
  ciudad: "CARACAS",
  fecha_actualizacion: "2026-01-30T10:00:00Z",
  nacionalidad: "VENEZOLANA",
  profesion: "INGENIERO",
  // ... añade los campos que quieras testear
  direccion:"Vivamus tempor lorem elit, eget fringilla libero auctor non. Mauris egestas tellus sit amet est varius, ut ultricies est pretium. Donec nibh lacus, fringilla quis congue et, aliquet ut lorem. Duis imperdiet sit amet mi a fringilla. In hac habitasse platea dictumst. Vestibulum."
};

const Preview = () => (
  <div style={{ width: "100vw", height: "100vh" }}>
    <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
      <FormatoFicha datos={mockDatos} />
    </PDFViewer>
  </div>
);

export default Preview;