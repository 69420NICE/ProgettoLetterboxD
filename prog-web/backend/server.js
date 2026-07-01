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
   OPERE (INTEGRATE CON GENERI M:N)
========================= */

// 1. Leggere tutte le opere con i loro generi associati (Metodo GET unico)
app.get("/api/opere", (req, res) => {
  const query = `
    SELECT o.*, GROUP_CONCAT(a.id_genere) as generiIds 
    FROM opera o 
    LEFT JOIN appartiene a ON o.id = a.id_opera 
    GROUP BY o.id 
    ORDER BY o.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Errore recupero opere:", err);
      return res.status(500).json({ errore: "Errore nel recupero delle opere" });
    }

    const opereFormattate = results.map(opera => ({
      ...opera,
      generiIds: opera.generiIds ? opera.generiIds.split(",").map(Number) : []
    }));

    res.json(opereFormattate);
  });
});

// 2. Leggere una singola opera
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

// 3. Inserire una nuova opera con i suoi generi (Metodo POST unico)
app.post("/api/opere", (req, res) => {
  const { titolo, trama, anno_uscita, durata_minuti, poster, tipo_opera, generiIds } = req.body;
  const queryOpera = "INSERT INTO opera (titolo, trama, anno_uscita, durata_minuti, poster, tipo_opera) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(queryOpera, [titolo, trama, anno_uscita, durata_minuti, poster, tipo_opera], (err, results) => {
    if (err) {
      console.error("Errore inserimento opera:", err);
      return res.status(500).json({ errore: "Errore durante l'inserimento dell'opera" });
    }

    const id_opera = results.insertId;

    if (generiIds && generiIds.length > 0) {
      const values = generiIds.map(id_genere => [id_opera, Number(id_genere)]);
      const queryAppartiene = "INSERT INTO appartiene (id_opera, id_genere) VALUES ?";
      
      db.query(queryAppartiene, [values], (errApp) => {
        if (errApp) {
          console.error("Errore inserimento generi opera:", errApp);
          return res.status(500).json({ errore: "Opera creata, ma errore nel salvataggio dei generi" });
        }
        return res.status(201).json({ messaggio: "Opera e generi salvati con successo", id: id_opera });
      });
    } else {
      return res.status(201).json({ messaggio: "Opera salvata senza generi", id: id_opera });
    }
  });
});

// 4. Aggiornare un'opera esistente e i suoi generi (Metodo PUT unico)
app.put("/api/opere/:id", (req, res) => {
  const { id } = req.params;
  const { titolo, trama, anno_uscita, durata_minuti, poster, tipo_opera, generiIds } = req.body;
  const idOperaNum = parseInt(id, 10);

  const queryOpera = "UPDATE opera SET titolo = ?, trama = ?, anno_uscita = ?, durata_minuti = ?, poster = ?, tipo_opera = ? WHERE id = ?";

  db.query(queryOpera, [titolo, trama, anno_uscita, durata_minuti, poster, tipo_opera, idOperaNum], (err, results) => {
    if (err) {
      console.error("Errore aggiornamento opera:", err);
      return res.status(500).json({ errore: "Errore durante l'aggiornamento dell'opera" });
    }

    db.query("DELETE FROM appartiene WHERE id_opera = ?", [idOperaNum], (errDel) => {
      if (errDel) {
        console.error("Errore pulizia generi:", errDel);
        return res.status(500).json({ errore: "Errore durante l'aggiornamento dei generi" });
      }

      if (generiIds && generiIds.length > 0) {
        const values = generiIds.map(id_genere => [idOperaNum, Number(id_genere)]);
        const queryAppartiene = "INSERT INTO appartiene (id_opera, id_genere) VALUES ?";
        
        db.query(queryAppartiene, [values], (errIns) => {
          if (errIns) {
            console.error("Errore reinserimento generi:", errIns);
            return res.status(500).json({ errore: "Errore nel salvataggio dei nuovi generi" });
          }
          return res.json({ messaggio: "Opera e generi aggiornati correttamente" });
        });
      } else {
        return res.json({ messaggio: "Opera aggiornata (nessun genere associato)" });
      }
    });
  });
});

// 5. Eliminare un'opera (Metodo DELETE)
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

// 6. Recuperare i dettagli completi di un film (per la pagina pubblica del film)
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

app.get("/api/utenti", (req, res) => {
  const query = `SELECT id, username, email, ruolo, data_iscrizione FROM utente ORDER BY id DESC`;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Errore recupero utenti:", err);
      return res.status(500).json({ errore: "Errore nel recupero degli utenti" });
    }
    res.json(results);
  });
});

app.post("/api/utenti", async (req, res) => {
  const { username, email, password, ruolo } = req.body;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const query = `INSERT INTO utente (username, email, password, ruolo) VALUES (?, ?, ?, ?)`;

    db.query(query, [username, email, hashedPassword, ruolo || "utente"], (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ errore: "Username o email già in uso." });
        }
        return res.status(500).json({ errore: "Errore nella registrazione" });
      }
      res.status(201).json({ messaggio: "Utente registrato", id: results.insertId });
    });
  } catch (error) {
    res.status(500).json({ errore: "Errore interno" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = "SELECT * FROM utente WHERE email = ?";
    db.query(query, [email], async (err, results) => {
      if (err) return res.status(500).json({ errore: "Errore server" });
      if (results.length === 0) return res.status(401).json({ errore: "Credenziali non valide" });

      const utenteTrovato = results[0];
      const passwordCorretta = await bcrypt.compare(password, utenteTrovato.password);

      if (!passwordCorretta) return res.status(401).json({ errore: "Credenziali non valide" });

      res.status(200).json({
        messaggio: "Accesso effettuato",
        utente: { id: utenteTrovato.id, username: utenteTrovato.username, email: utenteTrovato.email, ruolo: utenteTrovato.ruolo }
      });
    });
  } catch (error) {
    res.status(500).json({ errore: "Errore server" });
  }
});

/* =========================
   PROFESSIONISTI (CAST & CREW)
========================= */

app.get("/api/professionisti", (req, res) => {
  db.query("SELECT * FROM professionista", (err, results) => {
    if (err) return res.status(500).json({ errore: "Errore recupero professionisti" });
    res.json(results);
  });
});

app.post("/api/professionisti", (req, res) => {
  const { nome, biografia, immagine } = req.body;
  const query = "INSERT INTO professionista (nome, biografia, immagine) VALUES (?, ?, ?)";
  db.query(query, [nome, biografia, immagine], (err, results) => {
    if (err) return res.status(500).json({ errore: "Errore inserimento" });
    res.status(201).json({ messaggio: "Professionista aggiunto", id: results.insertId });
  });
});

app.put("/api/professionisti/:id", (req, res) => {
  const { id } = req.params;
  const { nome, biografia, immagine } = req.body;
  const query = `UPDATE professionista SET nome = ?, biografia = ?, immagine = ? WHERE id = ?`;
  db.query(query, [nome, biografia, immagine, id], (err, results) => {
    if (err) return res.status(500).json({ errore: "Errore aggiornamento" });
    res.json({ messaggio: "Professionista aggiornato" });
  });
});

app.delete("/api/professionisti/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM professionista WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ errore: "Errore eliminazione" });
    res.json({ messaggio: "Professionista eliminato" });
  });
});

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
      if (err) return res.status(500).json({ errore: "Errore filmografia" });
      res.json({ ...professionista, filmografia: filmRes });
    });
  });
});

/* =========================
   GENERI & INTERFACCE PUBBLICHE
========================= */

app.get("/api/generi", (req, res) => {
  db.query("SELECT * FROM genere ORDER BY nome_genere ASC", (err, results) => {
    if (err) return res.status(500).json({ errore: "Errore recupero generi" });
    res.json(results);
  });
});

app.post("/api/generi", (req, res) => {
  const { nome_genere } = req.body;
  db.query("INSERT INTO genere (nome_genere) VALUES (?)", [nome_genere], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ errore: "Questo genere esiste già" });
      return res.status(500).json({ errore: "Errore inserimento" });
    }
    res.status(201).json({ messaggio: "Genere aggiunto", id: results.insertId });
  });
});

app.put("/api/generi/:id", (req, res) => {
  const { id } = req.params;
  const { nome_genere } = req.body;
  db.query("UPDATE genere SET nome_genere = ? WHERE id = ?", [nome_genere, id], (err) => {
    if (err) return res.status(500).json({ errore: "Errore modifica" });
    res.json({ messaggio: "Genere aggiornato" });
  });
});

app.delete("/api/generi/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM genere WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ errore: "Errore eliminazione" });
    res.json({ messaggio: "Genere eliminato" });
  });
});

app.get("/api/generi/dettaglio/:slug", (req, res) => {
  const { slug } = req.params;
  const generateSlug = (testo) => testo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  db.query("SELECT * FROM genere", (err, generi) => {
    if (err) return res.status(500).json({ errore: "Errore recupero generi" });

    const genere = generi.find(g => generateSlug(g.nome_genere) === slug);
    if (!genere) return res.status(404).json({ errore: "Genere non trovato" });

    const queryFilm = `
      SELECT o.id, o.titolo, o.poster, o.anno_uscita FROM appartiene a
      JOIN opera o ON a.id_opera = o.id WHERE a.id_genere = ? ORDER BY o.anno_uscita DESC
    `;
    db.query(queryFilm, [genere.id], (err, filmRes) => {
      if (err) return res.status(500).json({ errore: "Errore film" });
      res.json({ ...genere, opere: filmRes });
    });
  });
});

/* =========================
   RICERCA GLOBALE E SOCIAL
========================= */

app.get("/api/ricerca/:query", (req, res) => {
  const searchTerm = `%${req.params.query}%`;
  db.query("SELECT id, titolo, poster, anno_uscita FROM opera WHERE titolo LIKE ?", [searchTerm], (err, opereRes) => {
    if (err) return res.status(500).json({ errore: "Errore opere" });
    db.query("SELECT id, nome, immagine FROM professionista WHERE nome LIKE ?", [searchTerm], (err, profRes) => {
      if (err) return res.status(500).json({ errore: "Errore professionisti" });
      res.json({ opere: opereRes, professionisti: profRes });
    });
  });
});

app.get("/api/diario/:id_utente", (req, res) => {
  const { id_utente } = req.params;
  const query = `
    SELECT v.id_visione, v.data_visione, v.numero, o.id AS id_opera, o.titolo, o.poster 
    FROM visione v JOIN opera o ON v.id_opera = o.id WHERE v.id_utente = ? ORDER BY v.data_visione DESC
  `;
  db.query(query, [id_utente], (err, results) => {
    if (err) return res.status(500).json({ errore: "Errore diario" });
    res.json(results);
  });
});

app.post("/api/diario", (req, res) => {
  const { id_utente, id_opera, data_visione } = req.body;
  db.query(`INSERT INTO visione (id_utente, id_opera, data_visione) VALUES (?, ?, ?)`, [id_utente, id_opera, data_visione], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ errore: "Hai già loggato questo film in questa data." });
      return res.status(500).json({ errore: "Errore salvataggio" });
    }
    res.status(201).json({ messaggio: "Film aggiunto al diario!", id_visione: results.insertId });
  });
});

app.delete("/api/diario/:id_visione", (req, res) => {
  const { id_visione } = req.params;
  db.query("DELETE FROM visione WHERE id_visione = ?", [id_visione], (err) => {
    if (err) return res.status(500).json({ errore: "Errore rimozione" });
    res.json({ messaggio: "Visione rimossa dal diario" });
  });
});

/* =========================================================
   RECENSIONI FEED, DETTAGLIO E INSERIMENTO
========================================================= */

app.get("/api/opere/recensioni/:slug", (req, res) => {
  const { slug } = req.params;
  db.query("SELECT * FROM opera", (err, opere) => {
    if (err) return res.status(500).json({ errore: "Errore caricamento film" });

    const generateSlug = (titolo) => titolo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const opera = opere.find(o => generateSlug(o.titolo) === slug);
    if (!opera) return res.status(404).json({ errore: "Film non trovato" });

    const queryRecensioni = `
      SELECT r.id, r.testo, r.spoiler, r.data_creazione, u.username, v.valore_stelle,
      (SELECT COUNT(*) FROM like_azione WHERE id_target = r.id AND tipo_target = 'recensione') AS numero_like
      FROM recensione r JOIN utente u ON r.id_utente = u.id
      LEFT JOIN voto v ON r.id_utente = v.id_utente AND r.id_opera = v.id_opera
      WHERE r.id_opera = ? ORDER BY r.data_creazione DESC
    `;
    db.query(queryRecensioni, [opera.id], (err, recensioniData) => {
      if (err) return res.status(500).json({ errore: "Errore recupero recensioni" });
      res.json(recensioniData);
    });
  });
});

app.get("/api/recensioni/:id", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT r.id, r.testo, r.data_creazione, u.username, o.titolo, o.poster, o.anno_uscita, v.valore_stelle,
    (SELECT COUNT(*) FROM like_azione WHERE id_target = r.id AND tipo_target = 'recensione') AS numero_like
    FROM recensione r JOIN utente u ON r.id_utente = u.id JOIN opera o ON r.id_opera = o.id
    LEFT JOIN voto v ON r.id_utente = v.id_utente AND r.id_opera = v.id_opera WHERE r.id = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ errore: "Errore recupero recensione" });
    if (results.length === 0) return res.status(404).json({ errore: "Recensione non trovata" });
    res.json(results[0]);
  });
});

app.post("/api/opere/recensione/:slug", (req, res) => {
  const { slug } = req.params;
  const { testo, id_utente } = req.body;
  const utenteId = id_utente || 2;

  db.query("SELECT * FROM opera", (err, opere) => {
    if (err) return res.status(500).json({ errore: "Errore server" });

    const generateSlug = (titolo) => titolo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const opera = opere.find(o => generateSlug(o.titolo) === slug);
    if (!opera) return res.status(404).json({ errore: "Film non trovato" });

    db.query("INSERT INTO recensione (testo, id_opera, id_utente) VALUES (?, ?, ?)", [testo, opera.id, utenteId], (err, results) => {
      if (err) return res.status(500).json({ errore: "Errore salvataggio" });
      res.status(201).json({ messaggio: "Recensione salvata", id: results.insertId });
    });
  });
});

/* =========================================================
   GESTIONE RELAZIONI OPERE - PROFESSIONISTI (CAST & CREW)
========================================================= */

// 1. Recupera il regista e il cast correnti di una specifica opera per l'admin
app.get("/api/opere/:id/relazioni", (req, res) => {
  const { id } = req.params;
  const idOperaNum = parseInt(id, 10);

  const queryRegista = `SELECT id_professionista FROM lavora WHERE id_opera = ? AND ruolo_lavorativo = 'Regista'`;
  const queryCast = `
    SELECT p.id, p.nome, r.nome_personaggio 
    FROM recita r 
    JOIN professionista p ON r.id_professionista = p.id 
    WHERE r.id_opera = ?
  `;

  db.query(queryRegista, [idOperaNum], (err, registaRes) => {
    if (err) {
      console.error("Errore recupero regista:", err);
      return res.status(500).json({ errore: "Errore recupero regista" });
    }
    
    db.query(queryCast, [idOperaNum], (err, castRes) => {
      if (err) {
        console.error("Errore recupero cast:", err);
        return res.status(500).json({ errore: "Errore recupero cast" });
      }
      
      res.json({
        id_regista: registaRes.length > 0 ? registaRes[0].id_professionista : "",
        cast: castRes
      });
    });
  });
});

// 2. Salva o aggiorna il regista di un film (Tabella lavora)
app.post("/api/opere/:id/regista", (req, res) => {
  const { id } = req.params;
  const { id_professionista } = req.body;
  const idOperaNum = parseInt(id, 10);

  // Puliamo prima il vecchio regista per evitare duplicati
  db.query("DELETE FROM lavora WHERE id_opera = ? AND ruolo_lavorativo = 'Regista'", [idOperaNum], (err) => {
    if (err) return res.status(500).json({ errore: "Errore pulizia vecchia regia" });

    if (!id_professionista) return res.json({ messaggio: "Regista rimosso" });

    const query = "INSERT INTO lavora (id_opera, id_professionista, ruolo_lavorativo) VALUES (?, ?, 'Regista')";
    db.query(query, [idOperaNum, Number(id_professionista)], (errIns) => {
      if (errIns) return res.status(500).json({ errore: "Errore inserimento regista" });
      res.json({ messaggio: "Regista aggiornato con successo" });
    });
  });
});

// 3. Aggiunge un attore al cast del film (Tabella recita)
app.post("/api/opere/:id/cast", (req, res) => {
  const { id } = req.params;
  const { id_professionista, nome_personaggio } = req.body;
  const idOperaNum = parseInt(id, 10);

  const query = "INSERT INTO recita (id_opera, id_professionista, nome_personaggio) VALUES (?, ?, ?)";
  db.query(query, [idOperaNum, Number(id_professionista), nome_personaggio], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ errore: "Questo professionista fa già parte del cast di questo film" });
      }
      console.error(err);
      return res.status(500).json({ errore: "Errore inserimento cast" });
    }
    res.status(201).json({ messaggio: "Attore aggiunto al cast" });
  });
});

// 4. Rimuove un attore dal cast (Tabella recita)
app.delete("/api/opere/:id/cast/:id_professionista", (req, res) => {
  const { id, id_professionista } = req.params;
  const idOperaNum = parseInt(id, 10);
  const idProfNum = parseInt(id_professionista, 10);

  const query = "DELETE FROM recita WHERE id_opera = ? AND id_professionista = ?";
  db.query(query, [idOperaNum, idProfNum], (err) => {
    if (err) return res.status(500).json({ errore: "Errore rimozione dal cast" });
    res.json({ messaggio: "Professionista rimosso dal cast" });
  });
});

// 5. Modifica un attore e/o il suo personaggio nel cast (Tabella recita)
app.put("/api/opere/:id/cast", (req, res) => {
  const { id } = req.params;
  const { old_id_professionista, new_id_professionista, old_nome_personaggio, new_nome_personaggio } = req.body;
  const idOperaNum = parseInt(id, 10);

  const query = `
    UPDATE recita 
    SET id_professionista = ?, nome_personaggio = ? 
    WHERE id_opera = ? AND id_professionista = ? AND nome_personaggio = ?
  `;

  db.query(
    query, 
    [Number(new_id_professionista), new_nome_personaggio, idOperaNum, Number(old_id_professionista), old_nome_personaggio], 
    (err, results) => {
      if (err) {
        console.error("Errore modifica cast:", err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ errore: "Questa combinazione attore/personaggio esiste già per questo film" });
        }
        return res.status(500).json({ errore: "Errore durante la modifica del cast" });
      }
      res.json({ messaggio: "Cast aggiornato con successo" });
    }
  );
});

/* =========================
   AVVIO SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});