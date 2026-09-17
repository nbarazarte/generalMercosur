import React from "react";

const TituloAppBo = () => {

  const nombreSistemaBo = import.meta.env.REACT_APP_NOMBRE_SISTEMA_BO;
  return (
    <div className="text-center text-2xl">{nombreSistemaBo}</div>
  );
};

export default TituloAppBo;
