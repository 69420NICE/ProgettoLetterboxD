import { Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard";
import Catalogo from "./catalogo";
import Diario from "./Diario";
import FilmPage from "./FilmPage";
import ProfessionistaPage from "./ProfessionistaPage";
import GenerePage from "./GenerePage";
import RicercaPage from "./RicercaPage";
import AdminOperePage from "./AdminOperePage";
import AdminProfessionistiPage from "./AdminProfessionistiPage";
import RecensionePage from "./RecensionePage"; // Inserisci questo import
import AdminDashboardPage from "./AdminDashboardPage";
import AdminGeneriPage from "./AdminGeneriPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/diario" element={<Diario />} />
      <Route path="/genere/:slug" element={<GenerePage />} />
      <Route path="/ricerca/:query" element={<RicercaPage />} />
      <Route path="/attore/:slug" element={<ProfessionistaPage />} />

      {/* Rotta dinamica per la singola recensione */}
      <Route path="/recensione/:id" element={<RecensionePage />} />

      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/opere" element={<AdminOperePage />} />
      <Route path="/admin/professionisti" element={<AdminProfessionistiPage />} />
      <Route path="/admin/generi" element={<AdminGeneriPage />} />

      {/* Catch-all per i film (Sempre in fondo) */}
      <Route path="/:slug" element={<FilmPage />} />
    </Routes>
  );
}

export default App;