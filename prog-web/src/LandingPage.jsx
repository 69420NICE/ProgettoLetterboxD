import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import RegistrazioneModal from "./RegistrazioneModal"; // <-- 1. Importiamo il modale
import "./LandingPage.css";

// Funzione helper per generare lo slug dell'URL
const generateSlug = (titolo) => {
  return titolo
    .toLowerCase()                     
    .replace(/[^a-z0-9]+/g, '-')       
    .replace(/(^-|-$)+/g, '');         
};

function LandingPage() {
  const [opere, setOpere] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 2. Stato per controllare il modale dalla Landing Page
  const [isRegistrazioneOpen, setIsRegistrazioneOpen] = useState(false);

  useEffect(() => {
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
      <Navbar />

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
            {/* Testi tradotti in italiano */}
            <h1>
              Tieni traccia dei film che hai visto.
              <br />
              Salva quelli che vuoi vedere.
              <br />
              Condividi con gli amici cosa merita.
            </h1>

            <p>
              Letterboxd è una piattaforma social per gli amanti del cinema. Tieni un diario di
              tutto ciò che guardi, vota e recensisci film, crea liste e
              segui l'attività dei tuoi amici.
            </p>

            {/* 3. Il pulsante ora apre il modale al click */}
            <button 
              className="hero-button"
              onClick={() => setIsRegistrazioneOpen(true)}
            >
              Inizia - è gratis!
            </button>
          </div>
        </section>

        <section className="content-section">
          <div className="section-title">
            <h2>Vedi tutti i film</h2>
            <Link to="/catalogo" className="more-link">Altro</Link>
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

        {/* Le 3 colonne tradotte in italiano */}
        <section className="three-columns">
          <article className="info-card">
            <h3>Tieni il tuo diario</h3>
            <p>Registra ogni film o serie che guardi e aggiungi una data, un voto e una recensione opzionale.</p>
          </article>
          <article className="info-card">
            <h3>Crea la tua watchlist</h3>
            <p>Salva i titoli che vuoi guardare in futuro e tienili organizzati in una coda personale.</p>
          </article>
          <article className="info-card">
            <h3>Condividi i tuoi gusti</h3>
            <p>Segui altri membri, scopri le loro liste e interagisci con le loro recensioni.</p>
          </article>
        </section>
      </main>

      {/* 4. Renderizziamo il modale se lo stato è true */}
      {isRegistrazioneOpen && (
        <RegistrazioneModal onClose={() => setIsRegistrazioneOpen(false)} />
      )}
    </div>
  );
}

export default LandingPage;