import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; // Aggiunto Link qui
import Navbar from "./Navbar";

// Funzione helper per generare lo slug dell'URL dai nomi
const generateSlug = (testo) => {
  return testo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

function FilmPage() {
  // useParams estrae lo "slug" dall'URL (es. "il-padrino")
  const { slug } = useParams();
  
  const [film, setFilm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilmDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/opere/dettaglio/${slug}`);
        
        if (!response.ok) {
          throw new Error("Film non trovato o errore del server");
        }
        
        const data = await response.json();
        setFilm(data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchFilmDetails();
  }, [slug]);

  if (isLoading) return <div style={{ color: "white", padding: "100px", textAlign: "center" }}>Caricamento dati del film...</div>;
  if (error) return <div style={{ color: "white", padding: "100px", textAlign: "center" }}>{error}</div>;
  if (!film) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#14181c", color: "#9ab" }}>
      <Navbar />

      {/* Sfondo sfocato per dare l'effetto Backdrop di Letterboxd */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, height: "500px",
        backgroundImage: `url(${film.poster})`,
        backgroundSize: "cover",
        backgroundPosition: "center 20%",
        filter: "blur(20px) brightness(0.2)",
        zIndex: 0
      }}></div>

      <main style={{ 
        position: "relative", 
        zIndex: 1, 
        paddingTop: "120px", 
        maxWidth: "960px", 
        margin: "0 auto",
        display: "flex",
        gap: "40px"
      }}>
        
        {/* Colonna Sinistra: Poster e Azioni */}
        <aside style={{ width: "230px", flexShrink: 0 }}>
          <img 
            src={film.poster} 
            alt={`Poster di ${film.titolo}`} 
            style={{ 
              width: "100%", 
              borderRadius: "4px", 
              border: "1px solid #445566",
              boxShadow: "0 0 10px rgba(0,0,0,0.5)"
            }} 
          />
          {/* Qui in futuro andranno i tasti "Watch", "Like", "Review" */}
        </aside>

        {/* Colonna Destra: Dettagli Film */}
        <article style={{ flexGrow: 1, paddingTop: "10px" }}>
          
          <h1 style={{ color: "white", fontSize: "2.5rem", margin: "0 0 5px 0", display: "inline-block" }}>
            {film.titolo}
          </h1>
          
          <div style={{ fontSize: "1.1rem", marginBottom: "20px" }}>
            <span style={{ color: "white", fontWeight: "bold" }}>{film.anno_uscita}</span>
            
            {/* Sezione Regista resa cliccabile */}
            {film.regista && (
              <>
                <span style={{ margin: "0 8px" }}>Directed by</span>
                <Link 
                  to={`/attore/${generateSlug(film.regista)}`} 
                  style={{ color: "white", fontWeight: "bold", textDecoration: "none" }}
                  onMouseOver={(e) => e.target.style.color = "#40bcf4"}
                  onMouseOut={(e) => e.target.style.color = "white"}
                >
                  {film.regista}
                </Link>
              </>
            )}
          </div>

          {/* Sezione Trama */}
          <div style={{ marginBottom: "30px", lineHeight: "1.6", color: "#8c9babc4" }}>
            <p>{film.trama}</p>
          </div>

          {/* Sezione Cast resa cliccabile */}
          {film.cast && film.cast.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <span style={{ display: "block", textTransform: "uppercase", fontSize: "0.8rem", color: "#678", borderBottom: "1px solid #456", paddingBottom: "5px", marginBottom: "10px" }}>
                Cast
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {film.cast.map(attore => (
                  <Link 
                    key={attore.id} 
                    to={`/attore/${generateSlug(attore.nome)}`}
                    style={{ 
                      background: "#2c3440", 
                      color: "#8c9babc4", 
                      padding: "4px 8px", 
                      borderRadius: "3px", 
                      fontSize: "0.9rem",
                      textDecoration: "none",
                      display: "inline-block"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#40bcf4";
                      e.target.style.color = "white";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "#2c3440";
                      e.target.style.color = "#8c9babc4";
                    }}
                  >
                    {attore.nome}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sezione Dettagli (Generi e Minutaggio) */}
          <div style={{ display: "flex", gap: "30px", marginTop: "30px" }}>
            {film.generi && film.generi.length > 0 && (
              <div>
                <span style={{ display: "block", textTransform: "uppercase", fontSize: "0.8rem", color: "#678", borderBottom: "1px solid #456", paddingBottom: "5px", marginBottom: "10px" }}>
                  Genres
                </span>
                <div style={{ display: "flex", gap: "10px" }}>
{film.generi.map((genere, index) => (
    <Link 
      key={index} 
      to={`/genere/${generateSlug(genere)}`}
      style={{ 
        color: "#8c9babc4", 
        fontSize: "0.9rem",
        textDecoration: "none",
        background: "#2c3440",
        padding: "4px 8px",
        borderRadius: "3px"
      }}
      onMouseOver={(e) => {
        e.target.style.background = "#40bcf4";
        e.target.style.color = "white";
      }}
      onMouseOut={(e) => {
        e.target.style.background = "#2c3440";
        e.target.style.color = "#8c9babc4";
      }}
    >
      {genere}
    </Link>
  ))}
                </div>
              </div>
            )}

            {film.durata_minuti && (
              <div>
                <span style={{ display: "block", textTransform: "uppercase", fontSize: "0.8rem", color: "#678", borderBottom: "1px solid #456", paddingBottom: "5px", marginBottom: "10px" }}>
                  Runtime
                </span>
                <span style={{ color: "white", fontSize: "0.9rem" }}>{film.durata_minuti} mins</span>
              </div>
            )}
          </div>

        </article>
      </main>
    </div>
  );
}

export default FilmPage;