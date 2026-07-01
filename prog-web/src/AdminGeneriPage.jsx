import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarGlobale from "./NavbarGlobale";

function AdminGeneriPage() {
  const [generi, setGeneri] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Stati per la Modifica Inline
  const [editingId, setEditingId] = useState(null);
  const [editNome, setEditNome] = useState("");

  // Stati per l'Aggiunta
  const [isCreating, setIsCreating] = useState(false);
  const [newNome, setNewNome] = useState("");

  useEffect(() => {
    // Lucchetto di sicurezza Admin
    const utenteInStorage = localStorage.getItem("utente");
    if (!utenteInStorage) {
      navigate("/");
      return;
    }
    const userData = JSON.parse(utenteInStorage);
    if (userData.ruolo !== "amministratore") {
      navigate("/dashboard");
      return;
    }

    fetchGeneri();
  }, [navigate]);

  const fetchGeneri = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/generi");
      const data = await response.json();
      setGeneri(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Errore caricamento generi:", error);
    }
  };

  /* ================= INSERIMENTO ================= */
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newNome.trim()) return;

    try {
      const response = await fetch("http://localhost:3001/api/generi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_genere: newNome.trim() }),
      });

      if (response.ok) {
        fetchGeneri();
        setIsCreating(false);
        setNewNome("");
      } else {
        const errData = await response.json();
        alert(errData.errore || "Errore durante il salvataggio.");
      }
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  /* ================= MODIFICA ================= */
  const handleEditClick = (genere) => {
    setEditingId(genere.id);
    setEditNome(genere.nome_genere);
  };

  const handleSaveClick = async () => {
    if (!editNome.trim()) return;

    try {
      const response = await fetch(`http://localhost:3001/api/generi/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_genere: editNome.trim() }),
      });

      if (response.ok) {
        setGeneri(generi.map(g => g.id === editingId ? { ...g, nome_genere: editNome.trim() } : g));
        setEditingId(null);
      } else {
        alert("Errore durante l'aggiornamento.");
      }
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  /* ================= ELIMINAZIONE ================= */
  const handleDeleteClick = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo genere? Verrà rimosso automaticamente da tutti i film collegati.")) return;

    try {
      const response = await fetch(`http://localhost:3001/api/generi/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setGeneri(generi.filter(g => g.id !== id));
      } else {
        alert("Errore durante l'eliminazione.");
      }
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  // Stili grafici coerenti
  const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "20px", color: "#8c9babc4", fontSize: "0.95rem" };
  const thStyle = { textAlign: "left", padding: "12px", borderBottom: "2px solid #445566", color: "white" };
  const tdStyle = { padding: "12px", borderBottom: "1px solid #2c3440", verticalAlign: "middle" };
  const inputStyle = { width: "100%", padding: "6px", background: "#2c3440", color: "white", border: "1px solid #445566", borderRadius: "3px" };
  const btnStyle = { padding: "6px 12px", borderRadius: "3px", cursor: "pointer", border: "none", color: "white", fontWeight: "bold" };

  if (isLoading) return <div style={{ color: "white", padding: "100px", textAlign: "center", background: "#14181c", minHeight: "100vh" }}>Caricamento...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#14181c", color: "white" }}>
      <NavbarGlobale />

      <main style={{ paddingTop: "100px", maxWidth: "800px", margin: "0 auto", padding: "100px 20px" }}>
        
        {/* Intestazione */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #445566", paddingBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <h1 style={{ fontSize: "2rem", margin: 0 }}>Gestione Generi</h1>
            <span style={{ background: "#4a1919", color: "#ff4040", padding: "5px 10px", borderRadius: "3px", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>
              Admin Area
            </span>
          </div>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            style={{ ...btnStyle, background: isCreating ? "#445566" : "#00b020" }}
          >
            {isCreating ? "Annulla" : "+ Aggiungi Genere"}
          </button>
        </div>

        {/* Form di Inserimento */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} style={{ background: "#1c2228", padding: "20px", borderRadius: "6px", border: "1px solid #2c3440", marginBottom: "20px", display: "flex", gap: "15px", alignItems: "flex-end" }}>
            <div style={{ flexGrow: 1 }}>
              <label style={{ fontSize: "0.8rem", color: "#8c9babc4", display: "block", marginBottom: "5px" }}>Nome del Genere</label>
              <input type="text" value={newNome} onChange={(e) => setNewNome(e.target.value)} style={inputStyle} placeholder="Es: Thriller, Horror..." required />
            </div>
            <button type="submit" style={{ ...btnStyle, background: "#00b020", height: "34px" }}>Salva</button>
          </form>
        )}

        {/* Tabella Generi */}
        <div style={{ background: "#1c2228", borderRadius: "6px", padding: "20px", border: "1px solid #2c3440" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: "80px" }}>ID</th>
                <th style={thStyle}>Nome Genere</th>
                <th style={{ ...thStyle, width: "180px", textAlign: "right" }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {generi.map((genere) => (
                <tr key={genere.id}>
                  <td style={tdStyle}>{genere.id}</td>
                  
                  {editingId === genere.id ? (
                    <>
                      <td style={tdStyle}>
                        <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} style={inputStyle} />
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <button onClick={handleSaveClick} style={{ ...btnStyle, background: "#00b020", marginRight: "5px" }}>Salva</button>
                        <button onClick={() => setEditingId(null)} style={{ ...btnStyle, background: "#445566" }}>Annulla</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ ...tdStyle, color: "white", fontWeight: "bold" }}>{genere.nome_genere}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <button onClick={() => handleEditClick(genere)} style={{ ...btnStyle, background: "#40bcf4", marginRight: "5px" }}>Modifica</button>
                        <button onClick={() => handleDeleteClick(genere.id)} style={{ ...btnStyle, background: "#ff4040" }}>Elimina</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminGeneriPage;