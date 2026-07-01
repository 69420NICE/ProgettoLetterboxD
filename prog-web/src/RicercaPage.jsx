import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import NavbarGlobale from "./NavbarGlobale";
import "./LandingPage.css"; 

const generateSlug = (testo) => {
  return testo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

function RicercaPage() {
  const { query } = useParams(); // Prende la parola cercata dall'URL
  const [risultati, setRisultati] = useState({ opere: [], professionisti: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRisultati = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3001/api/ricerca/${query}`);
        
        if (!response.ok) {
          throw new Error("Errore durante la ricerca");
        }
        
        const data = await response.json();
        setRisultati(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Errore fetch ricerca:", err);
        setError("Impossibile caricare i risultati in questo momento.");
        setIsLoading(false);
      }
    };

    fetchRisultati();
  }, [query]); // L'effetto scatta ogni volta che cambia la query di ricerca

  if (isLoading) return <div style={{ color: "white", padding: "100px", textAlign: "center", background: "#14181c", minHeight: "100vh" }}>Ricerca in corso...</div>;
  if (error) return <div style={{ color: "white", padding: "100px", textAlign: "center", background: "#14181c", minHeight: "100vh" }}>{error}</div>;

  const haRisultati = risultati.opere.length > 0 || risultati.professionisti.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#14181c", color: "#9ab" }}>
      <NavbarGlobale />

      <main style={{ paddingTop: "100px", maxWidth: "1000px", margin: "0 auto", paddingLeft: "40px", paddingRight: "40px", paddingBottom: "50px" }}>
        
        <h1 style={{ color: "white", fontSize: "2rem", margin: "0 0 30px 0", borderBottom: "1px solid #445566", paddingBottom: "15px" }}>
          Risultati per "{query}"
        </h1>

        {!haRisultati && (
          <p style={{ fontSize: "1.2rem" }}>Nessun film o persona trovata con questo nome.</p>
        )}

        {/* Sezione Film */}
        {risultati.opere.length > 0 && (
          <section style={{ marginBottom: "50px" }}>
            <h2 style={{ color: "white", fontSize: "1.5rem", marginBottom: "20px" }}>Film trovati</h2>
            <div className="film-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "15px" }}>
              {risultati.opere.map((film) => (
                <Link 
                  key={film.id}
                  to={`/${generateSlug(film.titolo)}`} 
                  className="film-card"
                  style={{ 
                    backgroundImage: `url(${film.poster})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'block',
                    width: '100%', 
                    aspectRatio: '2/3', 
                    borderRadius: '4px',
                    border: '1px solid #445566'
                  }}
                >
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Sezione Professionisti */}
        {risultati.professionisti.length > 0 && (
          <section>
            <h2 style={{ color: "white", fontSize: "1.5rem", marginBottom: "20px" }}>Persone trovate</h2>
            <div className="film-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "15px" }}>
              {risultati.professionisti.map((persona) => (
                <div key={persona.id} style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                  <Link 
                    to={`/attore/${generateSlug(persona.nome)}`} 
                    style={{ 
                      backgroundImage: `url(${persona.immagine})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'block',
                      width: '100px', 
                      height: '100px',
                      borderRadius: '50%', // Le foto delle persone sono tonde per differenziarle dai film!
                      border: '2px solid #445566'
                    }}
                  >
                  </Link>
                  <span style={{ color: "white", fontSize: "0.9rem", textAlign: "center" }}>{persona.nome}</span>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default RicercaPage;