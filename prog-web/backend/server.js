const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("Server Letterboxd attivo");
});

/* =========================
   OPERE
========================= */

// Leggere tutte le opere
app.get("/api/opere", (req, res) => {
  const query = "SELECT * FROM opera ORDER BY id DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Errore recupero opere:", err);
      return res.status(500).json({ errore: "Errore nel recupero delle opere" });
    }

    res.json(results);
  });
});

// Leggere una singola opera
app.get("/api/opere/:id", (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM opera WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Errore recupero opera:", err);
      return res.status(500).json({ errore: "Errore nel recupero dell'opera" });
    }

    if (results.length === 0) {
      return res.status(404).json({ errore: "Opera non trovata" });
    }

    res.json(results[0]);
  });
});

// Inserire una nuova opera
app.post("/api/opere", (req, res) => {
  const { titolo, trama, anno_uscita, durata_minuti, poster, tipo_opera } = req.body;

  const query = `
    INSERT INTO opera 
    (titolo, trama, anno_uscita, durata_minuti, poster, tipo_opera)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [titolo, trama, anno_uscita, durata_minuti, poster, tipo_opera],
    (err, results) => {
      if (err) {
        console.error("Errore inserimento opera:", err);
        return res.status(500).json({ errore: "Errore nell'inserimento dell'opera" });
      }

      res.status(201).json({
        messaggio: "Opera inserita correttamente",
        id: results.insertId,
      });
    }
  );
});

// Recuperare i dettagli completi di un film (Inclusi Cast, Regista e Generi) tramite lo slug
app.get("/api/opere/dettaglio/:slug", (req, res) => {
  const { slug } = req.params;

  // 1. Troviamo il film confrontando gli slug
  db.query("SELECT * FROM opera", (err, opere) => {
    if (err) return res.status(500).json({ errore: "Errore recupero opere" });

    // Funzione identica a quella del frontend per generare lo slug
    const generateSlug = (titolo) => titolo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Troviamo l'opera che corrisponde allo slug richiesto nell'URL
    const opera = opere.find(o => generateSlug(o.titolo) === slug);

    if (!opera) return res.status(404).json({ errore: "Film non trovato" });

    const operaId = opera.id;

    // 2. Eseguiamo le query per recuperare le relazioni
    const queryRegista = `SELECT p.nome FROM lavora l JOIN professionista p ON l.id_professionista = p.id WHERE l.id_opera = ? AND l.ruolo_lavorativo = 'Regista'`;
    const queryCast = `SELECT p.id, p.nome, r.nome_personaggio FROM recita r JOIN professionista p ON r.id_professionista = p.id WHERE r.id_opera = ?`;
    const queryGeneri = `SELECT g.nome_genere FROM appartiene a JOIN genere g ON a.id_genere = g.id WHERE a.id_opera = ?`;

    // Eseguiamo le query in cascata (o tramite Promise se usi mysql2/promise)
    db.query(queryRegista, [operaId], (err, registaRes) => {
      db.query(queryCast, [operaId], (err, castRes) => {
        db.query(queryGeneri, [operaId], (err, generiRes) => {
          
          // Assembliamo il JSON finale da inviare al frontend React
          res.json({
            ...opera,
            regista: registaRes.length > 0 ? registaRes[0].nome : null,
            cast: castRes,
            generi: generiRes.map(g => g.nome_genere) // Trasforma l'array di oggetti in un array di stringhe
          });

        });
      });
    });
  });
});

/* =========================
   UTENTI
========================= */

// Leggere utenti
app.get("/api/utenti", (req, res) => {
  const query = `
    SELECT id, username, email, ruolo, data_iscrizione
    FROM utente
    ORDER BY id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Errore recupero utenti:", err);
      return res.status(500).json({ errore: "Errore nel recupero degli utenti" });
    }

    res.json(results);
  });
});

// Inserire nuovo utente
app.post("/api/utenti", (req, res) => {
  const { username, email, password, ruolo } = req.body;

  const query = `
    INSERT INTO utente 
    (username, email, password, ruolo)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [username, email, password, ruolo || "utente"], (err, results) => {
    if (err) {
      console.error("Errore inserimento utente:", err);
      return res.status(500).json({ errore: "Errore nella registrazione dell'utente" });
    }

    res.status(201).json({
      messaggio: "Utente registrato correttamente",
      id: results.insertId,
    });
  });
});

/* =========================
   AVVIO SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});