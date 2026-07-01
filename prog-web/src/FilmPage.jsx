import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import NavbarGlobale from "./NavbarGlobale"; 
import NavbarLoggato from "./NavbarLoggato";

const generateSlug = (testo) => {
  return testo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const renderStelle = (voto) => {
  if (!voto) return null;
  const num = parseFloat(voto);
  const intere = Math.floor(num);
  const mezza = num % 1 !== 0;
  return "★".repeat(intere) + (mezza ? "½" : "");
};

function FilmPage() {
  const { slug } = useParams();

  const [film, setFilm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recensioni, setRecensioni] = useState([]);

  // ================= STATI PER L'UTENTE =================
  const [utente, setUtente] = useState(null);
  
  const [showDiarioModal, setShowDiarioModal] = useState(false);
  const [dataVisione, setDataVisione] = useState(new Date().toISOString().split('T')[0]);

  const [isInWatchlist, setIsInWatchlist] = useState(false); // Stato booleano reale per la presenza
  const [watchlistStatus, setWatchlistStatus] = useState("default");
  const [diarioStatus, setDiarioStatus] = useState("default");

  // STATI PER LE LISTE
  const [showListeModal, setShowListeModal] = useState(false);
  const [mieListe, setMieListe] = useState([]);
  const [listeStatus, setListeStatus] = useState("default"); 

  const [nuovaRecensione, setNuovaRecensione] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [voto, setVoto] = useState("");

  useEffect(() => {
    // Sincronizziamo il recupero dell'utente per poterlo usare subito nella fetch condizionale
    const userInStorage = localStorage.getItem("utente");
    let attualeUtente = null;
    if (userInStorage) {
      attualeUtente = JSON.parse(userInStorage);
      setUtente(attualeUtente);
    }

    const fetchFilmEDettagli = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const filmResponse = await fetch(`http://localhost:3001/api/opere/dettaglio/${slug}`);
        if (!filmResponse.ok) throw new Error("Film non trovato");
        const filmData = await filmResponse.json();
        setFilm(filmData);

        const recensioniResponse = await fetch(`http://localhost:3001/api/opere/recensioni/${slug}`);
        if (recensioniResponse.ok) {
          const recensioniData = await recensioniResponse.json();
          setRecensioni(recensioniData);
        }

        // Se l'utente è loggato, verifichiamo subito lo stato della sua watchlist per questo film
        if (attualeUtente && filmData) {
          const watchlistCheck = await fetch(`http://localhost:3001/api/watchlist/${attualeUtente.id}/${filmData.id}`);
          if (watchlistCheck.ok) {
            const checkData = await watchlistCheck.json();
            setIsInWatchlist(checkData.inWatchlist); // Si aspetta un riscontro vero/falso dal server
          }
        }

        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchFilmEDettagli();
  }, [slug]);

  // ================= LOGICA TOGGLE WATCHLIST (AGGIUNGI / RIMUOVI) =================
  const handleAggiungiWatchlist = async () => {
    if (!utente || !film) return;
    setWatchlistStatus("loading");
    
    // Se è già presente usiamo il metodo DELETE, altrimenti usiamo POST
    const metodo = isInWatchlist ? "DELETE" : "POST";
    const url = isInWatchlist 
      ? `http://localhost:3001/api/watchlist/${utente.id}/${film.id}`
      : "http://localhost:3001/api/watchlist";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: metodo === "POST" ? JSON.stringify({ id_utente: utente.id, id_opera: film.id }) : null
      });
      
      if (!res.ok) throw new Error("Errore nell'operazione");
      
      // Invertiamo lo stato booleano e diamo il feedback di successo
      setIsInWatchlist(!isInWatchlist);
      setWatchlistStatus("success");
      setTimeout(() => setWatchlistStatus("default"), 2000);

    } catch (err) {
      setWatchlistStatus("error");
      setTimeout(() => setWatchlistStatus("default"), 2000);
    }
  };

  // ================= LOGICA DIARIO =================
  const handleAggiungiDiario = async (e) => {
    e.preventDefault();
    if (!utente) return;
    setDiarioStatus("loading");

    try {
      const response = await fetch("http://localhost:3001/api/diario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_utente: utente.id, id_opera: film.id, data_visione: dataVisione })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.errore);
      
      setDiarioStatus("success");
      setTimeout(() => {
        setDiarioStatus("default");
        setShowDiarioModal(false);
      }, 1500);

    } catch (err) {
      setDiarioStatus("error");
      setTimeout(() => setDiarioStatus("default"), 2500);
    }
  };

  // ================= LOGICA LISTE =================
  const apriModaleListe = async () => {
    if (!utente) return;
    setShowListeModal(true);
    try {
      const res = await fetch(`http://localhost:3001/api/liste/utente/${utente.id}`);
      if (res.ok) {
        const data = await res.json();
        setMieListe(data);
      }
    } catch (err) {
      console.error("Errore caricamento liste:", err);
    }
  };

  const aggiungiFilmALista = async (id_lista) => {
    setListeStatus(id_lista); 
    try {
      const res = await fetch(`http://localhost:3001/api/liste/${id_lista}/aggiungi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_opera: film.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errore);
      
      setListeStatus("success");
      setTimeout(() => {
        setListeStatus("default");
        setShowListeModal(false);
      }, 1500);
    } catch (err) {
      alert(err.message);
      setListeStatus("default");
    }
  };

  // ================= LOGICA RECENSIONI =================
const handleReviewSubmit = async (e) => {
  e.preventDefault();
  if (!utente) return;
  setIsSubmitting(true);
  setSubmitError(null);
  setSubmitSuccess(false);

  try {
    const response = await fetch(`http://localhost:3001/api/opere/recensione/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        testo: nuovaRecensione, 
        id_utente: utente.id,
        voto: voto ? parseFloat(voto) : null // Inviamo il voto numerico
      }),
    });

    if (!response.ok) throw new Error("Errore durante l'invio.");
    const resJson = await response.json();

    const mockNuovaRecensione = {
      id: resJson.id || Date.now(),
      testo: nuovaRecensione,
      data_creazione: new Date().toISOString(),
      username: utente.username,
      valore_stelle: voto ? parseFloat(voto) : null, // Viene intercettato subito da renderStelle()
      numero_like: 0
    };

    setRecensioni([mockNuovaRecensione, ...recensioni]);
    setSubmitSuccess(true);
    setNuovaRecensione("");
    setVoto("");
    
    // Chiude il modale dopo un breve istante di conferma visiva
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowReviewModal(false);
    }, 1200);

  } catch (err) {
    setSubmitError(err.message);
  } finally {
    setIsSubmitting(false);
  }
};

  if (isLoading) return <div style={{ color: "white", padding: "100px", textAlign: "center" }}>Caricamento film...</div>;
  if (error) return <div style={{ color: "white", padding: "100px", textAlign: "center" }}>{error}</div>;
  if (!film) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#14181c", color: "#9ab" }}>
      
      {/* NAVBAR DINAMICA */}
      {utente ? <NavbarLoggato /> : <NavbarGlobale />}

      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "500px",
        backgroundImage: `url(${film.poster})`, backgroundSize: "cover",
        backgroundPosition: "center 20%", filter: "blur(20px) brightness(0.2)", zIndex: 0
      }}></div>

      <main style={{ position: "relative", zIndex: 1, paddingTop: "120px", maxWidth: "960px", margin: "0 auto", display: "flex", gap: "40px", paddingInline: "20px" }}>

        <aside style={{ width: "230px", flexShrink: 0 }}>
          <img src={film.poster} alt={film.titolo} style={{ width: "100%", borderRadius: "4px", border: "1px solid #445566" }} />
          
          {/* BOTTONI AZIONE PER UTENTE LOGGATO */}
          {utente && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
              <button 
                onClick={() => setShowDiarioModal(true)}
                style={{ background: "#00b020", color: "white", border: "none", padding: "10px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", textTransform: "uppercase" }}
              >
                Logga Visione
              </button>
              
{/* PULSANTE WATCHLIST INTERATTIVO E DINAMICO */}
<button 
  onClick={handleAggiungiWatchlist}
  disabled={watchlistStatus === "loading"}
  style={{ 
    background: watchlistStatus === "success" 
      ? "#00c030" 
      : watchlistStatus === "error" 
      ? "#ff4040" 
      : isInWatchlist 
      ? "#e13434" // Rosso quando il film è già presente nella watchlist
      : "#2c3440", 
    color: (watchlistStatus === "default" && !isInWatchlist) ? "#8c9babc4" : "white", 
    border: watchlistStatus === "default" && !isInWatchlist ? "1px solid #445566" : "1px solid transparent", 
    padding: "10px", 
    borderRadius: "4px", 
    cursor: "pointer", 
    fontWeight: "bold", 
    textTransform: "uppercase", 
    transition: "all 0.3s ease" 
  }}
>
  {watchlistStatus === "loading" && "..."}
  {watchlistStatus === "error" && "Errore"}
  {watchlistStatus === "success" && (isInWatchlist ? "✓ Aggiunto" : "Rimosso")}
  {watchlistStatus === "default" && (isInWatchlist ? "Rimuovi dalla watchlist" : "+ Watchlist")}
</button>

              <button 
                onClick={apriModaleListe}
                style={{ 
                  background: "#2c3440", color: "#8c9babc4", border: "1px solid #445566", 
                  padding: "10px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", textTransform: "uppercase", transition: "all 0.3s ease" 
                }}
                onMouseOver={(e) => { e.target.style.background = "#445566"; e.target.style.color = "white"; }}
                onMouseOut={(e) => { e.target.style.background = "#2c3440"; e.target.style.color = "#8c9babc4"; }}
              >
                + Lista
              </button>
            </div>
          )}
        </aside>

        <article style={{ flexGrow: 1, paddingTop: "10px" }}>
          <h1 style={{ color: "white", fontSize: "2.5rem", margin: "0 0 5px 0" }}>{film.titolo}</h1>
          
          <div style={{ fontSize: "1.1rem", marginBottom: "15px" }}>
            <span style={{ color: "white", fontWeight: "bold" }}>{film.anno_uscita}</span>
            {film.regista && (
              <>
                <span style={{ margin: "0 8px" }}>Directed by</span>
                <Link to={`/attore/${generateSlug(film.regista)}`} style={{ color: "white", fontWeight: "bold", textDecoration: "none" }}>{film.regista}</Link>
              </>
            )}
          </div>

          {film.generi && film.generi.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
              {film.generi.map((genere, index) => (
                <Link key={index} to={`/genere/${generateSlug(genere)}`} style={{ background: "#24303c", color: "#9ab", padding: "4px 10px", borderRadius: "3px", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", textDecoration: "none", transition: "all 0.2s ease" }}>
                  {genere}
                </Link>
              ))}
            </div>
          )}

          <div style={{ marginBottom: "30px", lineHeight: "1.6", color: "#8c9babc4" }}>
            <p>{film.trama}</p>
          </div>

          {film.cast && film.cast.length > 0 && (
            <div style={{ marginBottom: "30px", borderTop: "1px solid #2c3440", paddingTop: "20px" }}>
              <h3 style={{ color: "white", fontSize: "1rem", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "1px" }}>Cast</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {film.cast.map((attore) => (
                  <Link key={attore.id} to={`/attore/${generateSlug(attore.nome)}`} style={{ background: "#1c252d", color: "white", padding: "6px 12px", borderRadius: "4px", textDecoration: "none", fontSize: "0.85rem", border: "1px solid #2c3440" }}>
                    <strong>{attore.nome}</strong>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: "40px", borderTop: "1px solid #456", paddingTop: "20px" }}>
            <h3 style={{ color: "white", fontSize: "1.1rem", marginBottom: "20px", textTransform: "uppercase" }}>Recensioni degli utenti</h3>
            {recensioni.length === 0 ? (
              <p style={{ fontStyle: "italic", color: "#667788" }}>Nessuna recensione presente.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "40px" }}>
                {recensioni.map((rev) => (
                  <div key={rev.id} style={{ background: "#1c252d", padding: "15px", borderRadius: "4px", borderLeft: "4px solid #00c030" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontSize: "0.85rem" }}>
                      <Link to={`/recensione/${rev.id}`} style={{ color: "#9ab", textDecoration: "none" }}>
                        Recensione di <strong style={{ color: "white" }}>{rev.username || "anonimo"}</strong>
                      </Link>
                      {rev.valore_stelle && (
                        <span style={{ color: "#00c030", fontWeight: "bold", fontSize: "1.05rem", marginLeft: "4px" }}>
                          {renderStelle(rev.valore_stelle)}
                        </span>
                      )}
                      <span style={{ color: "#678", marginLeft: "auto" }}>
                        {new Date(rev.data_creazione).toLocaleDateString("it-IT", { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ color: "#9ab", margin: 0, lineHeight: "1.5", fontSize: "0.95rem", whiteSpace: "pre-line" }}>{rev.testo}</p>
                    {rev.numero_like > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "12px", color: "#678", fontSize: "0.85rem" }}>
                        <span style={{ color: "#ff6666" }}>♥</span>
                        <span>{rev.numero_like.toLocaleString('it-IT')} {rev.numero_like === 1 ? 'like' : 'likes'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

<div style={{ marginTop: "30px", borderTop: "1px solid #2c3440", paddingTop: "20px", textAlign: "center" }}>
  {utente ? (
    <button 
      onClick={() => setShowReviewModal(true)}
      style={{ backgroundColor: "#00c030", color: "white", border: "none", padding: "12px 28px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "0.9rem" }}
    >
      ★ Recensisci o assegna un voto
    </button>
  ) : (
    <p style={{ fontStyle: "italic", color: "#667788" }}>Accedi alla piattaforma per poter votare e recensire questa opera.</p>
  )}
</div>
        </article>
      </main>

      {/* MODALE DEL DIARIO */}
      {showDiarioModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#2c3440", padding: "30px", borderRadius: "6px", width: "400px", border: "1px solid #445566", position: "relative" }}>
            <button onClick={() => setShowDiarioModal(false)} style={{ position: "absolute", top: "10px", right: "15px", background: "none", border: "none", color: "#8c9babc4", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            <h2 style={{ color: "white", marginTop: 0, borderBottom: "1px solid #445566", paddingBottom: "10px" }}>Logga "{film.titolo}"</h2>
            <form onSubmit={handleAggiungiDiario} style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ color: "#8c9babc4", fontSize: "0.9rem", textTransform: "uppercase" }}>Data di visione</label>
                <input type="date" value={dataVisione} onChange={(e) => setDataVisione(e.target.value)} required style={{ padding: "10px", borderRadius: "4px", border: "none", background: "#14181c", color: "white" }} />
              </div>
              <button 
                type="submit" 
                disabled={diarioStatus !== "default"}
                style={{ padding: "12px", background: diarioStatus === "success" ? "#00c030" : diarioStatus === "error" ? "#ff4040" : "#00b020", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: diarioStatus === "default" ? "pointer" : "default", textTransform: "uppercase", transition: "background 0.3s ease" }}
              >
                {diarioStatus === "default" && "Salva nel Diario"}
                {diarioStatus === "loading" && "Salvataggio..."}
                {diarioStatus === "success" && "✓ Salvato!"}
                {diarioStatus === "error" && "Film già loggato oggi!"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DELLE LISTE */}
      {showListeModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#2c3440", padding: "30px", borderRadius: "6px", width: "400px", border: "1px solid #445566", position: "relative" }}>
            <button onClick={() => setShowListeModal(false)} style={{ position: "absolute", top: "10px", right: "15px", background: "none", border: "none", color: "#8c9babc4", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            <h2 style={{ color: "white", marginTop: 0, borderBottom: "1px solid #445566", paddingBottom: "10px" }}>Aggiungi a una lista</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px", maxHeight: "300px", overflowY: "auto" }}>
              {mieListe.length === 0 ? (
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#8c9babc4", fontStyle: "italic" }}>Non hai ancora creato nessuna lista.</p>
                  <Link to="/profilo/liste" style={{ color: "#00e054", textDecoration: "none", fontWeight: "bold" }}>Vai a crearne una</Link>
                </div>
              ) : (
                mieListe.map(lista => (
                  <button 
                    key={lista.id}
                    onClick={() => aggiungiFilmALista(lista.id)}
                    disabled={listeStatus !== "default"}
                    style={{
                      background: listeStatus === lista.id ? "#445566" : listeStatus === "success" ? "#00c030" : "#1c252d",
                      color: "white", border: "1px solid #445566", padding: "12px", borderRadius: "4px", cursor: listeStatus === "default" ? "pointer" : "default", textAlign: "left", fontWeight: "bold", transition: "all 0.2s"
                    }}
                  >
                    {listeStatus === lista.id ? "Aggiungendo..." : listeStatus === "success" ? "✓ Aggiunto!" : lista.titolo}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODALE PER L'INSERIMENTO DI VOTO E RECENSIONE */}
      {showReviewModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#2c3440", padding: "30px", borderRadius: "6px", width: "450px", border: "1px solid #445566", position: "relative" }}>
            <button onClick={() => { setShowReviewModal(false); setSubmitError(null); }} style={{ position: "absolute", top: "10px", right: "15px", background: "none", border: "none", color: "#8c9babc4", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            
            <h2 style={{ color: "white", marginTop: 0, borderBottom: "1px solid #445566", paddingBottom: "10px", fontSize: "1.25rem" }}>Esprimi il tuo parere</h2>
            <p style={{ color: "#00e054", fontWeight: "bold", margin: "5px 0 15px 0", fontSize: "0.95rem" }}>{film.titolo}</p>
            
            {submitSuccess && <div style={{ color: "#00c030", fontWeight: "bold", paddingBottom: "10px" }}>✓ Pubblicata con successo!</div>}
            {submitError && <div style={{ color: "#ff4040", fontWeight: "bold", paddingBottom: "10px" }}>{submitError}</div>}
            
            <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              
              {/* SELEZIONE DELLE STELLE */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ color: "#8c9babc4", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "bold" }}>Valutazione (Stelle)</label>
                <select 
                  value={voto} 
                  onChange={(e) => setVoto(e.target.value)} 
                  style={{ padding: "10px", borderRadius: "4px", border: "none", background: "#14181c", color: "white", outline: "none", cursor: "pointer", fontWeight: "bold" }}
                >
                  <option value="">Senza voto</option>
                  <option value="1">★ (1.0)</option>
                  <option value="1.5">★½ (1.5)</option>
                  <option value="2">★★ (2.0)</option>
                  <option value="2.5">★★½ (2.5)</option>
                  <option value="3">★★★ (3.0)</option>
                  <option value="3.5">★★★½ (3.5)</option>
                  <option value="4">★★★★ (4.0)</option>
                  <option value="4.5">★★★★½ (4.5)</option>
                  <option value="5">★★★★★ (5.0)</option>
                </select>
              </div>

              {/* AREA DI TESTO RECENSIONE */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ color: "#8c9babc4", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "bold" }}>Recensione Scritta</label>
                <textarea 
                  value={nuovaRecensione} 
                  onChange={(e) => setNuovaRecensione(e.target.value)} 
                  placeholder="Scrivi qui i tuoi pensieri personali sul film..." 
                  required 
                  style={{ width: "100%", height: "110px", backgroundColor: "#14181c", border: "none", color: "white", padding: "10px", borderRadius: "4px", resize: "none", outline: "none", lineHeight: "1.4" }} 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ padding: "12px", background: "#00b020", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", textTransform: "uppercase", marginTop: "5px" }}
              >
                {isSubmitting ? "Invio in corso..." : "Salva e pubblica"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default FilmPage;