import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// 1. IMPORTIAMO LA NAVBAR CORRETTA (quella senza Accedi/Registrati)
import NavbarLoggato from "./NavbarLoggato"; 
import "./LandingPage.css"; 

const generateSlug = (titolo) => {
  return titolo
    .toLowerCase()                     
    .replace(/[^a-z0-9]+/g, '-')       
    .replace(/(^-|-$)+/g, '');         
};

function Dashboard() {
  const [opere, setOpere] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [username, setUsername] = useState("Cinefilo"); 

  useEffect(() => {
    // Recuperiamo il nome dell'utente dal localStorage
    const userInStorage = localStorage.getItem("utente");
    if (userInStorage) {
      try {
        const userData = JSON.parse(userInStorage);
        setUsername(userData.username);
      } catch (e) {
        console.error("Errore nel parse dell'utente:", e);
      }
    }

    const fetchOpere = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/opere");
        
        if (!response.ok) {
          throw new Error("Errore durante il recupero dei dati dal server");
        }
        
        const data = await response.json();
        setOpere(data.slice(0, 6)); 
        setIsLoading(false);
      } catch (err) {
        console.error("Errore fetch opere:", err);
        setError("Impossibile caricare i film in questo momento.");
        setIsLoading(false);
      }
    };

    fetchOpere();
  }, []);

  return (
    <div className="landing-page">
      
      {/* 2. USIAMO LA NAVBAR LOGGATA QUI */}
      <NavbarLoggato />

      <main>
        <section className="hero">
          <div className="poster-background" id="films">
            {isLoading && <p className="loading-text">Caricamento opere dal database...</p>}
            {error && <p className="error-text">{error}</p>}
            
            {!isLoading && !error && opere.map((opera) => (
              <article 
                className="poster" 
                key={opera.id}
                style={{ 
                  backgroundImage: `url(${opera.poster})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
              </article>
            ))}
          </div>

          <div className="hero-overlay"></div>

          <div className="hero-content">
            <h1>
              Bentornato, {username}!
            </h1>

            <p>
              Pronto per una nuova maratona? Esplora le nuove uscite, aggiorna il tuo diario 
              e scopri cosa stanno guardando i tuoi amici.
            </p>

            <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "30px" }}>
              <Link to="/catalogo" className="hero-button" style={{ textDecoration: 'none' }}>
                Esplora Film
              </Link>
              <Link to="/profilo" className="hero-button" style={{ textDecoration: 'none', background: '#445566' }}>
                Il Mio Diario
              </Link>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-title">
            <h2>Novità in catalogo</h2>
            <Link to="/catalogo" className="more-link">Vedi tutti</Link>
          </div>

          <div className="film-grid">
            {isLoading && <p>Caricamento catalogo...</p>}
            {error && <p>{error}</p>}

            {!isLoading && !error && opere.map((opera) => (
              <Link 
                to={`/${generateSlug(opera.titolo)}`} 
                className="film-card" 
                key={`grid-${opera.id}`}
                style={{ 
                  backgroundImage: `url(${opera.poster})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'block'
                }}
              >
              </Link>
            ))}
          </div>
        </section>

        <section className="three-columns">
          <article className="info-card">
            <h3>Il tuo diario è vuoto?</h3>
            <p>Non dimenticare di recensire le tue ultime visioni per mantenere le tue statistiche aggiornate.</p>
          </article>
          <article className="info-card">
            <h3>Sfoltisci la Watchlist</h3>
            <p>Hai diversi film in attesa. Che ne dici di guardarne uno stasera?</p>
          </article>
          <article className="info-card">
            <h3>Attività degli amici</h3>
            <p>Scopri cosa hanno guardato di recente i tuoi contatti e leggi le loro ultime recensioni.</p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;