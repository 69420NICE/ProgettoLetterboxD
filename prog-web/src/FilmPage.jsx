import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import NavbarGlobale from "./NavbarGlobale";

const generateSlug = (testo) => {
  return testo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// Trasforma il valore decimale in stelline (Es: 3.5 -> ★★★½)
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

  const [nuovaRecensione, setNuovaRecensione] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
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

        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchFilmEDettagli();
  }, [slug]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch(`http://localhost:3001/api/opere/recensione/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testo: nuovaRecensione, id_utente: 2 }),
      });

      if (!response.ok) throw new Error("Errore durante l'invio.");
      const resJson = await response.json();

      const mockNuovaRecensione = {
        id: resJson.id || Date.now(),
        testo: nuovaRecensione,
        data_creazione: new Date().toISOString(),
        username: "Tu",
        valore_stelle: null,
        numero_like: 0
      };

      setRecensioni([mockNuovaRecensione, ...recensioni]);
      setSubmitSuccess(true);
      setNuovaRecensione("");
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
      <NavbarGlobale />

      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "500px",
        backgroundImage: `url(${film.poster})`, backgroundSize: "cover",
        backgroundPosition: "center 20%", filter: "blur(20px) brightness(0.2)", zIndex: 0
      }}></div>

      <main style={{ position: "relative", zIndex: 1, paddingTop: "120px", maxWidth: "960px", margin: "0 auto", display: "flex", gap: "40px", paddingInline: "20px" }}>

        <aside style={{ width: "230px", flexShrink: 0 }}>
          <img src={film.poster} alt={film.titolo} style={{ width: "100%", borderRadius: "4px", border: "1px solid #445566" }} />
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

          {/* ================= SEZIONE GENERI CLICCABILI ================= */}
          {film.generi && film.generi.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
              {film.generi.map((genere, index) => (
                <Link
                  key={index}
                  to={`/genere/${generateSlug(genere)}`}
                  style={{
                    background: "#24303c",
                    color: "#9ab",
                    padding: "4px 10px",
                    borderRadius: "3px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    textDecoration: "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#2c3b4a";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "#24303c";
                    e.currentTarget.style.color = "#9ab";
                  }}
                >
                  {genere}
                </Link>
              ))}
            </div>
          )}
          {/* =============================================================== */}

          <div style={{ marginBottom: "30px", lineHeight: "1.6", color: "#8c9babc4" }}>
            <p>{film.trama}</p>
          </div>

          {/* ================= SEZIONE CAST ================= */}
          {film.cast && film.cast.length > 0 && (
            <div style={{ marginBottom: "30px", borderTop: "1px solid #2c3440", paddingTop: "20px" }}>
              <h3 style={{ color: "white", fontSize: "1rem", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "1px" }}>Cast</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {film.cast.map((attore) => (
                  <Link
                    key={attore.id}
                    to={`/attore/${generateSlug(attore.nome)}`}
                    style={{
                      background: "#1c252d",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      border: "1px solid #2c3440",
                      transition: "all 0.2s ease"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#2c3440";
                      e.currentTarget.style.borderColor = "#445566";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "#1c252d";
                      e.currentTarget.style.borderColor = "#2c3440";
                    }}
                  >
                    <strong>{attore.nome}</strong>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {/* ============================================================= */}

          {/* Feed delle Recensioni */}
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

                      {/* STELLE RECUPERATE TRAMITE L'UTENTE */}
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

                    {/* CONTEGGIO LIKE SOTTO IL TESTO */}
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

          {/* Form Recensione */}
          <div style={{ marginTop: "20px", borderTop: "1px solid #2c3440", paddingTop: "20px" }}>
            <h4 style={{ color: "white", textTransform: "uppercase", fontSize: "1rem" }}>Lascia il tuo parere</h4>
            {submitSuccess && <div style={{ color: "#00c030", padding: "10px 0" }}>✓ Pubblicata!</div>}
            <form onSubmit={handleReviewSubmit}>
              <textarea value={nuovaRecensione} onChange={(e) => setNuovaRecensione(e.target.value)} placeholder="Scrivi qui..." required style={{ width: "100%", height: "80px", backgroundColor: "#1c252d", border: "1px solid #445566", color: "white", padding: "10px", borderRadius: "4px", marginBottom: "10px" }} />
              <button type="submit" disabled={isSubmitting} style={{ backgroundColor: "#00c030", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Invia</button>
            </form>
          </div>
        </article>
      </main>
    </div>
  );
}

export default FilmPage;