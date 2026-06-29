import React from "react";
import { Link } from "react-router-dom";
// Assicurati che il CSS della navbar sia importato qui. 
// Puoi spostare le regole CSS della navbar da LandingPage.css a un nuovo Navbar.css
import "./Navbar.css"; 

const Navbar = () => {
  return (
    <header className="navbar">
      {/* Trasformiamo il div brand in un Link che punta alla root ("/") */}
      <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
        <div className="brand-dots">
          <span className="dot orange"></span>
          <span className="dot green"></span>
          <span className="dot blue"></span>
        </div>
        <span className="brand-name">Letterboxd</span>
      </Link>

      <nav className="nav-links">
        <Link to="/catalogo">Films</Link>
        <a href="#lists">Lists</a>
        <a href="#members">Members</a>
        <button className="sign-in">Sign in</button>
        <button className="create-account">Create account</button>
      </nav>
    </header>
  );
};

export default Navbar;