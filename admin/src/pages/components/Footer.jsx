export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="ma-topbar"
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "10px 24px",
        boxSizing: "border-box",
        width: "100%",
        fontSize: "0.825rem", // Fuente más pequeña y sutil (similar a la descripción del header)
      }}
    >
      <span>&copy; {currentYear} MERCOSUR Casa de Bolsa S.A.</span>
    </footer>
  );
}
