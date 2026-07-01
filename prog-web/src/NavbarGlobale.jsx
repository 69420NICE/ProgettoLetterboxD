import React, { useState, useEffect } from "react";
import NavbarPubblica from "./Navbar"; // La tua navbar attuale con "Accedi" e "Crea account"
import NavbarLoggato from "./NavbarLoggato"; // La navbar creata dal tuo collega

const NavbarGlobale = () => {
  const [isLoggato, setIsLoggato] = useState(false);

  useEffect(() => {
    // Controlliamo se esiste l'utente nel localStorage
    const utente = localStorage.getItem("utente");
    
    if (utente) {
      setIsLoggato(true);
    } else {
      setIsLoggato(false);
    }
  }, []); // Esegue il controllo solo al caricamento della pagina

  // Se è loggato mostra la NavbarLoggato, altrimenti la NavbarPubblica
  return isLoggato ? <NavbarLoggato /> : <NavbarPubblica />;
};

export default NavbarGlobale;