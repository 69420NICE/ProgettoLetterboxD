import { Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import Catalogo from "./Catalogo";
import FilmPage from "./FilmPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/catalogo" element={<Catalogo />} />
      {/* Route dinamica: :slug cattura qualsiasi stringa dopo la barra (se non è /catalogo) */}
      <Route path="/:slug" element={<FilmPage />} />
    </Routes>
  );
}

export default App;