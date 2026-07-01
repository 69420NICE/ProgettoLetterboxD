import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarLoggato from "./NavbarLoggato";

function LeMieListe() {
  const [liste, setListe] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errore, setErrore] = useState(null);
  
  // Stati per il modale di creazione
  const [showModal, setShowModal] = useState(false);
  const [nuovaLista, setNuovaLista] = useState({ titolo: "", descrizione: "", pubblica: true });
  
  const navigate = useNavigate();
  const utente = JSON.parse(localStorage.getItem("utente"));

  useEffect(() => {
    if (!utente) {
      navigate("/");
      return;
    }

    const fetchListe = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/liste/utente/${utente.id}`);
        if (!response.ok) throw new Error("Errore nel recupero delle liste");
        const data = await response.json();
        setListe(data);
        setIsLoading(false);
      } catch (err) {
        setErrore(err.message);
        setIsLoading(false);
      }
    };
    fetchListe();
  }, [utente, navigate]);

  const handleCreaLista = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/liste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nuovaLista, id_utente: utente.id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.errore);
      
      // Aggiungiamo la lista appena creata allo stato senza ricaricare la pagina
      setListe([{ id: data.id_lista, ...nuovaLista, data_pubblicazione: new Date() }, ...liste]);
      setShowModal(false);
      setNuovaLista({ titolo: "", descrizione: "", pubblica: true });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEliminaLista = async (id_lista) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa lista? L'azione è irreversibile.")) return;
    try {
      const response = await fetch(`http://localhost:3001/api/liste/${id_lista}`, { method: "DELETE" });
      if (response.ok) {
        setListe(liste.filter(l => l.id !== id_lista));
      }
    } catch (err) {
      alert("Errore durante l'eliminazione");
    }
  };

  if (!utente) return null;

  return (
    <div style={{ background: "#14181c", minHeight: "100vh", color: "white" }}>
      <NavbarLoggato />

      <main style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #445566", paddingBottom: "15px", marginBottom: "30px" }}>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>Le Mie Liste</h1>
          <button 
            onClick={() => setShowModal(true)}
            style={{ background: "#00b020", color: "white", padding: "10px 20px", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
          >
            + Nuova Lista
          </button>
        </header>

        {isLoading ? <p>Caricamento...</p> : errore ? <p style={{ color: "red" }}>{errore}</p> : liste.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", background: "#2c3440", borderRadius: "6px" }}>
            <h3>Non hai ancora creato nessuna lista</h3>
            <p style={{ color: "#8c9babc4" }}>Crea la tua prima lista per raggruppare i tuoi film preferiti!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {liste.map(lista => (
              <div key={lista.id} style={{ background: "#1c252d", border: "1px solid #2c3440", padding: "20px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0" }}>
                    <Link to={`/lista/${lista.id}`} style={{ color: "white", textDecoration: "none" }}>{lista.titolo}</Link>
                  </h3>
                  <p style={{ margin: 0, color: "#8c9babc4", fontSize: "0.9rem" }}>{lista.descrizione || "Nessuna descrizione"}</p>
                  <span style={{ display: "inline-block", marginTop: "10px", fontSize: "0.75rem", background: "#2c3440", padding: "3px 8px", borderRadius: "3px", textTransform: "uppercase" }}>
                    {lista.pubblica ? "Pubblica" : "Privata"}
                  </span>
                </div>
                
                <div style={{ display: "flex", gap: "10px" }}>
                  <Link to={`/lista/${lista.id}`} style={{ background: "#445566", color: "white", padding: "8px 15px", textDecoration: "none", borderRadius: "4px", fontSize: "0.9rem" }}>
                    Visualizza
                  </Link>
                  <button onClick={() => handleEliminaLista(lista.id)} style={{ background: "transparent", border: "1px solid #ff4040", color: "#ff4040", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem" }}>
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modale Creazione Lista */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#2c3440", padding: "30px", borderRadius: "6px", width: "100%", maxWidth: "450px", border: "1px solid #445566", position: "relative" }}>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: "10px", right: "15px", background: "none", border: "none", color: "#8c9babc4", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Crea Nuova Lista</h2>
            <form onSubmit={handleCreaLista} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input type="text" placeholder="Nome della lista" required value={nuovaLista.titolo} onChange={(e) => setNuovaLista({...nuovaLista, titolo: e.target.value})} style={{ padding: "10px", borderRadius: "4px", border: "none", background: "#14181c", color: "white" }} />
              <textarea placeholder="Descrizione (opzionale)" value={nuovaLista.descrizione} onChange={(e) => setNuovaLista({...nuovaLista, descrizione: e.target.value})} style={{ padding: "10px", borderRadius: "4px", border: "none", background: "#14181c", color: "white", height: "80px" }} />
              <label style={{ display: "flex", alignItems: "center", gap: "10px", color: "#8c9babc4" }}>
                <input type="checkbox" checked={nuovaLista.pubblica} onChange={(e) => setNuovaLista({...nuovaLista, pubblica: e.target.checked})} />
                Rendi la lista pubblica
              </label>
              <button type="submit" style={{ background: "#00b020", color: "white", padding: "12px", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>Salva Lista</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeMieListe;