import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar"; // Importa il nuovo componente
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

  const features = [
    "Track films you’ve watched.",
    "Save those you want to see.",
    "Tell your friends what’s good.",
  ];

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
      {/* Utilizzo del componente estratto */}
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
            <h1>
              Track films you’ve watched.
              <br />
              Save those you want to see.
              <br />
              Tell your friends what’s good.
            </h1>

            <p>
              Letterboxd is a social platform for film lovers. Keep a diary of
              everything you watch, rate and review films, create lists and
              follow your friends’ activity.
            </p>

            <button className="hero-button">Get started, it’s free</button>

            <div className="feature-row">
              {features.map((feature) => (
                <div className="feature-pill" key={feature}>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-title">
            <h2>Popular this week</h2>
            <a href="#more" className="more-link">More</a>
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
            <h3>Keep your diary</h3>
            <p>Log every film or series you watch and attach a date, rating and optional review.</p>
          </article>
          <article className="info-card">
            <h3>Build your watchlist</h3>
            <p>Save titles you want to watch later and keep them organized in a personal queue.</p>
          </article>
          <article className="info-card">
            <h3>Share your taste</h3>
            <p>Follow other members, discover their lists and interact with their reviews.</p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;