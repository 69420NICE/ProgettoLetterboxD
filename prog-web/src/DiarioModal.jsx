function DiarioModal({ onClose, operaId, visioneEsistente }) {
  // Se visioneEsistente esiste, stiamo MODIFICANDO, altrimenti stiamo AGGIUNGENDO
  const [data, setData] = useState(visioneEsistente ? visioneEsistente.data_visione : new Date().toISOString().split('T')[0]);

  const handleSubmit = async () => {
    const url = visioneEsistente 
      ? `http://localhost:3001/api/diario/${visioneEsistente.id_visione}` 
      : "http://localhost:3001/api/diario";
    
    const method = visioneEsistente ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        id_utente: JSON.parse(localStorage.getItem("utente")).id,
        id_opera: operaId,
        data_visione: data 
      })
    });
    onClose();
  };

  return (
    <div className="modal">
      <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
      <button onClick={handleSubmit}>{visioneEsistente ? "Salva Modifiche" : "Aggiungi al Diario"}</button>
    </div>
  );
}