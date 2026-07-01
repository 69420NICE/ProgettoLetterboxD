import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NavbarGlobale from "./NavbarGlobale";

const generateSlug = (testo) => {
    if (!testo) return "";
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

function RecensionePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stati per l'utente loggato e la modifica
    const [utenteLoggato, setUtenteLoggato] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState("");
    const [editVoto, setEditVoto] = useState("");

    useEffect(() => {
        // Recuperiamo l'utente corrente in sessione
        const userInStorage = localStorage.getItem("utente");
        if (userInStorage) {
            setUtenteLoggato(JSON.parse(userInStorage));
        }

        fetchReviewDetails();
    }, [id]);

    const fetchReviewDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`http://localhost:3001/api/recensioni/${id}`);
            if (!response.ok) throw new Error("Recensione non trovata");

            const resData = await response.json();
            setData(resData);
            
            // Inizializziamo i campi di modifica con i valori attuali
            setEditText(resData.testo);
            setEditVoto(resData.valore_stelle || "");
            
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    /* ================= AZIONE SALVA MODIFICA ================= */
    const handleSaveModifica = async () => {
        if (!editText.trim()) return;

        try {
            const response = await fetch(`http://localhost:3001/api/recensioni/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    testo: editText.trim(),
                    voto: editVoto ? parseFloat(editVoto) : null
                })
            });

            if (response.ok) {
                setIsEditing(false);
                fetchReviewDetails(); // Ricarica i dati aggiornati
            } else {
                alert("Errore durante il salvataggio delle modifiche.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= AZIONE ELIMINA ================= */
    const handleDeleteClick = async () => {
        if (!window.confirm("Sei sicuro di voler eliminare definitivamente questa recensione?")) return;

        try {
            const response = await fetch(`http://localhost:3001/api/recensioni/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                alert("Recensione eliminata con successo.");
                // Reindirizziamo l'utente alla pagina del catalogo o del film
                navigate("/catalogo");
            } else {
                alert("Errore durante l'eliminazione.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) return <div style={{ color: "white", padding: "100px", textAlign: "center" }}>Caricamento recensione...</div>;
    if (error) return <div style={{ color: "white", padding: "100px", textAlign: "center" }}>{error}</div>;
    if (!data) return null;

    // Controllo per stabilire se l'autore della recensione coincide con l'utente loggato
    const isOwnReview = utenteLoggato && utenteLoggato.username === data.username;

    // Stili riutilizzabili per i pulsanti di controllo
    const btnActionStyle = { padding: "5px 12px", borderRadius: "3px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem", color: "white" };
    const selectStyle = { padding: "6px 10px", background: "#14181c", color: "white", border: "1px solid #445566", borderRadius: "4px", outline: "none", marginBottom: "15px", fontWeight: "bold", cursor: "pointer" };

    return (
        <div style={{ minHeight: "100vh", background: "#14181c", color: "#9ab" }}>
            <NavbarGlobale />

            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "400px",
                backgroundImage: `url(${data.poster})`, backgroundSize: "cover",
                backgroundPosition: "center 20%", filter: "blur(25px) brightness(0.15)", zIndex: 0
            }}></div>

            <main style={{ position: "relative", zIndex: 1, paddingTop: "140px", maxWidth: "960px", margin: "0 auto", display: "flex", gap: "40px", paddingInline: "20px" }}>

<aside style={{ width: "150px", flexShrink: 0 }}>
    <Link to={`/film/${generateSlug(data.titolo)}`}>
        <img src={data.poster} alt={data.titolo} style={{ width: "100%", borderRadius: "4px", border: "1px solid #445566", boxShadow: "0 4px 20px rgba(0,0,0,0.6)" }} />
    </Link>
</aside>

                <article style={{ flexGrow: 1 }}>
                    <span style={{ fontSize: "0.85rem", color: "#678", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "bold" }}>
                        Recensione di
                    </span>

                    {/* Username + Stelle */}
    <h2 style={{ color: "white", fontSize: "2.2rem", margin: "2px 0 12px 0", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            @{data.username}

            {!isEditing && data.valore_stelle && (
                <span style={{ color: "#00c030", fontSize: "1.5rem", letterSpacing: "1px" }}>
                    {renderStelle(data.valore_stelle)}
                </span>
            )}
        </div>

        {/* INSERITI QUI: Pulsanti di controllo orizzontali e compatti */}
        {isOwnReview && !isEditing && (
            <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setIsEditing(true)} style={{ ...btnActionStyle, background: "#40bcf4", padding: "6px 14px" }}>Modifica</button>
                <button onClick={handleDeleteClick} style={{ ...btnActionStyle, background: "#ff4040", padding: "6px 14px" }}>Elimina</button>
            </div>
        )}
    </h2>

                    <div style={{ fontSize: "1.25rem", marginBottom: "25px", borderBottom: "1px solid #2c3440", paddingBottom: "15px" }}>
                        <span style={{ color: "#678" }}>Su </span>
                        <Link to={`/film/${generateSlug(data.titolo)}`} style={{ color: "white", fontWeight: "bold", textDecoration: "none" }}>
                            {data.titolo}
                        </Link>
                        <span style={{ color: "#678", marginLeft: "8px", fontSize: "1.1rem" }}>({data.anno_uscita})</span>
                    </div>

                    {/* BLOCCO CONTENUTO DINAMICO (SE EDITING ABILITATO O VISUALIZZAZIONE) */}
                    {isEditing ? (
                        <div style={{ background: "#1c252d", padding: "25px", borderRadius: "6px", border: "1px solid #445566", display: "flex", flexDirection: "column" }}>
                            
                            {/* Modifica Voto Stelle */}
                            <label style={{ fontSize: "0.8rem", color: "#8c9babc4", marginBottom: "5px", textTransform: "uppercase", fontWeight: "bold" }}>Modifica Voto</label>
                            <select value={editVoto} onChange={(e) => setEditVoto(e.target.value)} style={selectStyle}>
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

                            {/* Modifica Testo */}
                            <label style={{ fontSize: "0.8rem", color: "#8c9babc4", marginBottom: "5px", textTransform: "uppercase", fontWeight: "bold" }}>Modifica Testo</label>
                            <textarea 
                                value={editText} 
                                onChange={(e) => setEditText(e.target.value)} 
                                style={{ width: "100%", height: "140px", backgroundColor: "#14181c", border: "1px solid #445566", color: "white", padding: "12px", borderRadius: "4px", resize: "none", outline: "none", lineHeight: "1.5", marginBottom: "15px" }} 
                            />

                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <button onClick={handleSaveModifica} style={{ ...btnActionStyle, background: "#00b020", padding: "8px 20px" }}>Salva</button>
                                <button onClick={() => { setIsEditing(false); fetchReviewDetails(); }} style={{ ...btnActionStyle, background: "#445566", padding: "8px 20px" }}>Annulla</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: "#1c252d", padding: "25px", borderRadius: "6px", borderLeft: "5px solid #00c030", boxShadow: "0 4px 15px rgba(0,0,0,0.45)" }}>
                            <p style={{ lineHeight: "1.7", color: "#bcd", fontSize: "1.1rem", whiteSpace: "pre-line", margin: 0 }}>
                                {data.testo}
                            </p>

                            {data.numero_like > 0 && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "6px", marginTop: "25px",
                                    color: "#678", fontSize: "0.9rem", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "15px"
                                }}>
                                    <span style={{ color: "#ff6666", fontSize: "1.15rem" }}>♥</span>
                                    <span>
                                        {data.numero_like.toLocaleString('it-IT')} {data.numero_like === 1 ? 'like' : 'likes'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ marginTop: "15px", fontSize: "0.85rem", color: "#678", textAlign: "right", fontStyle: "italic" }}>
                        Pubblicata il {new Date(data.data_creazione).toLocaleDateString("it-IT", {
                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </div>
                </article>
            </main>
        </div>
    );
}

export default RecensionePage;