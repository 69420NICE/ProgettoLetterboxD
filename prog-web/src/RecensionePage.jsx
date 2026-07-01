import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "./Navbar";

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
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviewDetails = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`http://localhost:3001/api/recensioni/${id}`);
                if (!response.ok) throw new Error("Recensione non trovata");

                const resData = await response.json();
                setData(resData);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchReviewDetails();
    }, [id]);

    if (isLoading) return <div style={{ color: "white", padding: "100px", textAlign: "center" }}>Caricamento recensione...</div>;
    if (error) return <div style={{ color: "white", padding: "100px", textAlign: "center" }}>{error}</div>;
    if (!data) return null;

    return (
        <div style={{ minHeight: "100vh", background: "#14181c", color: "#9ab" }}>
            <Navbar />

            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "400px",
                backgroundImage: `url(${data.poster})`, backgroundSize: "cover",
                backgroundPosition: "center 20%", filter: "blur(25px) brightness(0.15)", zIndex: 0
            }}></div>

            <main style={{ position: "relative", zIndex: 1, paddingTop: "140px", maxWidth: "960px", margin: "0 auto", display: "flex", gap: "40px", paddingInline: "20px" }}>

                <aside style={{ width: "150px", flexShrink: 0 }}>
                    <Link to={`/${generateSlug(data.titolo)}`}>
                        <img src={data.poster} alt={data.titolo} style={{ width: "100%", borderRadius: "4px", border: "1px solid #445566", boxShadow: "0 4px 20px rgba(0,0,0,0.6)" }} />
                    </Link>
                </aside>

                <article style={{ flexGrow: 1 }}>
                    <span style={{ fontSize: "0.85rem", color: "#678", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "bold" }}>
                        Recensione di
                    </span>

                    {/* Username + Stelle del Voto cercate tramite l'autore */}
                    <h2 style={{ color: "white", fontSize: "2.2rem", margin: "2px 0 12px 0", fontWeight: "bold", display: "flex", alignItems: "center", gap: "12px" }}>
                        @{data.username}

                        {data.valore_stelle && (
                            <span style={{ color: "#00c030", fontSize: "1.5rem", letterSpacing: "1px" }}>
                                {renderStelle(data.valore_stelle)}
                            </span>
                        )}
                    </h2>

                    <div style={{ fontSize: "1.25rem", marginBottom: "25px", borderBottom: "1px solid #2c3440", paddingBottom: "15px" }}>
                        <span style={{ color: "#678" }}>Su </span>
                        <Link to={`/${generateSlug(data.titolo)}`} style={{ color: "white", fontWeight: "bold", textDecoration: "none" }}>
                            {data.titolo}
                        </Link>
                        <span style={{ color: "#678", marginLeft: "8px", fontSize: "1.1rem" }}>({data.anno_uscita})</span>
                    </div>

                    <div style={{ background: "#1c252d", padding: "25px", borderRadius: "6px", borderLeft: "5px solid #00c030", boxShadow: "0 4px 15px rgba(0,0,0,0.45)" }}>
                        <p style={{ lineHeight: "1.7", color: "#bcd", fontSize: "1.1rem", whiteSpace: "pre-line", margin: 0 }}>
                            {data.testo}
                        </p>

                        {/* SEZIONE LIKE IN BASSO (STILE LETTERBOXD DA IMMAGINE) */}
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