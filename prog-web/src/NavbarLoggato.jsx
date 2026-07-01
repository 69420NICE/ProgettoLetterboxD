import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"; 

const NavbarLoggato = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username, setUsername] = useState("Profilo");
  const [ruolo, setRuolo] = useState("utente"); // Stato per tracciare il ruolo dell'utente
  const navigate = useNavigate();

  useEffect(() => {
    const userInStorage = localStorage.getItem("utente");
    if (userInStorage) {
      try {
        const userData = JSON.parse(userInStorage);
        setUsername(userData.username);
        setRuolo(userData.ruolo); // Recuperiamo il ruolo (es: 'amministratore')
      } catch (e) {
        console.error("Errore parse utente:", e);
      }
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/ricerca/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("utente"); 
    navigate("/"); 
  };

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

  const dropdownItemStyle = {
    display: "block",
    padding: "10px 15px",
    color: "white",
    textDecoration: "none",
    fontSize: "0.85rem",
    borderBottom: "1px solid #445566",
    textTransform: "uppercase",
    fontWeight: "bold"
  };

  return (
    <header className="navbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 100 }}>
      {/* Logo */}
      <Link to="/dashboard" className="brand" style={{ textDecoration: 'none' }}>
        <div className="brand-dots">
          <span className="dot orange"></span>
          <span className="dot green"></span>
          <span className="dot blue"></span>
        </div>
        <span className="brand-name">Letterboxd</span>
      </Link>

      <nav className="nav-links" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        
        {/* =============== VOCE AGGIUNTA SOLO PER AMMINISTRATORI =============== */}
{ruolo === "amministratore" && (
    <Link 
      to="/admin/dashboard" 
      style={navTestoStyle}
      onMouseOver={(e) => e.currentTarget.firstChild.style.color = "white"}
      onMouseOut={(e) => e.currentTarget.firstChild.style.color = "#8c9babc4"}
    >
      <span style={{ background: "#4a1919", color: "#ff4040", padding: "2px 6px", borderRadius: "3px", fontSize: "0.7rem", fontWeight: "bold" }}>
        ADMIN AREA
      </span>
    </Link>
  )}
        {/* ====================================================================== */}

        {/* Link Globali */}
        <Link to="/catalogo" style={navTestoStyle} onMouseOver={(e) => e.target.style.color = "white"} onMouseOut={(e) => e.target.style.color = "#8c9babc4"}>Film</Link>
        <Link to="/liste" style={navTestoStyle} onMouseOver={(e) => e.target.style.color = "white"} onMouseOut={(e) => e.target.style.color = "#8c9babc4"}>Liste</Link>
        <Link to="/membri" style={navTestoStyle} onMouseOver={(e) => e.target.style.color = "white"} onMouseOut={(e) => e.target.style.color = "#8c9babc4"}>Utenti</Link>

        {/* Menu a tendina Profilo */}
        <div style={{ position: "relative" }}>
          <button 
            style={{ ...navTestoStyle, color: "white" }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {username} ▼
          </button>

          {isMenuOpen && (
            <div style={{ 
              position: "absolute", top: "150%", right: 0, background: "#2c3440", 
              borderRadius: "4px", width: "200px", boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
              overflow: "hidden", zIndex: 200, border: "1px solid #445566"
            }}>
              <Link to="/profilo" style={dropdownItemStyle} onClick={() => setIsMenuOpen(false)}>La mia Pagina</Link>
              <Link to="/diario" style={dropdownItemStyle} onClick={() => setIsMenuOpen(false)}>Diario</Link>
              <Link to="/profilo/watchlist" style={dropdownItemStyle} onClick={() => setIsMenuOpen(false)}>Watchlist</Link>
              <Link to="/profilo/liste" style={dropdownItemStyle} onClick={() => setIsMenuOpen(false)}>Le mie Liste</Link>
              <Link to="/profilo/network" style={dropdownItemStyle} onClick={() => setIsMenuOpen(false)}>Seguiti / Follower</Link>
              <Link to="/impostazioni" style={dropdownItemStyle} onClick={() => setIsMenuOpen(false)}>Modifica Dati</Link>
              
              <button 
                onClick={handleLogout} 
                style={{ ...dropdownItemStyle, background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer", borderBottom: "none", color: "#ff4040" }}
              >
                ESCI
              </button>
            </div>
          )}
        </div>

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
  );
};

export default NavbarLoggato;