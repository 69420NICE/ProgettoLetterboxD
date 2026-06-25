-- =====================================================
-- DATABASE LETTERBOXD-LIKE
-- Capitolo 4 - Modello informativo
-- Compatibile con MySQL Workbench
-- =====================================================

CREATE DATABASE IF NOT EXISTS letterboxd_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE letterboxd_db;

SET FOREIGN_KEY_CHECKS = 0;

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

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- ENTITÀ: UTENTE
-- =====================================================

CREATE TABLE utente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    ruolo VARCHAR(20) NOT NULL DEFAULT 'utente',
    data_iscrizione DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_utente_ruolo
        CHECK (ruolo IN ('utente', 'amministratore', 'moderatore'))
) ENGINE = InnoDB;

-- =====================================================
-- ENTITÀ: OPERA
-- =====================================================

CREATE TABLE opera (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titolo VARCHAR(150) NOT NULL,
    trama TEXT,
    anno_uscita INT,
    durata_minuti INT,
    poster VARCHAR(255),
    tipo_opera VARCHAR(20) NOT NULL,

    CONSTRAINT chk_opera_tipo
        CHECK (tipo_opera IN ('film', 'serie'))
) ENGINE = InnoDB;

-- =====================================================
-- ENTITÀ: PROFESSIONISTA
-- =====================================================

CREATE TABLE professionista (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    biografia TEXT,
    immagine VARCHAR(255)
) ENGINE = InnoDB;

-- =====================================================
-- ENTITÀ: GENERE
-- =====================================================

CREATE TABLE genere (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_genere VARCHAR(50) NOT NULL UNIQUE
) ENGINE = InnoDB;

-- =====================================================
-- ENTITÀ: LISTA
-- =====================================================

CREATE TABLE lista (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titolo VARCHAR(100) NOT NULL,
    descrizione TEXT,
    pubblica BOOLEAN NOT NULL DEFAULT TRUE,
    data_pubblicazione DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_utente INT NOT NULL,

    CONSTRAINT fk_lista_utente
        FOREIGN KEY (id_utente)
        REFERENCES utente(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- ENTITÀ: RECENSIONE
-- =====================================================

CREATE TABLE recensione (
    id INT AUTO_INCREMENT PRIMARY KEY,
    testo TEXT NOT NULL,
    spoiler BOOLEAN NOT NULL DEFAULT FALSE,
    data_creazione DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_utente INT NOT NULL,
    id_opera INT NOT NULL,

    CONSTRAINT fk_recensione_utente
        FOREIGN KEY (id_utente)
        REFERENCES utente(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_recensione_opera
        FOREIGN KEY (id_opera)
        REFERENCES opera(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- ENTITÀ: COMMENTO
-- Può riferirsi a un'opera, a una recensione
-- oppure essere risposta a un altro commento.
-- =====================================================

CREATE TABLE commento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    testo TEXT NOT NULL,
    data_creazione DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_utente INT NOT NULL,
    id_opera INT NULL,
    id_recensione INT NULL,
    id_risposta_a INT NULL,

    CONSTRAINT fk_commento_utente
        FOREIGN KEY (id_utente)
        REFERENCES utente(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_commento_opera
        FOREIGN KEY (id_opera)
        REFERENCES opera(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_commento_recensione
        FOREIGN KEY (id_recensione)
        REFERENCES recensione(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_commento_risposta
        FOREIGN KEY (id_risposta_a)
        REFERENCES commento(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- ENTITÀ: SEGNALAZIONE
-- Una segnalazione può riguardare un solo target:
-- utente, commento, recensione, lista oppure opera.
-- =====================================================

CREATE TABLE segnalazione (
    id INT AUTO_INCREMENT PRIMARY KEY,
    motivazione TEXT NOT NULL,
    stato VARCHAR(20) NOT NULL DEFAULT 'aperta',
    data_segnalazione DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    id_inviante INT NOT NULL,
    id_riguardo_utente INT NULL,
    id_riguardo_commento INT NULL,
    id_riguardo_recensione INT NULL,
    id_riguardo_lista INT NULL,
    id_riguardo_opera INT NULL,

    CONSTRAINT chk_segnalazione_stato
        CHECK (stato IN ('aperta', 'presa_in_carico', 'risolta', 'respinta')),

    CONSTRAINT fk_segnalazione_inviante
        FOREIGN KEY (id_inviante)
        REFERENCES utente(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_segnalazione_riguardo_utente
        FOREIGN KEY (id_riguardo_utente)
        REFERENCES utente(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_segnalazione_riguardo_commento
        FOREIGN KEY (id_riguardo_commento)
        REFERENCES commento(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_segnalazione_riguardo_recensione
        FOREIGN KEY (id_riguardo_recensione)
        REFERENCES recensione(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_segnalazione_riguardo_lista
        FOREIGN KEY (id_riguardo_lista)
        REFERENCES lista(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_segnalazione_riguardo_opera
        FOREIGN KEY (id_riguardo_opera)
        REFERENCES opera(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- RELAZIONE: FOLLOW
-- Utente segue Utente
-- =====================================================

CREATE TABLE follow (
    id_follower INT NOT NULL,
    id_seguito INT NOT NULL,
    data_follow DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_follower, id_seguito),

    CONSTRAINT fk_follow_follower
        FOREIGN KEY (id_follower)
        REFERENCES utente(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_follow_seguito
        FOREIGN KEY (id_seguito)
        REFERENCES utente(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- RELAZIONE: VOTO
-- Utente assegna un voto a un'opera
-- =====================================================

CREATE TABLE voto (
    id_utente INT NOT NULL,
    id_opera INT NOT NULL,
    valore_stelle DECIMAL(2,1) NOT NULL,
    data_voto DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_utente, id_opera),

    CONSTRAINT fk_voto_utente
        FOREIGN KEY (id_utente)
        REFERENCES utente(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_voto_opera
        FOREIGN KEY (id_opera)
        REFERENCES opera(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_voto_valore
        CHECK (valore_stelle >= 0.5 AND valore_stelle <= 5.0)
) ENGINE = InnoDB;

-- =====================================================
-- RELAZIONE: VISIONE / DIARIO
-- Tiene traccia delle opere viste dagli utenti
-- =====================================================

CREATE TABLE visione (
    id_visione INT AUTO_INCREMENT PRIMARY KEY,
    id_utente INT NOT NULL,
    id_opera INT NOT NULL,
    data_visione DATE NOT NULL,
    numero INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_visione_utente
        FOREIGN KEY (id_utente)
        REFERENCES utente(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_visione_opera
        FOREIGN KEY (id_opera)
        REFERENCES opera(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_visione_numero
        CHECK (numero >= 1),

    CONSTRAINT uq_visione_utente_opera_data
        UNIQUE (id_utente, id_opera, data_visione)
) ENGINE = InnoDB;

-- =====================================================
-- RELAZIONE: WATCHLIST
-- Opere salvate dall'utente per una visione futura
-- =====================================================

CREATE TABLE watchlist (
    id_utente INT NOT NULL,
    id_opera INT NOT NULL,
    data_aggiunta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    ordine INT,

    PRIMARY KEY (id_utente, id_opera),

    CONSTRAINT fk_watchlist_utente
        FOREIGN KEY (id_utente)
        REFERENCES utente(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_watchlist_opera
        FOREIGN KEY (id_opera)
        REFERENCES opera(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- RELAZIONE: INCLUDE
-- Associazione tra lista e opera
-- Ho chiamato la tabella include_lista_opera
-- per evitare ambiguità con parole riservate/funzioni.
-- =====================================================

CREATE TABLE include_lista_opera (
    id_lista INT NOT NULL,
    id_opera INT NOT NULL,
    ordine_inserimento INT,

    PRIMARY KEY (id_lista, id_opera),

    CONSTRAINT fk_include_lista
        FOREIGN KEY (id_lista)
        REFERENCES lista(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_include_opera
        FOREIGN KEY (id_opera)
        REFERENCES opera(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- RELAZIONE: LIKE_AZIONE
-- Gestisce i mi piace su commenti, recensioni o liste.
-- Uso id_target + tipo_target perché in SQL una FK
-- non può puntare dinamicamente a più tabelle diverse.
-- =====================================================

CREATE TABLE like_azione (
    id_utente INT NOT NULL,
    id_target INT NOT NULL,
    tipo_target VARCHAR(20) NOT NULL,
    data_like DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_utente, id_target, tipo_target),

    CONSTRAINT fk_like_utente
        FOREIGN KEY (id_utente)
        REFERENCES utente(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_like_tipo_target
        CHECK (tipo_target IN ('commento', 'recensione', 'lista'))
) ENGINE = InnoDB;

-- =====================================================
-- RELAZIONE: RECITA
-- Associazione tra professionisti e opere per ruoli attoriali
-- =====================================================

CREATE TABLE recita (
    id_professionista INT NOT NULL,
    id_opera INT NOT NULL,
    nome_personaggio VARCHAR(100) NOT NULL,

    PRIMARY KEY (id_professionista, id_opera, nome_personaggio),

    CONSTRAINT fk_recita_professionista
        FOREIGN KEY (id_professionista)
        REFERENCES professionista(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_recita_opera
        FOREIGN KEY (id_opera)
        REFERENCES opera(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- RELAZIONE: LAVORA
-- Associazione tra professionisti e opere per ruoli non attoriali
-- =====================================================

CREATE TABLE lavora (
    id_professionista INT NOT NULL,
    id_opera INT NOT NULL,
    ruolo_lavorativo VARCHAR(50) NOT NULL,

    PRIMARY KEY (id_professionista, id_opera, ruolo_lavorativo),

    CONSTRAINT fk_lavora_professionista
        FOREIGN KEY (id_professionista)
        REFERENCES professionista(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_lavora_opera
        FOREIGN KEY (id_opera)
        REFERENCES opera(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- RELAZIONE: APPARTIENE
-- Associazione tra opera e genere
-- =====================================================

CREATE TABLE appartiene (
    id_opera INT NOT NULL,
    id_genere INT NOT NULL,

    PRIMARY KEY (id_opera, id_genere),

    CONSTRAINT fk_appartiene_opera
        FOREIGN KEY (id_opera)
        REFERENCES opera(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_appartiene_genere
        FOREIGN KEY (id_genere)
        REFERENCES genere(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;

-- =====================================================
-- INDICI UTILI
-- =====================================================

CREATE INDEX idx_opera_titolo ON opera(titolo);
CREATE INDEX idx_opera_tipo ON opera(tipo_opera);
CREATE INDEX idx_lista_utente ON lista(id_utente);
CREATE INDEX idx_recensione_utente ON recensione(id_utente);
CREATE INDEX idx_recensione_opera ON recensione(id_opera);
CREATE INDEX idx_commento_utente ON commento(id_utente);
CREATE INDEX idx_commento_opera ON commento(id_opera);
CREATE INDEX idx_commento_recensione ON commento(id_recensione);
CREATE INDEX idx_visione_utente ON visione(id_utente);
CREATE INDEX idx_visione_opera ON visione(id_opera);
CREATE INDEX idx_watchlist_utente ON watchlist(id_utente);
CREATE INDEX idx_segnalazione_stato ON segnalazione(stato);
