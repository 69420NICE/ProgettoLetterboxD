import { Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import Catalogo from "./Catalogo";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/catalogo" element={<Catalogo />} />
    </Routes>
  );
}

export default App;