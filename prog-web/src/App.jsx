import { Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard"; 
import Catalogo from "./Catalogo";
import Diario from "./Diario"; // <-- 1. IMPORTA IL DIARIO QUI
import FilmPage from "./FilmPage";
import ProfessionistaPage from "./ProfessionistaPage";
import GenerePage from "./GenerePage";
import RicercaPage from "./RicercaPage";
import AdminOperePage from "./AdminOperePage";
import AdminProfessionistiPage from "./AdminProfessionistiPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/catalogo" element={<Catalogo />} />
      
      {/* 2. AGGIUNGI LA ROTTA DEL DIARIO QUI */}
      <Route path="/diario" element={<Diario />} />
      
      {/* Rotta per i generi */}
      <Route path="/genere/:slug" element={<GenerePage />} />

      {/* Rotta per i risultati di ricerca */}
      <Route path="/ricerca/:query" element={<RicercaPage />} />
      
      {/* Rotta specifica per il cast */}
      <Route path="/attore/:slug" element={<ProfessionistaPage />} />

      <Route path="/admin/opere" element={<AdminOperePage />} />
      <Route path="/admin/professionisti" element={<AdminProfessionistiPage />} />
      
      {/* CATCH-ALL per i film (deve stare SEMPRE alla fine) */}
      <Route path="/:slug" element={<FilmPage />} />
    </Routes>
  );
}

export default App;