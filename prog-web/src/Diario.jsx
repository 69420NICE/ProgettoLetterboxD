import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarGlobale from "./NavbarGlobale";

// Funzione helper per gli slug dei link
const generateSlug = (titolo) => {
  return titolo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

function Diario() {
  const [visioni, setVisioni] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errore, setErrore] = useState(null);
  const navigate = useNavigate();

  // Recupera l'utente loggato
  const utenteString = localStorage.getItem("utente");
  const utente = utenteString ? JSON.parse(utenteString) : null;

  useEffect(() => {
    // Se non c'è utente, rimanda alla home
    if (!utente) {
      navigate("/");
      return;
    }

    const fetchDiario = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/diario/${utente.id}`);
        if (!response.ok) throw new Error("Errore nel caricamento del diario");
        
        const data = await response.json();
        setVisioni(data);
        setIsLoading(false);
      } catch (err) {
        setErrore(err.message);
        setIsLoading(false);
      }
    };

    fetchDiario();
  }, [utente, navigate]);

  const gestisciEliminazione = async (id_visione) => {
    if (!window.confirm("Sei sicuro di voler rimuovere questo film dal diario?")) return;

    try {
      const response = await fetch(`http://localhost:3001/api/diario/${id_visione}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Errore durante l'eliminazione");

      // Aggiorniamo l'interfaccia rimuovendo l'elemento eliminato
      setVisioni(visioni.filter(v => v.id_visione !== id_visione));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!utente) return null;

  return (
    <div style={{ background: "#14181c", minHeight: "100vh", color: "white" }}>
      <NavbarGlobale />

      <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
        <h1 style={{ borderBottom: "1px solid #445566", paddingBottom: "10px", marginBottom: "30px" }}>
          Il Diario di {utente.username}
        </h1>

        {isLoading && <p>Caricamento del diario in corso...</p>}
        {errore && <p style={{ color: "#ff4040" }}>{errore}</p>}

        {!isLoading && !errore && visioni.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", background: "#2c3440", borderRadius: "6px" }}>
            <h3>Il tuo diario è vuoto</h3>
            <p style={{ color: "#8c9babc4" }}>Non hai ancora registrato nessuna visione.</p>
            <Link to="/catalogo" style={{ color: "#00e054", textDecoration: "none", fontWeight: "bold" }}>
              Esplora i film per iniziare
            </Link>
          </div>
        )}

        {/* Lista dei film visti */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {visioni.map((visione) => {
            // Formattiamo la data per renderla più leggibile
            const dataFormattata = new Date(visione.data_visione).toLocaleDateString('it-IT', {
              day: 'numeric', month: 'long', year: 'numeric'
            });

            return (
              <article 
                key={visione.id_visione} 
                style={{ 
                  display: "flex", alignItems: "center", gap: "20px", background: "#2c3440", 
                  padding: "15px", borderRadius: "6px", border: "1px solid #445566"
                }}
              >
                {/* Poster cliccabile */}
                <Link to={`/${generateSlug(visione.titolo)}`}>
                  <img 
                    src={visione.poster} 
                    alt={visione.titolo} 
                    style={{ width: "70px", height: "105px", objectFit: "cover", borderRadius: "4px", border: "1px solid #8c9babc4" }}
                  />
                </Link>

                {/* Dettagli log */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 5px 0", fontSize: "1.2rem" }}>
                    <Link to={`/${generateSlug(visione.titolo)}`} style={{ color: "white", textDecoration: "none" }}>
                      {visione.titolo}
                    </Link>
                  </h3>
                  <p style={{ margin: 0, color: "#8c9babc4", fontSize: "0.9rem" }}>
                    Visto il <strong>{dataFormattata}</strong>
                  </p>
                </div>

                {/* Pulsante per rimuovere la visione */}
                <button 
                  onClick={() => gestisciEliminazione(visione.id_visione)}
                  style={{
                    background: "transparent", border: "1px solid #ff4040", color: "#ff4040",
                    padding: "8px 12px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold"
                  }}
                  onMouseOver={(e) => { e.target.style.background = "#ff4040"; e.target.style.color = "white"; }}
                  onMouseOut={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#ff4040"; }}
                >
                  Rimuovi
                </button>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Diario;