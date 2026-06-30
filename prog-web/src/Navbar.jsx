import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegistrazioneModal from "./RegistrazioneModal"; 
import "./Navbar.css"; 

const Navbar = () => {
  const [isRegistrazioneOpen, setIsRegistrazioneOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/ricerca/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  // Stile condiviso per trasformare i bottoni e i link in "scritte normali"
  const navTestoStyle = {
    background: "transparent",
    border: "none",
    color: "#8c9babc4",
    textTransform: "uppercase",
    fontSize: "0.85rem",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "none",
    padding: "0",
    transition: "color 0.2s ease"
  };

  return (
    <>
      <header className="navbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo a sinistra */}
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <div className="brand-dots">
            <span className="dot orange"></span>
            <span className="dot green"></span>
            <span className="dot blue"></span>
          </div>
          <span className="brand-name">Letterboxd</span>
        </Link>

        {/* Voci di menu allineate a destra nel nuovo ordine */}
        <nav className="nav-links" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          
          <button 
            style={navTestoStyle}
            onMouseOver={(e) => e.target.style.color = "white"}
            onMouseOut={(e) => e.target.style.color = "#8c9babc4"}
          >
            Accedi
          </button>
          
          <button 
            style={navTestoStyle}
            onClick={() => setIsRegistrazioneOpen(true)}
            onMouseOver={(e) => e.target.style.color = "white"}
            onMouseOut={(e) => e.target.style.color = "#8c9babc4"}
          >
            Crea account
          </button>

          <Link 
            to="/catalogo" 
            style={navTestoStyle}
            onMouseOver={(e) => e.target.style.color = "white"}
            onMouseOut={(e) => e.target.style.color = "#8c9babc4"}
          >
            Film
          </Link>
          
          <a 
            href="#lists" 
            style={navTestoStyle}
            onMouseOver={(e) => e.target.style.color = "white"}
            onMouseOut={(e) => e.target.style.color = "#8c9babc4"}
          >
            Liste
          </a>
          
          <a 
            href="#members" 
            style={navTestoStyle}
            onMouseOver={(e) => e.target.style.color = "white"}
            onMouseOut={(e) => e.target.style.color = "#8c9babc4"}
          >
            Membri
          </a>

          {/* Barra di ricerca in fondo alla fila */}
          <form onSubmit={handleSearch} style={{ marginLeft: "10px" }}>
            <input 
              type="text" 
              placeholder="Cerca..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                border: "1px solid #445566",
                background: "#2c3440",
                color: "white",
                outline: "none",
                fontSize: "0.85rem",
                width: "180px",
                transition: "border-color 0.2s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "white"}
              onBlur={(e) => e.target.style.borderColor = "#445566"}
            />
          </form>
        </nav>
      </header>

      {/* Modale di registrazione */}
      {isRegistrazioneOpen && (
        <RegistrazioneModal onClose={() => setIsRegistrazioneOpen(false)} />
      )}
    </>
  );
};

export default Navbar;