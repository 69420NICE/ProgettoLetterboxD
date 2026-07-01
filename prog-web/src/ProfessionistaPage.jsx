import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import NavbarGlobale from "./NavbarGlobale";
import "./LandingPage.css"; 

// Funzione helper per convertire il titolo del film in url
const generateSlug = (testo) => {
  return testo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

function ProfessionistaPage() {
  const { slug } = useParams();
  const [attore, setAttore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDettagliAttore = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/professionisti/dettaglio/${slug}`);
        
        if (!response.ok) {
          throw new Error("Attore non trovato");
        }
        
        const data = await response.json();
        setAttore(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Errore fetch attore:", err);
        setError("Impossibile caricare i dati in questo momento.");
        setIsLoading(false);
      }
    };

    fetchDettagliAttore();
  }, [slug]);

  if (isLoading) return <div style={{ color: "white", padding: "100px", textAlign: "center", background: "#14181c", minHeight: "100vh" }}>Caricamento profilo...</div>;
  if (error) return <div style={{ color: "white", padding: "100px", textAlign: "center", background: "#14181c", minHeight: "100vh" }}>{error}</div>;
  if (!attore) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#14181c", color: "#9ab" }}>
      <NavbarGlobale />

      <main style={{ paddingTop: "100px", maxWidth: "1000px", margin: "0 auto", paddingLeft: "40px", paddingRight: "40px" }}>
        
        {/* Layout a due colonne che parte fin dalla cima */}
        <div style={{ display: "flex", gap: "50px", alignItems: "flex-start" }}>
          
          {/* Colonna Sinistra: Nome, Linea divisoria e Filmografia */}
          <section style={{ flexGrow: 1 }}>
            
            {/* Il titolo è dentro questa colonna, quindi la linea si ferma prima dell'immagine */}
            <h1 style={{ color: "white", fontSize: "3rem", margin: "0 0 30px 0", borderBottom: "1px solid #445566", paddingBottom: "15px" }}>
              {attore.nome}
            </h1>

            <h2 style={{ color: "white", fontWeight: "normal", fontSize: "1.2rem", margin: "0 0 20px 0" }}>
              Appears in <span style={{ color: "#8c9babc4" }}>{attore.filmografia.length} films</span>
            </h2>

            {/* Griglia con riquadri più piccoli (min 140px) */}
            <div className="film-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "15px" }}>
              {attore.filmografia.map((film) => (
                <div key={film.id} style={{ display: "flex", flexDirection: "column" }}>
                  {/* Locandina del film (senza il nome del personaggio sotto) */}
                  <Link 
                    to={`/${generateSlug(film.titolo)}`} 
                    className="film-card"
                    style={{ 
                      backgroundImage: `url(${film.poster})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'block',
                      width: '100%', 
                      aspectRatio: '3/2', // Forza un formato rettangolare largo (tipo orizzontale)
                      borderRadius: '4px',
                      border: '1px solid #445566',
                      transition: 'transform 0.2s ease, border-color 0.2s ease' // Aggiunto un leggero effetto hover
                    }}
                    onMouseOver={(e) => e.target.style.borderColor = "#40bcf4"}
                    onMouseOut={(e) => e.target.style.borderColor = "#445566"}
                  >
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Colonna Destra (Sidebar): Foto Profilo allineata in alto col testo */}
          <aside style={{ flexShrink: 0, width: "230px" }}>
            <div style={{ width: "230px", height: "345px", overflow: "hidden", borderRadius: "5px", border: "1px solid #445566", boxShadow: "0 0 10px rgba(0,0,0,0.5)" }}>
              {attore.immagine ? (
                <img src={attore.immagine} alt={attore.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#2c3440", display: "flex", alignItems: "center", justifyContent: "center" }}>No Photo</div>
              )}
            </div>
          </aside>

        </div>

      </main>
    </div>
  );
}

export default ProfessionistaPage;