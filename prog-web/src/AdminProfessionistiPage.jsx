import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";

function AdminProfessionistiPage() {
  const [professionisti, setProfessionisti] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  // Stati per l'aggiunta
  const [isCreating, setIsCreating] = useState(false);
  const [newFormData, setNewFormData] = useState({ nome: "", biografia: "", immagine: "" });

  useEffect(() => {
    fetchProfessionisti();
  }, []);

  const fetchProfessionisti = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/professionisti");
      const data = await response.json();
      setProfessionisti(data);
    } catch (error) {
      console.error("Errore caricamento professionisti:", error);
    }
  };

  /* ================= AGGIUNTA ================= */
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/professionisti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFormData),
      });
      if (response.ok) {
        fetchProfessionisti();
        setIsCreating(false);
        setNewFormData({ nome: "", biografia: "", immagine: "" });
      } else {
        alert("Errore durante l'inserimento");
      }
    } catch (error) { console.error("Errore:", error); }
  };

  const handleEditClick = (prof) => {
    setEditingId(prof.id);
    setEditFormData(prof);
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/professionisti/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (response.ok) {
        setProfessionisti(professionisti.map(p => p.id === editingId ? editFormData : p));
        setEditingId(null);
      } else {
        alert("Errore durante il salvataggio");
      }
    } catch (error) { console.error("Errore salvataggio:", error); }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo professionista?")) return;
    try {
      const response = await fetch(`http://localhost:3001/api/professionisti/${id}`, { method: "DELETE" });
      if (response.ok) setProfessionisti(professionisti.filter(p => p.id !== id));
    } catch (error) { console.error("Errore eliminazione:", error); }
  };

  // Stili
  const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "20px", color: "#8c9babc4", fontSize: "0.9rem" };
  const thStyle = { textAlign: "left", padding: "12px", borderBottom: "2px solid #445566", color: "white" };
  const tdStyle = { padding: "12px", borderBottom: "1px solid #2c3440", verticalAlign: "middle" };
  const inputStyle = { width: "100%", padding: "6px", background: "#2c3440", color: "white", border: "1px solid #445566", borderRadius: "3px" };
  const btnStyle = { padding: "6px 12px", borderRadius: "3px", cursor: "pointer", border: "none", color: "white", fontWeight: "bold" };

  return (
    <div style={{ minHeight: "100vh", background: "#14181c", color: "white" }}>
      <Navbar />
      <main style={{ paddingTop: "100px", maxWidth: "1200px", margin: "0 auto", padding: "100px 20px" }}>
        
        {/* Intestazione con Admin Area */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #445566", paddingBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <h1 style={{ fontSize: "2rem", margin: 0 }}>Gestione Professionisti</h1>
            <span style={{ background: "#4a1919", color: "#ff4040", padding: "5px 10px", borderRadius: "3px", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>
              Admin Area
            </span>
          </div>
          <button onClick={() => setIsCreating(!isCreating)} style={{ ...btnStyle, background: isCreating ? "#445566" : "#00b020" }}>
            {isCreating ? "Annulla" : "+ Aggiungi Professionista"}
          </button>
        </div>

        {/* Modulo di inserimento */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} style={{ background: "#1c2228", padding: "20px", borderRadius: "6px", border: "1px solid #2c3440", marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "15px" }}>
            <div style={{ flex: "1 1 200px" }}><label style={{fontSize:"0.8rem", color:"#8c9babc4"}}>Nome</label><input type="text" value={newFormData.nome} onChange={(e) => setNewFormData({...newFormData, nome: e.target.value})} style={inputStyle} required /></div>
            <div style={{ flex: "1 1 100%" }}><label style={{fontSize:"0.8rem", color:"#8c9babc4"}}>URL Foto</label><input type="text" value={newFormData.immagine} onChange={(e) => setNewFormData({...newFormData, immagine: e.target.value})} style={inputStyle} /></div>
            <div style={{ flex: "1 1 100%" }}><label style={{fontSize:"0.8rem", color:"#8c9babc4"}}>Biografia</label><textarea value={newFormData.biografia} onChange={(e) => setNewFormData({...newFormData, biografia: e.target.value})} style={{...inputStyle, minHeight: "80px"}} /></div>
            <button type="submit" style={{...btnStyle, background: "#00b020", width: "100%"}}>Salva Professionista</button>
          </form>
        )}

        <div style={{ overflowX: "auto", background: "#1c2228", borderRadius: "6px", padding: "20px", border: "1px solid #2c3440" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th><th style={thStyle}>Foto</th><th style={thStyle}>Nome</th><th style={thStyle}>Biografia</th><th style={thStyle}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {professionisti.map(prof => (
                <tr key={prof.id}>
                  <td style={tdStyle}>{prof.id}</td>
                  {editingId === prof.id ? (
                    <>
                      <td style={tdStyle}><input value={editFormData.immagine} onChange={(e) => setEditFormData({...editFormData, immagine: e.target.value})} style={inputStyle} /></td>
                      <td style={tdStyle}><input value={editFormData.nome} onChange={(e) => setEditFormData({...editFormData, nome: e.target.value})} style={inputStyle} /></td>
                      <td style={tdStyle}><textarea value={editFormData.biografia} onChange={(e) => setEditFormData({...editFormData, biografia: e.target.value})} style={inputStyle} /></td>
                      <td style={tdStyle}><button onClick={handleSaveClick} style={{...btnStyle, background:"#00b020"}}>Salva</button></td>
                    </>
                  ) : (
                    <>
                      <td style={tdStyle}>{prof.immagine ? <img src={prof.immagine} style={{width:"40px", borderRadius:"50%"}} /> : "N/A"}</td>
                      <td style={tdStyle}><strong>{prof.nome}</strong></td>
                      <td style={tdStyle}>{prof.biografia?.substring(0, 50)}...</td>
                      <td style={tdStyle}>
                        <button onClick={() => handleEditClick(prof)} style={{...btnStyle, background:"#40bcf4"}}>Modifica</button>
                        <button onClick={() => handleDeleteClick(prof.id)} style={{...btnStyle, background:"#ff4040", marginLeft: "10px"}}>Elimina</button>
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

export default AdminProfessionistiPage;