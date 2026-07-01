import React, { useState, useEffect } from "react";

function GestioneRelazioniModal({ isOpen, onClose, operaId, operaTitolo }) {
  const [allProfessionisti, setAllProfessionisti] = useState([]);
  const [registaId, setRegistaId] = useState("");
  const [cast, setCast] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Stati per l'aggiunta di un attore
  const [nuovoAttoreId, setNuovoAttoreId] = useState("");
  const [nomePersonaggio, setNomePersonaggio] = useState("");

  // Stati per la modifica inline del cast
  const [editingProfId, setEditingProfId] = useState(null);
  const [oldPersonaggio, setOldPersonaggio] = useState("");
  const [editProfId, setEditProfId] = useState("");
  const [editPersonaggio, setEditPersonaggio] = useState("");

  useEffect(() => {
    if (isOpen && operaId) {
      caricaDatiRelazioni();
    }
  }, [isOpen, operaId]);

  const caricaDatiRelazioni = async () => {
    try {
      setIsLoading(true);
      const [resProf, resRel] = await Promise.all([
        fetch("http://localhost:3001/api/professionisti"),
        fetch(`http://localhost:3001/api/opere/${operaId}/relazioni`)
      ]);

      const dataProf = await resProf.json();
      const dataRel = await resRel.json();

      setAllProfessionisti(dataProf);
      setRegistaId(dataRel.id_regista || "");
      setCast(dataRel.cast || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Errore caricamento modale relazioni:", error);
      setIsLoading(false);
    }
  };

  const handleSalvaRegista = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/opere/${operaId}/regista`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_professionista: registaId }),
      });
      if (res.ok) alert("Regista aggiornato con successo!");
    } catch (error) { console.error(error); }
  };

  const handleAggiungiAttore = async (e) => {
    e.preventDefault();
    if (!nuovoAttoreId || !nomePersonaggio.trim()) return;

    try {
      const res = await fetch(`http://localhost:3001/api/opere/${operaId}/cast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id_professionista: nuovoAttoreId, 
          nome_personaggio: nomePersonaggio.trim() 
        }),
      });

      if (res.ok) {
        setNuovoAttoreId("");
        setNomePersonaggio("");
        caricaDatiRelazioni();
      } else {
        const err = await res.json();
        alert(err.errore || "Errore durante l'aggiunta.");
      }
    } catch (error) { console.error(error); }
  };

  /* ================= OPERAZIONI DI MODIFICA INLINE ================= */
  const handleEditClick = (c) => {
    setEditingProfId(c.id);
    setOldPersonaggio(c.nome_personaggio);
    setEditProfId(c.id);
    setEditPersonaggio(c.nome_personaggio);
  };

  const handleSalvaModificaCast = async () => {
    if (!editProfId || !editPersonaggio.trim()) return;

    try {
      const res = await fetch(`http://localhost:3001/api/opere/${operaId}/cast`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_id_professionista: editingProfId,
          new_id_professionista: editProfId,
          old_nome_personaggio: oldPersonaggio,
          new_nome_personaggio: editPersonaggio.trim()
        }),
      });

      if (res.ok) {
        setEditingProfId(null);
        caricaDatiRelazioni();
      } else {
        const err = await res.json();
        alert(err.errore || "Errore durante la modifica.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRimuoviAttore = async (idProf) => {
    if (!window.confirm("Vuoi davvero rimuovere questo attore dal cast del film?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/opere/${operaId}/cast/${idProf}`, {
        method: "DELETE"
      });
      if (res.ok) caricaDatiRelazioni();
    } catch (error) { console.error(error); }
  };

  if (!isOpen) return null;

  // Stili grafici coerenti
  const overlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" };
  const modalStyle = { background: "#1c2228", width: "100%", maxWidth: "650px", borderRadius: "8px", border: "1px solid #445566", padding: "25px", color: "white", maxHeight: "90vh", overflowY: "auto" };
  const selectStyle = { padding: "8px 12px", background: "#2c3440", color: "white", border: "1px solid #445566", borderRadius: "3px", width: "100%", marginBottom: "10px", outline: "none" };
  const inputStyle = { padding: "8px 12px", background: "#2c3440", color: "white", border: "1px solid #445566", borderRadius: "3px", width: "100%", outline: "none" };
  const sectionStyle = { borderTop: "1px solid #2c3440", marginTop: "20px", paddingTop: "15px" };
  const btnStyle = { padding: "8px 14px", borderRadius: "3px", border: "none", cursor: "pointer", fontWeight: "bold", color: "white", fontSize: "0.8rem" };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "25px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "bold" }}>Gestione Cast e Regia</h2>
            <p style={{ margin: "5px 0 0 0", color: "#40bcf4", fontWeight: "bold", fontSize: "0.95rem" }}>{operaTitolo}</p>
          </div>
          <button onClick={onClose} style={{ ...btnStyle, background: "#ff4040", padding: "4px 10px", fontSize: "0.9rem" }}>X</button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "30px", color: "#8c9babc4", fontStyle: "italic" }}>Caricamento...</div>
        ) : (
          <>
            {/* SEZIONE REGIA */}
            <div style={sectionStyle}>
              <h3 style={{ fontSize: "0.9rem", color: "white", margin: "0 0 12px 0", textTransform: "uppercase" }}>Regia del Film</h3>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <select value={registaId} onChange={(e) => setRegistaId(e.target.value)} style={selectStyle}>
                  <option value="">-- Seleziona il Regista --</option>
                  {allProfessionisti.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
                <button onClick={handleSalvaRegista} style={{ ...btnStyle, background: "#00b020", whiteSpace: "nowrap", height: "35px" }}>Salva Regia</button>
              </div>
            </div>

            {/* SEZIONE CAST CON MODIFICA INLINE */}
            <div style={sectionStyle}>
              <h3 style={{ fontSize: "0.9rem", color: "white", margin: "0 0 12px 0", textTransform: "uppercase" }}>Cast Collegato</h3>
              {cast.length === 0 ? (
                <p style={{ fontStyle: "italic", color: "#667788", fontSize: "0.9rem" }}>Nessun attore inserito.</p>
              ) : (
                <div style={{ maxHeight: "220px", overflowY: "auto", border: "1px solid #2c3440", borderRadius: "4px", background: "#14181c", padding: "5px 10px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #2c3440", textAlign: "left", color: "#8c9babc4", fontSize: "0.8rem", textTransform: "uppercase" }}>
                        <th style={{ padding: "8px" }}>Professionista</th>
                        <th style={{ padding: "8px" }}>Personaggio</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cast.map(c => (
                        <tr key={c.id} style={{ borderBottom: "1px solid #2c3440" }}>
                          {editingProfId === c.id ? (
                            <>
                              {/* RIGA IN MODALITÀ MODIFICA INLINE */}
                              <td style={{ padding: "6px" }}>
                                <select value={editProfId} onChange={(e) => setEditProfId(e.target.value)} style={{ ...selectStyle, marginBottom: 0, padding: "4px 8px", fontSize: "0.8rem" }}>
                                  {allProfessionisti.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                </select>
                              </td>
                              <td style={{ padding: "6px" }}>
                                <input type="text" value={editPersonaggio} onChange={(e) => setEditPersonaggio(e.target.value)} style={{ ...inputStyle, padding: "4px 8px", fontSize: "0.8rem" }} />
                              </td>
                              <td style={{ padding: "6px", textAlign: "right", whiteSpace: "nowrap" }}>
                                <button onClick={handleSalvaModificaCast} style={{ ...btnStyle, background: "#00b020", padding: "4px 8px", marginRight: "4px" }}>Salva</button>
                                <button onClick={() => setEditingProfId(null)} style={{ ...btnStyle, background: "#445566", padding: "4px 8px" }}>Annulla</button>
                              </td>
                            </>
                          ) : (
                            <>
                              {/* RIGA IN MODALITÀ VISUALIZZAZIONE */}
                              <td style={{ padding: "8px", color: "white", fontWeight: "bold" }}>{c.nome}</td>
                              <td style={{ padding: "8px", color: "#8c9babc4" }}>{c.nome_personaggio}</td>
                              <td style={{ padding: "8px", textAlign: "right", whiteSpace: "nowrap" }}>
                                <button onClick={() => handleEditClick(c)} style={{ ...btnStyle, background: "#40bcf4", padding: "4px 8px", marginRight: "5px" }}>Modifica</button>
                                <button onClick={() => handleRimuoviAttore(c.id)} style={{ ...btnStyle, background: "#ff4040", padding: "4px 8px" }}>Rimuovi</button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* FORM DI INSERIMENTO NUOVO ATTORE */}
            <form onSubmit={handleAggiungiAttore} style={{ ...sectionStyle, background: "#14181c", padding: "15px", borderRadius: "6px", border: "1px solid #2c3440", marginTop: "25px" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", textTransform: "uppercase", color: "#40bcf4" }}>+ Collega Professionista al Cast</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "#8c9babc4", display: "block", marginBottom: "4px" }}>Seleziona l'attore/attrice</label>
                  <select value={nuovoAttoreId} onChange={(e) => setNuovoAttoreId(e.target.value)} style={{ ...selectStyle, marginBottom: 0 }} required>
                    <option value="">-- Scegli un professionista dal database --</option>
                    {allProfessionisti.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "#8c9babc4", display: "block", marginBottom: "4px" }}>Nome del Personaggio interpretato</label>
                  {/* Scritta di esempio rimossa completamente */}
                  <input type="text" value={nomePersonaggio} onChange={(e) => setNomePersonaggio(e.target.value)} style={inputStyle} required />
                </div>
                <button type="submit" style={{ ...btnStyle, background: "#40bcf4", marginTop: "5px", width: "100%", padding: "10px" }}>Aggiungi ed Inserisci nel Cast</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default GestioneRelazioniModal;