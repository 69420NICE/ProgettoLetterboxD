import { Link } from "react-router-dom";

function Catalogo() {
  return (
    <main style={{ minHeight: "100vh", background: "#14181c", color: "white", padding: "40px" }}>
      <Link to="/" style={{ color: "#40bcf4" }}>
        ← Torna alla Home
      </Link>

      <h1>Catalogo opere</h1>
      <p>Pagina catalogo funzionante.</p>
    </main>
  );
}

export default Catalogo;