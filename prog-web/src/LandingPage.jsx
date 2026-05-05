import React from "react";
import "./LandingPage.css";

function LandingPage() {
  const posters = [
    { title: "The Night Frame", year: "2025", rating: "4.2" },
    { title: "Silent Room", year: "2024", rating: "3.9" },
    { title: "Blue Horizon", year: "2023", rating: "4.5" },
    { title: "Last Scene", year: "2022", rating: "4.1" },
    { title: "Neon Dreams", year: "2025", rating: "4.7" },
  ];

  const features = [
    {
      title: "Tieni traccia delle visioni",
      description:
        "Registra i film e le serie che hai visto, aggiungi la data di visione e costruisci il tuo diario personale.",
    },
    {
      title: "Crea la tua Watchlist",
      description:
        "Salva le opere che vuoi vedere in futuro e ritrovale facilmente quando non sai cosa guardare.",
    },
    {
      title: "Vota e commenta",
      description:
        "Assegna un rating, scrivi un commento e condividi la tua opinione con altri appassionati.",
    },
    {
      title: "Crea liste tematiche",
      description:
        "Organizza film e serie in liste personalizzate, pubbliche o private, in base ai tuoi gusti.",
    },
  ];

  return (
    <div className="landing-page">
      <header className="navbar">
        <div className="logo">
          <span className="logo-dot green"></span>
          <span className="logo-dot orange"></span>
          <span className="logo-dot blue"></span>
          <span className="logo-text">FilmDiary</span>
        </div>

        <nav className="nav-links">
          <a href="#features">Funzionalità</a>
          <a href="#popular">Popolari</a>
          <a href="#community">Community</a>
          <a href="#login">Accedi</a>
          <button className="nav-button">Registrati</button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">Il tuo diario cinematografico personale</p>

            <h1>
              Traccia ciò che guardi.
              <br />
              Salva ciò che vuoi vedere.
              <br />
              Scopri cosa piace agli altri.
            </h1>

            <p className="hero-description">
              Una piattaforma per registrare film e serie, creare liste,
              scrivere commenti, assegnare voti e seguire le attività degli
              altri utenti.
            </p>

            <div className="hero-actions">
              <button className="primary-button">Inizia ora</button>
              <button className="secondary-button">Esplora il catalogo</button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>12k+</strong>
                <span>opere catalogate</span>
              </div>
              <div>
                <strong>45k+</strong>
                <span>recensioni</span>
              </div>
              <div>
                <strong>8k+</strong>
                <span>liste create</span>
              </div>
            </div>
          </div>

          <div className="poster-wall" id="popular">
            {posters.map((poster, index) => (
              <article className={`poster-card poster-${index + 1}`} key={poster.title}>
                <div className="poster-gradient"></div>
                <div className="poster-info">
                  <h3>{poster.title}</h3>
                  <p>{poster.year}</p>
                  <span>★ {poster.rating}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <p className="eyebrow">Funzionalità principali</p>
            <h2>Tutto quello che serve per organizzare la tua esperienza cinematografica.</h2>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon">●</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="community-section" id="community">
          <div className="community-card">
            <div>
              <p className="eyebrow">Community</p>
              <h2>Segui altri utenti e scopri nuove opere attraverso le loro attività.</h2>
              <p>
                Visualizza profili, commenti, voti, liste pubbliche e attività
                recenti. Perché scegliere un film da soli era troppo semplice,
                evidentemente.
              </p>
            </div>

            <div className="activity-feed">
              <div className="activity-item">
                <span className="avatar">L</span>
                <p>
                  <strong>Luca</strong> ha aggiunto <em>Neon Dreams</em> alla watchlist.
                </p>
              </div>

              <div className="activity-item">
                <span className="avatar">F</span>
                <p>
                  <strong>Francesco</strong> ha votato <em>Blue Horizon</em> ★★★★★
                </p>
              </div>

              <div className="activity-item">
                <span className="avatar">N</span>
                <p>
                  <strong>Nicu</strong> ha creato la lista <em>Film da recuperare</em>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Costruisci il tuo archivio personale.</h2>
          <p>
            Registra le tue visioni, organizza le opere preferite e partecipa
            alla community.
          </p>
          <button className="primary-button">Crea un account gratuito</button>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;