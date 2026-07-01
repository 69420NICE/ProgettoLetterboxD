import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import NavbarGlobale from "./NavbarGlobale";
import NavbarLoggato from "./NavbarLoggato";

const generateSlug = (testo) => testo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

function DettaglioLista() {
  const { id_lista } = useParams();
  const [listaInfo, setListaInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errore, setErrore] = useState(null);
  
  const utenteString = localStorage.getItem("utente");
  const utente = utenteString ? JSON.parse(utenteString) : null;

  useEffect(() => {
    const fetchLista = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/liste/dettaglio/${id_lista}`);
        if (!response.ok) throw new Error("Lista non trovata o privata");
        const data = await response.json();
        setListaInfo(data);
        setIsLoading(false);
      } catch (err) {
        setErrore(err.message);
        setIsLoading(false);
      }
    };
    fetchLista();
  }, [id_lista]);

  const handleRimuoviFilm = async (id_opera) => {
    if (!window.confirm("Rimuovere questo film dalla lista?")) return;
    try {
      const response = await fetch(`http://localhost:3001/api/liste/${id_lista}/opera/${id_opera}`, { method: "DELETE" });
      if (response.ok) {
        // Rimuove il film visivamente dalla pagina
        setListaInfo({
          ...listaInfo,
          film: listaInfo.film.filter(f => f.id_opera !== id_opera)
        });
      }
    } catch (err) {
      alert("Errore nella rimozione");
    }
  };

  if (isLoading) return <div style={{ color: "white", textAlign: "center", padding: "50px" }}>Caricamento...</div>;
  if (errore) return <div style={{ color: "red", textAlign: "center", padding: "50px" }}>{errore}</div>;
  if (!listaInfo) return null;

  // Controlliamo se l'utente loggato è l'autore della lista
  const isMiaLista = utente && utente.id === listaInfo.id_utente;

  return (
    <div style={{ background: "#14181c", minHeight: "100vh", color: "white" }}>
      {utente ? <NavbarLoggato /> : <NavbarGlobale />}

      <main style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px" }}>
        
        <header style={{ borderBottom: "1px solid #445566", paddingBottom: "20px", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "2.5rem", margin: "0 0 10px 0" }}>{listaInfo.titolo}</h1>
          <p style={{ color: "#8c9babc4", margin: "0 0 15px 0" }}>
            Una lista creata da <strong style={{ color: "white" }}>{listaInfo.username}</strong>
          </p>
          {listaInfo.descrizione && (
            <p style={{ lineHeight: "1.6", color: "#9ab", background: "#1c252d", padding: "15px", borderRadius: "4px" }}>
              {listaInfo.descrizione}
            </p>
          )}
        </header>

        {listaInfo.film.length === 0 ? (
          <p style={{ color: "#8c9babc4", fontStyle: "italic", textAlign: "center", marginTop: "50px" }}>Questa lista non contiene ancora film.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "20px" }}>
            {listaInfo.film.map((film) => (
              <div key={film.id_opera} style={{ display: "flex", flexDirection: "column" }}>
                <Link to={`/${generateSlug(film.titolo)}`} style={{ textDecoration: "none" }}>
                  <img 
                    src={film.poster} 
                    alt={film.titolo} 
                    style={{ width: "100%", borderRadius: "4px", border: "1px solid #445566", aspectRatio: "2/3", objectFit: "cover" }}
                  />
                  <h3 style={{ fontSize: "0.9rem", color: "white", margin: "10px 0 5px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {film.titolo}
                  </h3>
                </Link>

                {/* Se sei il proprietario della lista, puoi eliminare il film */}
                {isMiaLista && (
                  <button 
                    onClick={() => handleRimuoviFilm(film.id_opera)}
                    style={{ background: "transparent", border: "none", color: "#8c9babc4", fontSize: "0.8rem", cursor: "pointer", textAlign: "left", padding: "5px 0", marginTop: "auto" }}
                    onMouseOver={(e) => e.target.style.color = "#ff4040"}
                    onMouseOut={(e) => e.target.style.color = "#8c9babc4"}
                  >
                    Rimuovi
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default DettaglioLista;