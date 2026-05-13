const path = require("path");
const mysql = require("mysql2");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "letterbox.env");

const result = dotenv.config({ path: envPath });

console.log("Percorso env:", envPath);

if (result.error) {
  console.error("Errore caricamento env:", result.error);
} else {
  console.log("Variabili caricate:", result.parsed);
}

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASSWORD presente:", process.env.DB_PASSWORD ? "SI" : "NO");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

db.connect((err) => {
  if (err) {
    console.error("Errore connessione MySQL:", err.message);
    return;
  }

  console.log("Database MySQL collegato correttamente");
});

module.exports = db;