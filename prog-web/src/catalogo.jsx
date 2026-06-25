import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar"; 
import "./LandingPage.css"; 

const generateSlug = (titolo) => {
  return titolo
    .toLowerCase()                     
    .replace(/[^a-z0-9]+/g, '-')       
    .replace(/(^-|-$)+/g, '');         
};

function Catalogo() {
  const [opere, setOpere] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpere = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/opere");
        
        if (!response.ok) {
          throw new Error("Errore durante il recupero dei dati dal server");
        }
        
        const data = await response.json();
        setOpere(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Errore fetch opere:", err);
        setError("Impossibile caricare il catalogo in questo momento.");
        setIsLoading(false);
      }
    };

    fetchOpere();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#14181c", color: "white" }}>
      <Navbar />

      {/* Regola di formattazione: paddingTop a 100px per compensare la Navbar fissa */}
      <main style={{ paddingTop: "100px", paddingRight: "40px", paddingBottom: "40px", paddingLeft: "40px", maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ borderBottom: "1px solid #445566", paddingBottom: "10px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "normal" }}>Films</h1>
          <span style={{ color: "#8c9babc4", fontSize: "0.9rem" }}>
            Browse {opere.length} films
          </span>
        </div>

        {isLoading && <p style={{ color: "#8c9babc4" }}>Caricamento intero catalogo dal database...</p>}
        {error && <p style={{ color: "#e50914" }}>{error}</p>}

        <div className="film-grid">
          {!isLoading && !error && opere.map((opera) => (
            <Link 
              to={`/${generateSlug(opera.titolo)}`} 
              className="film-card" 
              key={opera.id}
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
      </main>
    </div>
  );
}

export default Catalogo;