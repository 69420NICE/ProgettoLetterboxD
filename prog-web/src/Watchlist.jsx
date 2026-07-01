import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarLoggato from "./NavbarLoggato";

// Generatore di slug per i link ai film
const generateSlug = (titolo) => {
  return titolo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

function Watchlist() {
  const [filmWatchlist, setFilmWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errore, setErrore] = useState(null);
  const navigate = useNavigate();

  // Recupera l'utente
  const utenteString = localStorage.getItem("utente");
  const utente = utenteString ? JSON.parse(utenteString) : null;

  useEffect(() => {
    // Se non sei loggato, ti caccio alla home
    if (!utente) {
      navigate("/");
      return;
    }

    const fetchWatchlist = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/watchlist/${utente.id}`);
        if (!response.ok) throw new Error("Errore nel caricamento della watchlist");
        
        const data = await response.json();
        setFilmWatchlist(data);
        setIsLoading(false);
      } catch (err) {
        setErrore(err.message);
        setIsLoading(false);
      }
    };

    fetchWatchlist();
  }, [utente, navigate]);

  // Funzione per rimuovere un film dalla watchlist
  const handleRimuovi = async (id_opera) => {
    try {
      const response = await fetch(`http://localhost:3001/api/watchlist/${utente.id}/${id_opera}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Impossibile rimuovere il film");

      // Aggiorniamo l'interfaccia rimuovendo l'elemento eliminato senza ricaricare la pagina
      setFilmWatchlist(filmWatchlist.filter(film => film.id_opera !== id_opera));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!utente) return null;

  return (
    <div style={{ background: "#14181c", minHeight: "100vh", color: "white" }}>
      <NavbarLoggato />

      <main style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px" }}>
        
        <header style={{ borderBottom: "1px solid #445566", paddingBottom: "10px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>Watchlist</h1>
          <span style={{ color: "#8c9babc4", fontWeight: "bold" }}>{filmWatchlist.length} {filmWatchlist.length === 1 ? 'film' : 'film'}</span>
        </header>

        {isLoading && <p>Caricamento watchlist...</p>}
        {errore && <p style={{ color: "#ff4040" }}>{errore}</p>}

        {/* Stato Vuoto */}
        {!isLoading && !errore && filmWatchlist.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#2c3440", borderRadius: "6px" }}>
            <h3 style={{ fontSize: "1.5rem", margin: "0 0 10px 0" }}>La tua Watchlist è vuota</h3>
            <p style={{ color: "#8c9babc4", marginBottom: "20px" }}>Aggiungi i film che vorresti guardare in futuro.</p>
            <Link to="/catalogo" style={{ background: "#00b020", color: "white", padding: "10px 20px", borderRadius: "4px", textDecoration: "none", fontWeight: "bold", textTransform: "uppercase" }}>
              Esplora Film
            </Link>
          </div>
        )}

        {/* Griglia dei film salvati */}
        {!isLoading && !errore && filmWatchlist.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "20px" }}>
            {filmWatchlist.map((film) => (
              <div key={film.id_opera} style={{ display: "flex", flexDirection: "column" }}>
                
                {/* Poster cliccabile */}
                <Link to={`/${generateSlug(film.titolo)}`} style={{ textDecoration: "none" }}>
                  <img 
                    src={film.poster} 
                    alt={film.titolo} 
                    style={{ width: "100%", borderRadius: "4px", border: "1px solid #445566", aspectRatio: "2/3", objectFit: "cover", transition: "border 0.2s" }}
                    onMouseOver={(e) => e.target.style.borderColor = "#00e054"}
                    onMouseOut={(e) => e.target.style.borderColor = "#445566"}
                  />
                  <h3 style={{ fontSize: "0.9rem", color: "white", margin: "10px 0 5px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {film.titolo}
                  </h3>
                </Link>

                {/* Bottone Rimuovi */}
                <button 
                  onClick={() => handleRimuovi(film.id_opera)}
                  style={{
                    background: "transparent", border: "none", color: "#8c9babc4", 
                    fontSize: "0.8rem", cursor: "pointer", textAlign: "left", padding: 0, marginTop: "auto", transition: "color 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.color = "#ff4040"}
                  onMouseOut={(e) => e.target.style.color = "#8c9babc4"}
                >
                  Rimuovi dalla lista
                </button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default Watchlist;