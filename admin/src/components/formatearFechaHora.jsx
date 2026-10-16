  const formatearFechaHora = (fechaStr) => {
    if (!fechaStr) return "—";
    const fechaObj = new Date(fechaStr);
    return (
      <div>
        <div>{fechaObj.toLocaleDateString("es-VE")}</div>
        <div style={{ color: "var(--merco-muted)", fontSize: "10px" }}>
          {fechaObj.toLocaleTimeString("es-VE", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      </div>
    );
  };

export default formatearFechaHora;
