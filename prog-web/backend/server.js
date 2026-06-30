const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcrypt");

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

// Aggiornare un'opera esistente (Metodo PUT)
app.put("/api/opere/:id", (req, res) => {
  const { id } = req.params;
  const { titolo, trama, anno_uscita, durata_minuti, poster, tipo_opera } = req.body;

  const query = `
    UPDATE opera 
    SET titolo = ?, trama = ?, anno_uscita = ?, durata_minuti = ?, poster = ?, tipo_opera = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [titolo, trama, anno_uscita, durata_minuti, poster, tipo_opera, id],
    (err, results) => {
      if (err) {
        console.error("Errore aggiornamento opera:", err);
        return res.status(500).json({ errore: "Errore nell'aggiornamento dell'opera" });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ errore: "Opera non trovata" });
      }

      res.json({ messaggio: "Opera aggiornata correttamente" });
    }
  );
});

// Eliminare un'opera (Metodo DELETE)
app.delete("/api/opere/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM opera WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Errore eliminazione opera:", err);
      return res.status(500).json({ errore: "Errore nell'eliminazione" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ errore: "Opera non trovata" });
    }

    res.json({ messaggio: "Opera eliminata correttamente" });
  });
});

// Recuperare i dettagli completi di un film
app.get("/api/opere/dettaglio/:slug", (req, res) => {
  const { slug } = req.params;

  db.query("SELECT * FROM opera", (err, opere) => {
    if (err) return res.status(500).json({ errore: "Errore recupero opere" });

    const generateSlug = (titolo) => titolo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const opera = opere.find(o => generateSlug(o.titolo) === slug);

    if (!opera) return res.status(404).json({ errore: "Film non trovato" });

    const operaId = opera.id;

    const queryRegista = `SELECT p.nome FROM lavora l JOIN professionista p ON l.id_professionista = p.id WHERE l.id_opera = ? AND l.ruolo_lavorativo = 'Regista'`;
    const queryCast = `SELECT p.id, p.nome, r.nome_personaggio FROM recita r JOIN professionista p ON r.id_professionista = p.id WHERE r.id_opera = ?`;
    const queryGeneri = `SELECT g.nome_genere FROM appartiene a JOIN genere g ON a.id_genere = g.id WHERE a.id_opera = ?`;

    db.query(queryRegista, [operaId], (err, registaRes) => {
      db.query(queryCast, [operaId], (err, castRes) => {
        db.query(queryGeneri, [operaId], (err, generiRes) => {
          res.json({
            ...opera,
            regista: registaRes.length > 0 ? registaRes[0].nome : null,
            cast: castRes,
            generi: generiRes.map(g => g.nome_genere)
          });
        });
      });
    });
  });
});

/* =========================
   UTENTI E AUTENTICAZIONE
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

// Inserire nuovo utente (Registrazione)
app.post("/api/utenti", async (req, res) => {
  const { username, email, password, ruolo } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO utente 
      (username, email, password, ruolo)
      VALUES (?, ?, ?, ?)
    `;

    db.query(query, [username, email, hashedPassword, ruolo || "utente"], (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ errore: "Username o email già in uso." });
        }
        console.error("Errore inserimento utente:", err);
        return res.status(500).json({ errore: "Errore nella registrazione dell'utente" });
      }

      res.status(201).json({
        messaggio: "Utente registrato correttamente",
        id: results.insertId,
      });
    });
  } catch (error) {
    console.error("Errore durante la crittografia:", error);
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

// NUOVA ROTTA: Login Utente
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Cerca l'utente per email
    const query = "SELECT * FROM utente WHERE email = ?";
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error("Errore ricerca utente:", err);
        return res.status(500).json({ errore: "Errore interno del server" });
      }

      // Se non trova nessuno con quell'email
      if (results.length === 0) {
        return res.status(401).json({ errore: "Credenziali non valide" });
      }

      const utenteTrovato = results[0];

      // 2. Confronta la password inviata con l'hash salvato nel DB usando bcrypt
      const passwordCorretta = await bcrypt.compare(password, utenteTrovato.password);

      if (!passwordCorretta) {
        return res.status(401).json({ errore: "Credenziali non valide" });
      }

      // 3. Login riuscito! Non mandiamo la password indietro al client per sicurezza
      res.status(200).json({
        messaggio: "Accesso effettuato con successo",
        utente: {
          id: utenteTrovato.id,
          username: utenteTrovato.username,
          email: utenteTrovato.email,
          ruolo: utenteTrovato.ruolo
        }
      });
    });
  } catch (error) {
    console.error("Errore durante il login:", error);
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

/* =========================
   PROFESSIONISTI (CAST & CREW)
========================= */

app.get("/api/professionisti/dettaglio/:slug", (req, res) => {
  const { slug } = req.params;
  const generateSlug = (testo) => testo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  db.query("SELECT * FROM professionista", (err, professionisti) => {
    if (err) return res.status(500).json({ errore: "Errore recupero professionisti" });

    const professionista = professionisti.find(p => generateSlug(p.nome) === slug);
    if (!professionista) return res.status(404).json({ errore: "Professionista non trovato" });

    const queryFilmografia = `
      SELECT o.id, o.titolo, o.poster, o.anno_uscita, r.nome_personaggio 
      FROM recita r 
      JOIN opera o ON r.id_opera = o.id 
      WHERE r.id_professionista = ?
      
      UNION
      
      SELECT o.id, o.titolo, o.poster, o.anno_uscita, l.ruolo_lavorativo AS nome_personaggio 
      FROM lavora l 
      JOIN opera o ON l.id_opera = o.id 
      WHERE l.id_professionista = ?
      
      ORDER BY anno_uscita DESC
    `;

    db.query(queryFilmografia, [professionista.id, professionista.id], (err, filmRes) => {
      if (err) return res.status(500).json({ errore: "Errore recupero filmografia" });
      
      res.json({
        ...professionista,
        filmografia: filmRes
      });
    });
  });
});

app.put("/api/professionisti/:id", (req, res) => {
  const { id } = req.params;
  const { nome, biografia, immagine } = req.body;

  const query = `
    UPDATE professionista 
    SET nome = ?, biografia = ?, immagine = ?
    WHERE id = ?
  `;

  db.query(query, [nome, biografia, immagine, id], (err, results) => {
    if (err) {
      console.error("Errore aggiornamento professionista:", err);
      return res.status(500).json({ errore: "Errore nell'aggiornamento" });
    }
    if (results.affectedRows === 0) return res.status(404).json({ errore: "Professionista non trovato" });
    res.json({ messaggio: "Professionista aggiornato correttamente" });
  });
});

app.delete("/api/professionisti/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM professionista WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Errore eliminazione professionista:", err);
      return res.status(500).json({ errore: "Errore nell'eliminazione" });
    }
    res.json({ messaggio: "Professionista eliminato correttamente" });
  });
});

app.post("/api/professionisti", (req, res) => {
  const { nome, biografia, immagine } = req.body;
  const query = "INSERT INTO professionista (nome, biografia, immagine) VALUES (?, ?, ?)";

  db.query(query, [nome, biografia, immagine], (err, results) => {
    if (err) {
      console.error("Errore inserimento professionista:", err);
      return res.status(500).json({ errore: "Errore durante l'inserimento nel database" });
    }
    res.status(201).json({ 
      messaggio: "Professionista aggiunto correttamente", 
      id: results.insertId 
    });
  });
});

app.get("/api/professionisti", (req, res) => {
  db.query("SELECT * FROM professionista", (err, results) => {
    if (err) return res.status(500).json({ errore: "Errore recupero professionisti" });
    res.json(results);
  });
});

/* =========================
   GENERI
========================= */

app.get("/api/generi/dettaglio/:slug", (req, res) => {
  const { slug } = req.params;
  const generateSlug = (testo) => testo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  db.query("SELECT * FROM genere", (err, generi) => {
    if (err) return res.status(500).json({ errore: "Errore recupero generi" });

    const genere = generi.find(g => generateSlug(g.nome_genere) === slug);
    if (!genere) return res.status(404).json({ errore: "Genere non trovato" });

    const queryFilm = `
      SELECT o.id, o.titolo, o.poster, o.anno_uscita
      FROM appartiene a
      JOIN opera o ON a.id_opera = o.id
      WHERE a.id_genere = ?
      ORDER BY o.anno_uscita DESC
    `;

    db.query(queryFilm, [genere.id], (err, filmRes) => {
      if (err) return res.status(500).json({ errore: "Errore recupero film del genere" });
      
      res.json({
        ...genere,
        opere: filmRes
      });
    });
  });
});

/* =========================
   RICERCA GLOBALE
========================= */
app.get("/api/ricerca/:query", (req, res) => {
  const searchTerm = `%${req.params.query}%`;
  const queryOpere = "SELECT id, titolo, poster, anno_uscita FROM opera WHERE titolo LIKE ?";
  const queryProfessionisti = "SELECT id, nome, immagine FROM professionista WHERE nome LIKE ?";

  db.query(queryOpere, [searchTerm], (err, opereRes) => {
    if (err) return res.status(500).json({ errore: "Errore ricerca opere" });

    db.query(queryProfessionisti, [searchTerm], (err, profRes) => {
      if (err) return res.status(500).json({ errore: "Errore ricerca professionisti" });

      res.json({
        opere: opereRes,
        professionisti: profRes
      });
    });
  });
});

/* =========================
   AVVIO SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});

/* =========================
   DIARIO / VISIONI
========================= */

// Recuperare il diario completo di un utente
app.get("/api/diario/:id_utente", (req, res) => {
  const { id_utente } = req.params;

  // Facciamo una JOIN tra visione e opera per avere anche il titolo e il poster
  const query = `
    SELECT v.id_visione, v.data_visione, v.numero, o.id AS id_opera, o.titolo, o.poster 
    FROM visione v
    JOIN opera o ON v.id_opera = o.id
    WHERE v.id_utente = ?
    ORDER BY v.data_visione DESC
  `;

  db.query(query, [id_utente], (err, results) => {
    if (err) {
      console.error("Errore recupero diario:", err);
      return res.status(500).json({ errore: "Errore nel recupero del diario" });
    }
    res.json(results);
  });
});

// Aggiungere una nuova visione (Logga un film)
app.post("/api/diario", (req, res) => {
  const { id_utente, id_opera, data_visione } = req.body;

  const query = `
    INSERT INTO visione (id_utente, id_opera, data_visione) 
    VALUES (?, ?, ?)
  `;

  db.query(query, [id_utente, id_opera, data_visione], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ errore: "Hai già loggato questo film in questa data." });
      }
      console.error("Errore inserimento diario:", err);
      return res.status(500).json({ errore: "Errore nel salvataggio" });
    }
    res.status(201).json({ messaggio: "Film aggiunto al diario!", id_visione: results.insertId });
  });
});

// Eliminare una visione dal diario
app.delete("/api/diario/:id_visione", (req, res) => {
  const { id_visione } = req.params;

  const query = "DELETE FROM visione WHERE id_visione = ?";

  db.query(query, [id_visione], (err, results) => {
    if (err) {
      console.error("Errore eliminazione visione:", err);
      return res.status(500).json({ errore: "Errore nell'eliminazione" });
    }
    res.json({ messaggio: "Visione rimossa dal diario" });
  });
});