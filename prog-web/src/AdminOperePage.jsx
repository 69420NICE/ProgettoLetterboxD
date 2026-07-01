import React, { useState, useEffect } from "react";
import NavbarGlobale from "./NavbarGlobale";
import GestioneRelazioniModal from "./GestioneRelazioniModal";

function AdminOperePage() {
  const [opere, setOpere] = useState([]);
  const [generi, setGeneri] = useState([]); // Elenco dei generi caricati dal DB
  const [isLoading, setIsLoading] = useState(true);
  
  // Stati per la Modifica
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Stati per l'Aggiunta
  const [isCreating, setIsCreating] = useState(false);
  const [newFormData, setNewFormData] = useState({
    titolo: "", trama: "", anno_uscita: "", durata_minuti: "", poster: "", tipo_opera: "film", generiIds: [] // Inizializzato array id generi
  });

  // Stati per il Modale delle Relazioni
  const [isRelationsModalOpen, setIsRelationsModalOpen] = useState(false);
  const [selectedOperaForRelations, setSelectedOperaForRelations] = useState({ id: null, titolo: "" });

  useEffect(() => {
    caricaDatiIniziali();
  }, []);

  // Caricamento simultaneo di Opere e Generi dal backend
  const caricaDatiIniziali = async () => {
    try {
      setIsLoading(true);
      const [resOpere, resGeneri] = await Promise.all([
        fetch("http://localhost:3001/api/opere"),
        fetch("http://localhost:3001/api/generi")
      ]);
      
      const dataOpere = await resOpere.json();
      const dataGeneri = await resGeneri.json();
      
      setOpere(dataOpere);
      setGeneri(dataGeneri);
      setIsLoading(false);
    } catch (error) {
      console.error("Errore nel caricamento dei dati:", error);
      setIsLoading(false);
    }
  };

  // Gestore per accendere/spegnere i generi selezionati nelle checkbox
  const handleCheckboxChange = (idGenere, isEdit = false) => {
    const formData = isEdit ? editFormData : newFormData;
    const setFormData = isEdit ? setEditFormData : setNewFormData;
    const attualiIds = formData.generiIds || [];

    const nuoviIds = attualiIds.includes(idGenere)
      ? attualiIds.filter(id => id !== idGenere)
      : [...attualiIds, idGenere];

    setFormData({ ...formData, generiIds: nuoviIds });
  };

  /* ================= AGGIUNTA ================= */
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/opere", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFormData),
      });

      if (response.ok) {
        caricaDatiIniziali(); // Rinfresca tutto l'elenco
        setIsCreating(false); 
        setNewFormData({ titolo: "", trama: "", anno_uscita: "", durata_minuti: "", poster: "", tipo_opera: "film", generiIds: [] });
      } else {
        alert("Errore durante la creazione.");
      }
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  /* ================= ELIMINAZIONE ================= */
  const handleDeleteClick = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa opera? L'azione è irreversibile.")) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/opere/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOpere(opere.filter(opera => opera.id !== id));
      } else {
        alert("Errore durante l'eliminazione. (Potrebbe essere collegata ad altri dati nel DB)");
      }
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  /* ================= MODIFICA ================= */
  const handleEditClick = (opera) => {
    setEditingId(opera.id);
    setEditFormData(opera);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/opere/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setEditingId(null);
        caricaDatiIniziali(); // Rinfreschiamo per assicurarci l'allineamento dei generi modificati
      } else {
        alert("Errore durante il salvataggio.");
      }
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  // Stili grafici
  const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "20px", color: "#8c9babc4", fontSize: "0.9rem" };
  const thStyle = { textAlign: "left", padding: "12px", borderBottom: "2px solid #445566", color: "white" };
  const tdStyle = { padding: "12px", borderBottom: "1px solid #2c3440", verticalAlign: "middle" };
  const inputStyle = { width: "100%", padding: "6px", background: "#2c3440", color: "white", border: "1px solid #445566", borderRadius: "3px" };
  const btnStyle = { padding: "6px 12px", borderRadius: "3px", cursor: "pointer", border: "none", color: "white", fontWeight: "bold", whiteSpace: "nowrap" };
  const gridGeneriStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "8px", background: "#14181c", padding: "10px", borderRadius: "4px", border: "1px solid #445566", marginTop: "5px", width: "100%" };

  if (isLoading) return <div style={{ color: "white", padding: "100px", textAlign: "center", background: "#14181c", minHeight: "100vh" }}>Caricamento pannello admin...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#14181c", color: "white" }}>
      <NavbarGlobale />

      <main style={{ paddingTop: "100px", maxWidth: "1200px", margin: "0 auto", padding: "100px 20px 50px 20px" }}>
        
        {/* Intestazione */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #445566", paddingBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <h1 style={{ fontSize: "2rem", margin: 0 }}>Gestione Opere</h1>
            <span style={{ background: "#4a1919", color: "#ff4040", padding: "5px 10px", borderRadius: "3px", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>
              Admin Area
            </span>
          </div>
          
          <button 
            onClick={() => setIsCreating(!isCreating)}
            style={{ ...btnStyle, background: isCreating ? "#445566" : "#00b020" }}
          >
            {isCreating ? "Annulla Inserimento" : "+ Aggiungi Nuova Opera"}
          </button>
        </div>

        {/* Modulo di inserimento */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} style={{ background: "#1c2228", padding: "20px", borderRadius: "6px", border: "1px solid #2c3440", marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "15px" }}>
            <div style={{ flex: "1 1 200px" }}><label style={{ fontSize:"0.8rem", color:"#8c9babc4" }}>Titolo</label><input type="text" name="titolo" value={newFormData.titolo} onChange={handleCreateChange} style={inputStyle} required /></div>
            <div style={{ flex: "1 1 100px" }}><label style={{ fontSize:"0.8rem", color:"#8c9babc4" }}>Anno</label><input type="number" name="anno_uscita" value={newFormData.anno_uscita} onChange={handleCreateChange} style={inputStyle} required /></div>
            <div style={{ flex: "1 1 100px" }}><label style={{ fontSize:"0.8rem", color:"#8c9babc4" }}>Durata (min)</label><input type="number" name="durata_minuti" value={newFormData.durata_minuti} onChange={handleCreateChange} style={inputStyle} required /></div>
            <div style={{ flex: "1 1 150px" }}>
              <label style={{ fontSize:"0.8rem", color:"#8c9babc4" }}>Tipo</label>
              <select name="tipo_opera" value={newFormData.tipo_opera} onChange={handleCreateChange} style={inputStyle}>
                <option value="film">Film</option><option value="serie">Serie</option>
              </select>
            </div>
            <div style={{ flex: "1 1 100%" }}><label style={{ fontSize:"0.8rem", color:"#8c9babc4" }}>URL Poster</label><input type="text" name="poster" value={newFormData.poster} onChange={handleCreateChange} style={inputStyle} required /></div>
            
            {/* SELEZIONE DEI GENERI CON CHECKBOX - INSERIMENTO */}
            <div style={{ flex: "1 1 100%" }}>
              <label style={{ fontSize:"0.8rem", color:"#8c9babc4" }}>Generi Associati</label>
              <div style={gridGeneriStyle}>
                {generi.map((g) => (
                  <label key={g.id} style={{ display: "flex", alignItems: "center", gap: "6px", color: "white", fontSize: "0.85rem", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={newFormData.generiIds.includes(g.id)} 
                      onChange={() => handleCheckboxChange(g.id, false)} 
                    />
                    {g.nome_genere}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ flex: "1 1 100%" }}><label style={{ fontSize:"0.8rem", color:"#8c9babc4" }}>Trama</label><textarea name="trama" value={newFormData.trama} onChange={handleCreateChange} style={{ ...inputStyle, minHeight: "80px" }} required /></div>
            
            <button type="submit" style={{ ...btnStyle, background: "#00b020", marginTop: "10px", width: "100%" }}>Salva nel Database</button>
          </form>
        )}

        {/* Tabella Opere */}
        <div style={{ overflowX: "auto", background: "#1c2228", borderRadius: "6px", padding: "20px", border: "1px solid #2c3440" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Poster</th>
                <th style={thStyle}>Titolo</th>
                <th style={thStyle}>Anno</th>
                <th style={thStyle}>Durata</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Generi</th>
                <th style={thStyle}>Trama</th>
                <th style={thStyle}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {opere.map((opera) => (
                <tr key={opera.id}>
                  <td style={tdStyle}>{opera.id}</td>
                  
                  {editingId === opera.id ? (
                    <>
                      {/* MODALITÀ MODIFICA INLINE */}
                      <td style={tdStyle}><input type="text" name="poster" value={editFormData.poster || ""} onChange={handleEditFormChange} placeholder="URL Immagine" style={inputStyle} /></td>
                      <td style={tdStyle}><input type="text" name="titolo" value={editFormData.titolo || ""} onChange={handleEditFormChange} style={inputStyle} /></td>
                      <td style={tdStyle}><input type="number" name="anno_uscita" value={editFormData.anno_uscita || ""} onChange={handleEditFormChange} style={{...inputStyle, width: "70px"}} /></td>
                      <td style={tdStyle}><input type="number" name="durata_minuti" value={editFormData.durata_minuti || ""} onChange={handleEditFormChange} style={{...inputStyle, width: "70px"}} /></td>
                      <td style={tdStyle}>
                        <select name="tipo_opera" value={editFormData.tipo_opera || ""} onChange={handleEditFormChange} style={inputStyle}>
                          <option value="film">Film</option><option value="serie">Serie</option>
                        </select>
                      </td>
                      
                      {/* SELEZIONE DEI GENERI CON CHECKBOX - MODIFICA */}
                      <td style={tdStyle}>
                        <div style={{ ...gridGeneriStyle, minWidth: "160px", maxHeight: "100px", overflowY: "auto", padding: "5px" }}>
                          {generi.map((g) => (
                            <label key={g.id} style={{ display: "flex", alignItems: "center", gap: "4px", color: "white", fontSize: "0.75rem", cursor: "pointer" }}>
                              <input 
                                type="checkbox" 
                                checked={editFormData.generiIds?.includes(g.id)} 
                                onChange={() => handleCheckboxChange(g.id, true)} 
                              />
                              {g.nome_genere}
                            </label>
                          ))}
                        </div>
                      </td>

                      <td style={tdStyle}><textarea name="trama" value={editFormData.trama || ""} onChange={handleEditFormChange} style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} /></td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: "5px", flexDirection: "column" }}>
                          <button onClick={handleSaveClick} style={{ ...btnStyle, background: "#00b020" }}>Salva</button>
                          <button onClick={() => setEditingId(null)} style={{ ...btnStyle, background: "#445566" }}>Annulla</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      {/* VISUALIZZAZIONE NORMALE */}
                      <td style={tdStyle}>
                        {opera.poster ? <img src={opera.poster} alt="Poster" style={{ width: "40px", height: "60px", objectFit: "cover", borderRadius: "3px" }} /> : "N/A"}
                      </td>
                      <td style={tdStyle}><strong>{opera.titolo}</strong></td>
                      <td style={tdStyle}>{opera.anno_uscita}</td>
                      <td style={tdStyle}>{opera.durata_minuti} m</td>
                      <td style={{ ...tdStyle, textTransform: "capitalize" }}>{opera.tipo_opera}</td>
                      
                      {/* ELENCO DEI TAG DEI GENERI ASSOCIATI ALL'OPERA */}
                      <td style={tdStyle}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "180px" }}>
                          {generi.filter(g => opera.generiIds?.includes(g.id)).map(g => (
                            <span key={g.id} style={{ background: "#24303c", color: "#9ab", padding: "2px 6px", borderRadius: "3px", fontSize: "0.7rem", fontWeight: "bold" }}>
                              {g.nome_genere}
                            </span>
                          ))}
                          {(!opera.generiIds || opera.generiIds.length === 0) && (
                            <span style={{ color: "#445566", fontStyle: "italic" }}>Nessuno</span>
                          )}
                        </div>
                      </td>

                      <td style={tdStyle} title={opera.trama}>
                        {opera.trama ? (opera.trama.length > 40 ? opera.trama.substring(0, 40) + "..." : opera.trama) : "-"}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          <button onClick={() => handleEditClick(opera)} style={{ ...btnStyle, background: "#40bcf4" }}>Modifica</button>
                          
                          {/* PULSANTE GESTIONE RELAZIONI CAST/REGIA AGGIUNTO */}
                          <button 
                            onClick={() => {
                              setSelectedOperaForRelations({ id: opera.id, titolo: opera.titolo });
                              setIsRelationsModalOpen(true);
                            }} 
                            style={{ ...btnStyle, background: "#e9a115" }}
                          >
                            Cast / Regia
                          </button>

                          <button onClick={() => handleDeleteClick(opera.id)} style={{ ...btnStyle, background: "#ff4040" }}>Elimina</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* RENDERIZZAZIONE DEL MODALE DELLE RELAZIONI */}
      <GestioneRelazioniModal 
        isOpen={isRelationsModalOpen}
        onClose={() => setIsRelationsModalOpen(false)}
        operaId={selectedOperaForRelations.id}
        operaTitolo={selectedOperaForRelations.titolo}
      />
    </div>
  );
}

export default AdminOperePage;