import React, { useState } from "react";

function RegistrazioneModal({ onClose }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [errore, setErrore] = useState(null);
  const [successo, setSuccesso] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrore(null);
    
    if (!formData.username || !formData.email || !formData.password) {
      setErrore("Per favore, compila tutti i campi.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/utenti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Errore durante la registrazione. Username o email potrebbero essere già in uso.");
      }

      setSuccesso(true);
      // Chiude il modale automaticamente dopo 2 secondi dal successo
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      console.error(err);
      setErrore(err.message);
    }
  };

  // Se l'utente clicca lo sfondo scuro, il modale si chiude
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      onClick={handleOverlayClick}
      style={{ 
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: "rgba(0, 0, 0, 0.85)", // Sfondo scuro trasparente
        display: "flex", justifyContent: "center", alignItems: "center", 
        zIndex: 9999 // Assicura che sia sopra a tutto (navbar compresa)
      }}
    >
      <div style={{ 
        background: "#14181c", 
        padding: "40px", 
        borderRadius: "6px", 
        width: "100%", 
        maxWidth: "400px", 
        position: "relative",
        border: "1px solid #445566",
        boxShadow: "0 10px 30px rgba(0,0,0,0.8)"
      }}>
        
        {/* Tasto Chiudi (X) */}
        <button 
          onClick={onClose}
          style={{ position: "absolute", top: "15px", right: "20px", background: "transparent", border: "none", color: "#8c9babc4", fontSize: "1.5rem", cursor: "pointer" }}
        >
          ×
        </button>

        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ color: "white", fontSize: "2rem", margin: "0 0 10px 0" }}>Crea account</h2>
          <p style={{ fontSize: "1rem", color: "#8c9babc4", margin: 0 }}>Unisciti alla community.</p>
        </div>

        {errore && (
          <div style={{ background: "#4a1919", border: "1px solid #ff4040", color: "#ff4040", padding: "10px", borderRadius: "4px", marginBottom: "20px", textAlign: "center" }}>
            {errore}
          </div>
        )}

        {successo && (
          <div style={{ background: "#194a28", border: "1px solid #00e054", color: "#00e054", padding: "10px", borderRadius: "4px", marginBottom: "20px", textAlign: "center" }}>
            Registrazione completata! Benvenuto.
          </div>
        )}

        {!successo && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label htmlFor="email" style={{ fontSize: "0.9rem", color: "#8c9babc4", textTransform: "uppercase" }}>Indirizzo Email</label>
              <input 
                type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                style={{ padding: "10px", borderRadius: "4px", border: "none", background: "#2c3440", color: "white", fontSize: "1rem" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label htmlFor="username" style={{ fontSize: "0.9rem", color: "#8c9babc4", textTransform: "uppercase" }}>Username</label>
              <input 
                type="text" id="username" name="username" value={formData.username} onChange={handleChange}
                style={{ padding: "10px", borderRadius: "4px", border: "none", background: "#2c3440", color: "white", fontSize: "1rem" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label htmlFor="password" style={{ fontSize: "0.9rem", color: "#8c9babc4", textTransform: "uppercase" }}>Password</label>
              <input 
                type="password" id="password" name="password" value={formData.password} onChange={handleChange}
                style={{ padding: "10px", borderRadius: "4px", border: "none", background: "#2c3440", color: "white", fontSize: "1rem" }}
              />
            </div>

            <button 
              type="submit" 
              style={{ marginTop: "10px", padding: "12px", background: "#00b020", color: "white", border: "none", borderRadius: "4px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", textTransform: "uppercase", transition: "background 0.2s" }}
              onMouseOver={(e) => e.target.style.background = "#00e054"}
              onMouseOut={(e) => e.target.style.background = "#00b020"}
            >
              Registrati
            </button>

          </form>
        )}
      </div>
    </div>
  );
}

export default RegistrazioneModal;