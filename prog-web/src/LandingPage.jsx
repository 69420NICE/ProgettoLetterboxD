import React from "react";
import "./LandingPage.css";

function LandingPage() {
  const posters = [
    { title: "Dune: Part Two", rating: "4.3", color: "poster-a" },
    { title: "Poor Things", rating: "4.1", color: "poster-b" },
    { title: "The Holdovers", rating: "4.0", color: "poster-c" },
    { title: "Past Lives", rating: "4.2", color: "poster-d" },
    { title: "Oppenheimer", rating: "4.4", color: "poster-e" },
    { title: "Anatomy of a Fall", rating: "4.2", color: "poster-f" },
  ];

  const features = [
    "Track films you’ve watched.",
    "Save those you want to see.",
    "Tell your friends what’s good.",
  ];

  return (
    <div className="landing-page">
      <header className="navbar">
        <div className="brand">
          <div className="brand-dots">
            <span className="dot orange"></span>
            <span className="dot green"></span>
            <span className="dot blue"></span>
          </div>
          <span className="brand-name">Letterboxd</span>
        </div>

        <nav className="nav-links">
          <a href="#films">Films</a>
          <a href="#lists">Lists</a>
          <a href="#members">Members</a>
          <a href="#journal">Journal</a>
          <button className="sign-in">Sign in</button>
          <button className="create-account">Create account</button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="poster-background" id="films">
            {posters.map((poster, index) => (
              <article className={`poster ${poster.color}`} key={index}>
                <div className="poster-content">
                  <span className="poster-title">{poster.title}</span>
                  <span className="poster-rating">★ {poster.rating}</span>
                </div>
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
            <a href="#more">More</a>
          </div>

          <div className="film-grid">
            {posters.map((poster, index) => (
              <div className={`film-card ${poster.color}`} key={index}>
                <div className="film-info">
                  <span>{poster.title}</span>
                  <small>★ {poster.rating}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="three-columns">
          <article>
            <h3>Keep your diary</h3>
            <p>
              Log every film or series you watch and attach a date, rating and
              optional review.
            </p>
          </article>

          <article>
            <h3>Build your watchlist</h3>
            <p>
              Save titles you want to watch later and keep them organized in a
              personal queue.
            </p>
          </article>

          <article>
            <h3>Share your taste</h3>
            <p>
              Follow other members, discover their lists and interact with their
              reviews.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;