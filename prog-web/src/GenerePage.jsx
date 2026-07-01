import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import NavbarGlobale from "./NavbarGlobale";
import "./LandingPage.css"; 

const generateSlug = (testo) => {
  return testo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

function GenerePage() {
  const { slug } = useParams();
  const [genere, setGenere] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDettagliGenere = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/generi/dettaglio/${slug}`);
        
        if (!response.ok) {
          throw new Error("Genere non trovato");
        }
        
        const data = await response.json();
        setGenere(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Errore fetch genere:", err);
        setError("Impossibile caricare i dati in questo momento.");
        setIsLoading(false);
      }
    };

    fetchDettagliGenere();
  }, [slug]);

  if (isLoading) return <div style={{ color: "white", padding: "100px", textAlign: "center", background: "#14181c", minHeight: "100vh" }}>Caricamento genere...</div>;
  if (error) return <div style={{ color: "white", padding: "100px", textAlign: "center", background: "#14181c", minHeight: "100vh" }}>{error}</div>;
  if (!genere) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#14181c", color: "#9ab" }}>
      <NavbarGlobale />

      <main style={{ paddingTop: "100px", maxWidth: "1000px", margin: "0 auto", paddingLeft: "40px", paddingRight: "40px" }}>
        
        <h1 style={{ color: "white", fontSize: "3rem", margin: "0 0 30px 0", borderBottom: "1px solid #445566", paddingBottom: "15px" }}>
          {genere.nome_genere}
        </h1>

        <h2 style={{ color: "white", fontWeight: "normal", fontSize: "1.2rem", margin: "0 0 20px 0" }}>
          There are <span style={{ color: "#8c9babc4" }}>{genere.opere.length} films</span> in this genre
        </h2>

        {/* Griglia a tutta larghezza con le locandine rettangolari */}
        <div className="film-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "15px" }}>
          {genere.opere.map((film) => (
            <div key={film.id} style={{ display: "flex", flexDirection: "column" }}>
              <Link 
                to={`/${generateSlug(film.titolo)}`} 
                className="film-card"
                style={{ 
                  backgroundImage: `url(${film.poster})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'block',
                  width: '100%', 
                  aspectRatio: '3/2',
                  borderRadius: '4px',
                  border: '1px solid #445566',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.borderColor = "#40bcf4"}
                onMouseOut={(e) => e.target.style.borderColor = "#445566"}
              >
              </Link>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

export default GenerePage;