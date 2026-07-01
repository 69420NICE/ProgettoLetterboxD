-- =====================================================
-- DATABASE LETTERBOXD-LIKE
-- Script di Inizializzazione (Struttura + Dati)
-- Aggiornato al Dump del 01-Luglio-2026
-- =====================================================

CREATE DATABASE IF NOT EXISTS letterboxd_clone
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE letterboxd_clone;

-- Disabilitiamo i controlli sulle chiavi esterne per poter fare i DROP e gli INSERT senza blocchi
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- PULIZIA TABELLE ESISTENTI (DROP)
-- =====================================================
DROP TABLE IF EXISTS appartiene;
DROP TABLE IF EXISTS lavora;
DROP TABLE IF EXISTS recita;
DROP TABLE IF EXISTS like_azione;
DROP TABLE IF EXISTS include_lista_opera;
DROP TABLE IF EXISTS watchlist;
DROP TABLE IF EXISTS visione;
DROP TABLE IF EXISTS voto;
DROP TABLE IF EXISTS follow;
DROP TABLE IF EXISTS segnalazione;
DROP TABLE IF EXISTS commento;
DROP TABLE IF EXISTS recensione;
DROP TABLE IF EXISTS lista;
DROP TABLE IF EXISTS genere;
DROP TABLE IF EXISTS professionista;
DROP TABLE IF EXISTS opera;
DROP TABLE IF EXISTS utente;

-- =====================================================
-- 1. CREAZIONE STRUTTURA (CREATE TABLES)
-- =====================================================

-- ENTITÀ: UTENTE
CREATE TABLE utente (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  ruolo VARCHAR(20) NOT NULL DEFAULT 'utente',
  data_iscrizione DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY username (username),
  UNIQUE KEY email (email),
  CONSTRAINT chk_utente_ruolo CHECK ((ruolo IN ('utente','amministratore','moderatore')))
) ENGINE=InnoDB;

-- ENTITÀ: OPERA
CREATE TABLE opera (
  id INT NOT NULL AUTO_INCREMENT,
  titolo VARCHAR(150) NOT NULL,
  trama TEXT,
  anno_uscita INT DEFAULT NULL,
  durata_minuti INT DEFAULT NULL,
  poster VARCHAR(255) DEFAULT NULL,
  tipo_opera VARCHAR(20) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_opera_titolo (titolo),
  KEY idx_opera_tipo (tipo_opera),
  CONSTRAINT chk_opera_tipo CHECK ((tipo_opera IN ('film','serie')))
) ENGINE=InnoDB;

-- ENTITÀ: PROFESSIONISTA
CREATE TABLE professionista (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  biografia TEXT,
  immagine VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ENTITÀ: GENERE
CREATE TABLE genere (
  id INT NOT NULL AUTO_INCREMENT,
  nome_genere VARCHAR(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY nome_genere (nome_genere)
) ENGINE=InnoDB;

-- ENTITÀ: LISTA
CREATE TABLE lista (
  id INT NOT NULL AUTO_INCREMENT,
  titolo VARCHAR(100) NOT NULL,
  descrizione TEXT,
  pubblica TINYINT(1) NOT NULL DEFAULT '1',
  data_pubblicazione DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_utente INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_lista_utente (id_utente),
  CONSTRAINT fk_lista_utente FOREIGN KEY (id_utente) REFERENCES utente (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ENTITÀ: RECENSIONE
CREATE TABLE recensione (
  id INT NOT NULL AUTO_INCREMENT,
  testo TEXT NOT NULL,
  spoiler TINYINT(1) NOT NULL DEFAULT '0',
  data_creazione DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_utente INT NOT NULL,
  id_opera INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_recensione_utente (id_utente),
  KEY idx_recensione_opera (id_opera),
  CONSTRAINT fk_recensione_opera FOREIGN KEY (id_opera) REFERENCES opera (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_recensione_utente FOREIGN KEY (id_utente) REFERENCES utente (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ENTITÀ: COMMENTO
CREATE TABLE commento (
  id INT NOT NULL AUTO_INCREMENT,
  testo TEXT NOT NULL,
  data_creazione DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_utente INT NOT NULL,
  id_opera INT DEFAULT NULL,
  id_recensione INT DEFAULT NULL,
  id_risposta_a INT DEFAULT NULL,
  PRIMARY KEY (id),
  KEY fk_commento_risposta (id_risposta_a),
  KEY idx_commento_utente (id_utente),
  KEY idx_commento_opera (id_opera),
  KEY idx_commento_recensione (id_recensione),
  CONSTRAINT fk_commento_opera FOREIGN KEY (id_opera) REFERENCES opera (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_commento_recensione FOREIGN KEY (id_recensione) REFERENCES recensione (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_commento_risposta FOREIGN KEY (id_risposta_a) REFERENCES commento (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_commento_utente FOREIGN KEY (id_utente) REFERENCES utente (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ENTITÀ: SEGNALAZIONE
CREATE TABLE segnalazione (
  id INT NOT NULL AUTO_INCREMENT,
  motivazione TEXT NOT NULL,
  stato VARCHAR(20) NOT NULL DEFAULT 'aperta',
  data_segnalazione DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_inviante INT NOT NULL,
  id_riguardo_utente INT DEFAULT NULL,
  id_riguardo_commento INT DEFAULT NULL,
  id_riguardo_recensione INT DEFAULT NULL,
  id_riguardo_lista INT DEFAULT NULL,
  id_riguardo_opera INT DEFAULT NULL,
  PRIMARY KEY (id),
  KEY fk_segnalazione_inviante (id_inviante),
  KEY fk_segnalazione_riguardo_utente (id_riguardo_utente),
  KEY fk_segnalazione_riguardo_commento (id_riguardo_commento),
  KEY fk_segnalazione_riguardo_recensione (id_riguardo_recensione),
  KEY fk_segnalazione_riguardo_lista (id_riguardo_lista),
  KEY fk_segnalazione_riguardo_opera (id_riguardo_opera),
  KEY idx_segnalazione_stato (stato),
  CONSTRAINT fk_segnalazione_inviante FOREIGN KEY (id_inviante) REFERENCES utente (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_segnalazione_riguardo_commento FOREIGN KEY (id_riguardo_commento) REFERENCES commento (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_segnalazione_riguardo_lista FOREIGN KEY (id_riguardo_lista) REFERENCES lista (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_segnalazione_riguardo_opera FOREIGN KEY (id_riguardo_opera) REFERENCES opera (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_segnalazione_riguardo_recensione FOREIGN KEY (id_riguardo_recensione) REFERENCES recensione (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_segnalazione_riguardo_utente FOREIGN KEY (id_riguardo_utente) REFERENCES utente (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_segnalazione_stato CHECK ((stato IN ('aperta','presa_in_carico','risolta','respinta')))
) ENGINE=InnoDB;

-- RELAZIONE: FOLLOW
CREATE TABLE follow (
  id_follower INT NOT NULL,
  id_seguito INT NOT NULL,
  data_follow DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_follower,id_seguito),
  KEY fk_follow_seguito (id_seguito),
  CONSTRAINT fk_follow_follower FOREIGN KEY (id_follower) REFERENCES utente (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_follow_seguito FOREIGN KEY (id_seguito) REFERENCES utente (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- RELAZIONE: VOTO
CREATE TABLE voto (
  id_utente INT NOT NULL,
  id_opera INT NOT NULL,
  valore_stelle DECIMAL(2,1) NOT NULL,
  data_voto DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_utente,id_opera),
  KEY fk_voto_opera (id_opera),
  CONSTRAINT fk_voto_opera FOREIGN KEY (id_opera) REFERENCES opera (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_voto_utente FOREIGN KEY (id_utente) REFERENCES utente (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_voto_valore CHECK (((valore_stelle >= 0.5) AND (valore_stelle <= 5.0)))
) ENGINE=InnoDB;

-- RELAZIONE: VISIONE / DIARIO
CREATE TABLE visione (
  id_visione INT NOT NULL AUTO_INCREMENT,
  id_utente INT NOT NULL,
  id_opera INT NOT NULL,
  data_visione DATE NOT NULL,
  numero INT NOT NULL DEFAULT '1',
  PRIMARY KEY (id_visione),
  UNIQUE KEY uq_visione_utente_opera_data (id_utente,id_opera,data_visione),
  KEY idx_visione_utente (id_utente),
  KEY idx_visione_opera (id_opera),
  CONSTRAINT fk_visione_opera FOREIGN KEY (id_opera) REFERENCES opera (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_visione_utente FOREIGN KEY (id_utente) REFERENCES utente (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_visione_numero CHECK ((numero >= 1))
) ENGINE=InnoDB;

-- RELAZIONE: WATCHLIST
CREATE TABLE watchlist (
  id_utente INT NOT NULL,
  id_opera INT NOT NULL,
  data_aggiunta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note TEXT,
  ordine INT DEFAULT NULL,
  PRIMARY KEY (id_utente,id_opera),
  KEY fk_watchlist_opera (id_opera),
  KEY idx_watchlist_utente (id_utente),
  CONSTRAINT fk_watchlist_opera FOREIGN KEY (id_opera) REFERENCES opera (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_watchlist_utente FOREIGN KEY (id_utente) REFERENCES utente (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- RELAZIONE: INCLUDE LISTA-OPERA
CREATE TABLE include_lista_opera (
  id_lista INT NOT NULL,
  id_opera INT NOT NULL,
  ordine_inserimento INT DEFAULT NULL,
  PRIMARY KEY (id_lista,id_opera),
  KEY fk_include_opera (id_opera),
  CONSTRAINT fk_include_lista FOREIGN KEY (id_lista) REFERENCES lista (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_include_opera FOREIGN KEY (id_opera) REFERENCES opera (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- RELAZIONE: LIKE AZIONE
CREATE TABLE like_azione (
  id_utente INT NOT NULL,
  id_target INT NOT NULL,
  tipo_target VARCHAR(20) NOT NULL,
  data_like DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_utente,id_target,tipo_target),
  CONSTRAINT fk_like_utente FOREIGN KEY (id_utente) REFERENCES utente (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_like_tipo_target CHECK ((tipo_target IN ('commento','recensione','lista')))
) ENGINE=InnoDB;

-- RELAZIONE: RECITA
CREATE TABLE recita (
  id_professionista INT NOT NULL,
  id_opera INT NOT NULL,
  nome_personaggio VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_professionista,id_opera,nome_personaggio),
  KEY fk_recita_opera (id_opera),
  CONSTRAINT fk_recita_opera FOREIGN KEY (id_opera) REFERENCES opera (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_recita_professionista FOREIGN KEY (id_professionista) REFERENCES professionista (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- RELAZIONE: LAVORA
CREATE TABLE lavora (
  id_professionista INT NOT NULL,
  id_opera INT NOT NULL,
  ruolo_lavorativo VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_professionista,id_opera,ruolo_lavorativo),
  KEY fk_lavora_opera (id_opera),
  CONSTRAINT fk_lavora_opera FOREIGN KEY (id_opera) REFERENCES opera (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_lavora_professionista FOREIGN KEY (id_professionista) REFERENCES professionista (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- RELAZIONE: APPARTIENE
CREATE TABLE appartiene (
  id_opera INT NOT NULL,
  id_genere INT NOT NULL,
  PRIMARY KEY (id_opera,id_genere),
  KEY fk_appartiene_genere (id_genere),
  CONSTRAINT fk_appartiene_genere FOREIGN KEY (id_genere) REFERENCES genere (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_appartiene_opera FOREIGN KEY (id_opera) REFERENCES opera (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


-- =====================================================
-- 2. POPOLAMENTO DATI (INSERT INTO)
-- =====================================================

-- -----------------------------------------
-- LIVELLO 1: Tabelle Padre (Nessuna dipendenza)
-- -----------------------------------------

INSERT INTO utente VALUES 
(1,'admin_user','admin@letterboxdclone.it','admin123','amministratore','2026-06-29 22:24:47'),
(2,'cinefilo_ita','cinefilo@email.it','password123','utente','2026-06-29 22:24:47'),
(3,'mod_giustiziere','mod@letterboxdclone.it','mod123','moderatore','2026-06-29 22:24:47'),
(4,'lela','sigmakidsinfo@gmail.com','$2b$10$LAp4ZaDXVdxdfDBz4OlBne5.PKSG.GWWQK52Ogc0ew.kkg2/9pIhG','utente','2026-06-30 10:04:28');

INSERT INTO genere VALUES 
(4,'Animazione'),(6,'Azione'),(3,'Commedia'),(5,'Crimine'),(2,'Drammatico'),(1,'Fantascienza');

INSERT INTO opera VALUES 
(1,'Poor Things','La fantastica evoluzione di Bella Baxter, una giovane donna riportata alla vita dal brillante scienziato Dr. Godwin Baxter.',2023,141,'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg','film'),
(2,'Past Lives','Nora e Hae Sung, due amici d\'infanzia, si separano quando la famiglia di Nora emigra. Si ritrovano anni dopo.',2023,106,'https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg','film'),
(3,'Oppenheimer','La storia del fisico J. Robert Oppenheimer e del suo ruolo nello sviluppo della bomba atomica.',2023,181,'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg','film'),
(4,'The Dark Knight','Batman affronta la sua più grande minaccia: il Joker.',2008,152,'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg','film'),
(5,'Spider-Man: Into the Spider-Verse','Il giovane Miles Morales scopre il multiverso e deve imparare cosa significa essere Spider-Man.',2018,117,'https://m.media-amazon.com/images/M/MV5BMjMwNDkxMTgzOF5BMl5BanBnXkFtZTgwNTkwNTQ3NjM@._V1_FMjpg_UX1000_.jpg','film'),
(6,'Il Padrino','Il patriarca di una dinastia della criminalità organizzata trasferisce il controllo del suo impero clandestino al figlio riluttante.',1972,175,'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX1000_.jpg','film');

INSERT INTO professionista VALUES 
(1,'Emma Stone','Attrice premio Oscar per Poor Things.','https://image.tmdb.org/t/p/w500/cZ8a3QvAnj2cgcgVL6g4XaqPzpL.jpg'),
(2,'Greta Lee','Attrice e scrittrice statunitense.','https://imgs.search.brave.com/N-z2fwju87_gcHpFSbbG7vPKRuqkWL_yx3TUpUvlhB0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzkyLzkw/LzMzLzkyOTAzM2Iz/YmEzYmRlNWEwOWMz/NjhkMDc1ZDc3MDkx/LmpwZw'),
(3,'Cillian Murphy','Attore irlandese, noto per Oppenheimer.','https://i.pinimg.com/1200x/ae/e0/c4/aee0c4da5c3b5b1409ec00e962ba2de4.jpg'),
(4,'Christian Bale','Celebre per il ruolo di Bruce Wayne.','https://i.pinimg.com/736x/87/a0/ad/87a0adbdbe5e0d591cadab50799f1008.jpg'),
(5,'Shameik Moore','Voce originale di Miles Morales.','https://i.pinimg.com/736x/89/69/57/8969573f6a9b6e1746bcc6caaf6b0c17.jpg'),
(6,'Marlon Brando','Leggenda indiscussa del cinema.','https://image.tmdb.org/t/p/w500/fuTEPMsBtV1zE98ujPONbKiYDc2.jpg'),
(7,'Christopher Nolan','Regista visionario e sceneggiatore.','https://image.tmdb.org/t/p/w500/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg'),
(8,'Yorgos Lanthimos','Regista greco, celebre per il suo stile surreale.','https://i.pinimg.com/736x/06/ae/67/06ae6724e95c4b05a93ee9adf80ba253.jpg'),
(9,'Celine Song','Regista e drammaturga sudcoreana-canadese.','https://i.pinimg.com/736x/c9/10/08/c910086c0f7cff4d28f3ab3802c92093.jpg'),
(10,'Bob Persichetti','Regista, sceneggiatore e animatore statunitense.','https://i.pinimg.com/236x/cd/cd/8d/cdcd8da9d663cf3231acae6c3402f243.jpg'),
(11,'Francis Ford Coppola','Uno dei più grandi registi della storia del cinema.','https://i.pinimg.com/736x/8e/f3/5e/8ef35e0d5ae5a9e385c505689bfa13ae.jpg'),
(12,'Adam Sandler','Attore, comico, produttore cinematografico e musicista statunitense','https://i.pinimg.com/736x/f5/26/26/f5262601e61a57a72985f24f2e9f8a4b.jpg');


-- -----------------------------------------
-- LIVELLO 2: Relazioni Primarie
-- -----------------------------------------

INSERT INTO appartiene VALUES 
(1,3), (2,2), (3,2), (4,6), (5,4), (6,5);

INSERT INTO recita VALUES 
(1,1,'Bella Baxter'), (2,2,'Nora'), (3,3,'J. Robert Oppenheimer'), 
(4,4,'Bruce Wayne / Batman'), (5,5,'Miles Morales'), (6,6,'Vito Corleone');

INSERT INTO lavora VALUES 
(7,3,'Regista'), (7,4,'Regista'), (8,1,'Regista'), 
(9,2,'Regista'), (10,5,'Regista'), (11,6,'Regista');

INSERT INTO lista VALUES 
(1,'I miei preferiti di Nolan','Raccolta dei capolavori diretti da Christopher Nolan.',1,'2026-06-29 22:24:47',1);

INSERT INTO recensione VALUES 
(1,'Un capolavoro assoluto. La performance di Heath Ledger è inarrivabile.',0,'2026-06-29 22:24:47',2,4);

INSERT INTO voto VALUES 
(2,3,4.5,'2026-06-29 22:24:47');

INSERT INTO visione VALUES 
(1,2,4,'2026-06-20',1);

INSERT INTO watchlist VALUES 
(2,6,'2026-06-29 22:24:47','Un classico che devo assolutamente recuperare!',1);

INSERT INTO follow VALUES 
(2,1,'2026-06-29 22:24:47');


-- -----------------------------------------
-- LIVELLO 3: Relazioni Secondarie e Interazioni
-- -----------------------------------------

INSERT INTO include_lista_opera VALUES 
(1,3,1), (1,4,2);

INSERT INTO commento VALUES 
(1,'Sono totalmente d''accordo. Il miglior cinecomic mai realizzato.','2026-06-29 22:24:47',1,NULL,1,NULL);

INSERT INTO like_azione VALUES 
(1,1,'recensione','2026-06-29 22:24:47');

INSERT INTO segnalazione VALUES 
(1,'Controllo spoiler richiesto da un altro utente.','presa_in_carico','2026-06-29 22:24:47',3,NULL,NULL,1,NULL,NULL);


-- =====================================================
-- RIPRISTINO CONTROLLI
-- =====================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- 1. COMPLETAMENTO DEI DATI GIÀ ESISTENTI NEL DUMP
-- ====================================================================

-- Nel dump l'utente 2 ha scritto la recensione per "The Dark Knight" (Opera 4) ma non l'aveva votato.
-- Aggiungiamo il voto (5 stelle) a quell'opera per lo stesso utente.
INSERT INTO `voto` (`id_utente`, `id_opera`, `valore_stelle`) 
VALUES (2, 4, 5.0);

-- Nel dump l'utente 2 ha dato 4.5 stelle a "Oppenheimer" (Opera 3) ma non aveva scritto la recensione.
-- Inseriamo la recensione testuale corrispondente (assumerà l'ID automatico 2).
INSERT INTO `recensione` (`testo`, `spoiler`, `id_utente`, `id_opera`) 
VALUES ('Un\'opera mastodontica. Regia, sonoro e recitazione ai massimi livelli cinematografici.', 0, 2, 3);


-- ====================================================================
-- 2. INSERIMENTO NUOVE RECENSIONI + VOTI ACCOPPIATI PER GLI ALTRI FILM
-- ====================================================================

-- FILM 1: Poor Things (Recensione ID 3)
-- Recensione e voto da parte di cinefilo_ita (Utente 2)
INSERT INTO `recensione` (`testo`, `spoiler`, `id_utente`, `id_opera`) 
VALUES ('Visivamente straordinario, grottesco e profondo. Emma Stone regala una performance da pietra miliare.', 0, 2, 1);
INSERT INTO `voto` (`id_utente`, `id_opera`, `valore_stelle`) 
VALUES (2, 1, 4.5);

-- FILM 2: Past Lives (Recensione ID 4)
-- Recensione e voto da parte del moderatore (Utente 3)
INSERT INTO `recensione` (`testo`, `spoiler`, `id_utente`, `id_opera`) 
VALUES ('Una storia d\'amore delicata, malinconica, matura e incredibilmente reale. Mi ha spezzato il cuore.', 0, 3, 2);
INSERT INTO `voto` (`id_utente`, `id_opera`, `valore_stelle`) 
VALUES (3, 2, 5.0);

-- FILM 5: Spider-Man: Into the Spider-Verse (Recensione ID 5)
-- Recensione e voto da parte di lela (Utente 4)
INSERT INTO `recensione` (`testo`, `spoiler`, `id_utente`, `id_opera`) 
VALUES ('Il miglior film su Spider-Man mai realizzato. Uno stile di animazione rivoluzionario e una colonna sonora pazzesca.', 0, 4, 5);
INSERT INTO `voto` (`id_utente`, `id_opera`, `valore_stelle`) 
VALUES (4, 5, 4.5);

-- FILM 6: Il Padrino (Recensione ID 6)
-- Recensione e voto da parte di cinefilo_ita (Utente 2)
INSERT INTO `recensione` (`testo`, `spoiler`, `id_utente`, `id_opera`) 
VALUES ('Un pilastro intramontabile della storia del cinema. Sceneggiatura, ritmo e interpretazioni perfette sotto ogni aspetto.', 0, 2, 6);
INSERT INTO `voto` (`id_utente`, `id_opera`, `valore_stelle`) 
VALUES (2, 6, 5.0);


-- ====================================================================
-- 3. ABBINAMENTO DEI LIKE PER TESTARE I CONTATORI
-- ====================================================================
-- Nota: Nel dump la Recensione ID 1 ha già 1 like dall'utente 1.
-- Aggiungiamo più like incrociati alle varie recensioni (ID da 1 a 6).

-- Più Like alla Recensione ID 1 (The Dark Knight - Utente 2) -> Totale: 3 Like
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (3, 1, 'recensione');
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (4, 1, 'recensione');

-- Like alla Recensione ID 2 (Oppenheimer - Utente 2) -> Totale: 3 Like
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (1, 2, 'recensione');
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (3, 2, 'recensione');
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (4, 2, 'recensione');

-- Like alla Recensione ID 3 (Poor Things - Utente 2) -> Totale: 2 Like
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (1, 3, 'recensione');
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (4, 3, 'recensione');

-- Like alla Recensione ID 4 (Past Lives - Utente 3) -> Totale: 2 Like
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (2, 4, 'recensione');
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (4, 4, 'recensione');

-- Like alla Recensione ID 5 (Spider-Man - Utente 4) -> Totale: 3 Like
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (1, 5, 'recensione');
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (2, 5, 'recensione');
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (3, 5, 'recensione');

-- Like alla Recensione ID 6 (Il Padrino - Utente 2) -> Totale: 2 Like
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (1, 6, 'recensione');
INSERT INTO `like_azione` (`id_utente`, `id_target`, `tipo_target`) VALUES (3, 6, 'recensione');

UPDATE utente 
SET ruolo = 'amministratore' 
WHERE username = 'lela';