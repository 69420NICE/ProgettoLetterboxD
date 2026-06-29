import { Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import Catalogo from "./Catalogo";
import FilmPage from "./FilmPage";
import ProfessionistaPage from "./ProfessionistaPage"; // <-- Importa il componente
import GenerePage from "./GenerePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/catalogo" element={<Catalogo />} />
      
      {/* Rotta specifica per il cast */}
      <Route path="/attore/:slug" element={<ProfessionistaPage />} />

      <Route path="/genere/:slug" element={<GenerePage />} />
      
      {/* Questa rotta dinamica globale ("Catch-all") deve stare sempre alla fine */}
      <Route path="/:slug" element={<FilmPage />} />

    </Routes>
  );
}

export default App;