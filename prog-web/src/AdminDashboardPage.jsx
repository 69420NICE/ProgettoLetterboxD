import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavbarGlobale from "./NavbarGlobale";

function AdminDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Lucchetto di sicurezza: controlliamo che chi naviga sia davvero un admin
    const utenteInStorage = localStorage.getItem("utente");
    if (!utenteInStorage) {
      navigate("/");
      return;
    }

    const userData = JSON.parse(utenteInStorage);
    if (userData.ruolo !== "amministratore") {
      navigate("/dashboard");
      return;
    }
  }, [navigate]);

  // Stili della tabella di controllo
  const tableStyle = { width: "100%", borderCollapse: "collapse", color: "#8c9babc4", fontSize: "0.95rem" };
  const thStyle = { textAlign: "left", padding: "15px", borderBottom: "2px solid #445566", color: "white", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.5px" };
  const tdStyle = { padding: "18px 15px", borderBottom: "1px solid #2c3440" };
  const btnStyle = { background: "#40bcf4", color: "white", border: "none", padding: "6px 14px", borderRadius: "3px", cursor: "pointer", textDecoration: "none", fontWeight: "bold", fontSize: "0.85rem" };

  return (
    <div style={{ minHeight: "100vh", background: "#14181c", color: "white" }}>
      <NavbarGlobale />

      <main style={{ paddingTop: "120px", maxWidth: "1000px", margin: "0 auto", paddingInline: "20px" }}>
        
        {/* Intestazione */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px", borderBottom: "1px solid #445566", paddingBottom: "15px" }}>
          <h1 style={{ fontSize: "2.2rem", margin: 0, fontWeight: "bold", color: "white" }}>Pannello Amministrativo</h1>
          <span style={{ background: "#4a1919", color: "#ff4040", padding: "6px 12px", borderRadius: "3px", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>
            Admin Area
          </span>
        </div>

        <p style={{ color: "#8c9babc4", marginBottom: "30px", lineHeight: "1.5" }}>
          Benvenuto nel centro di controllo. Da questa interfaccia puoi gestire le entità relazionali del database, modificare record dinamici o inserire nuovi contenuti multimediali all'interno dell'applicazione.
        </p>

        {/* Tabella dei Hub Amministrativi */}
        <div style={{ background: "#1c2228", borderRadius: "6px", padding: "10px 20px", border: "1px solid #2c3440", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Sezione Gestionale</th>
                <th style={thStyle}>Descrizione Operazioni Disponibili</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Azione</th>
              </tr>
            </thead>
<tbody>
  <tr>
    <td style={{ ...tdStyle, color: "white", fontWeight: "bold" }}>Gestione Opere</td>
    <td style={tdStyle}>Modifica inline, aggiunta di nuovi film/serie tv, gestione trame, durate, poster e cancellazione record dal database relazionale.</td>
    <td style={{ ...tdStyle, textAlign: "right" }}>
      <Link to="/admin/opere" style={btnStyle}>Apri</Link>
    </td>
  </tr>
  <tr>
    <td style={{ ...tdStyle, color: "white", fontWeight: "bold" }}>Gestione Professionisti</td>
    <td style={tdStyle}>Amministrazione del database del cast e della regia. Inserimento biografie, aggiornamento URL delle immagini dei volti ed eliminazioni.</td>
    <td style={{ ...tdStyle, textAlign: "right" }}>
      <Link to="/admin/professionisti" style={btnStyle}>Apri</Link>
    </td>
  </tr>
  {/* NUOVA RIGA AGGIUNTA */}
  <tr>
    <td style={{ ...tdStyle, color: "white", fontWeight: "bold" }}>Gestione Generi</td>
    <td style={tdStyle}>Configurazione delle categorie dei film. Aggiunta di nuovi generi cinematografici, modifiche testuali ed eliminazioni a cascata.</td>
    <td style={{ ...tdStyle, textAlign: "right" }}>
      <Link to="/admin/generi" style={btnStyle}>Apri</Link>
    </td>
  </tr>
</tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboardPage;