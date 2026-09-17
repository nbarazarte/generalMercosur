import React from "react";

const TituloApp = () => {

  const nombreSistema = import.meta.env.REACT_APP_NOMBRE_SISTEMA;
  return (
    <div className="text-center text-2xl">{nombreSistema}</div>
  );
};

export default TituloApp;
