import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppHeader from "./components/AppHeader.jsx";
import PseudoForm from "./components/PseudoForm.jsx";
import TrackScreen from "./components/TrackScreen.jsx";
import RacesScreen from "./components/RacesScreen.jsx";

export default function App() {
  const [pseudo, setPseudo] = useState(true);
// --- Utilisation : dummy data ---
const DEMO_TRACKS = [
  {id:1, title:"Title", planned:23, kms:11},
  {id:2, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},
  {id:1, title:"Title", planned:23, kms:11},
  {id:2, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},  
  {id:1, title:"Title", planned:23, kms:11},
  {id:2, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},  
  {id:1, title:"Title", planned:23, kms:11},
  {id:2, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},  
  {id:1, title:"Title", planned:23, kms:11},
  {id:2, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},  
  {id:1, title:"Title", planned:23, kms:11},
  {id:2, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},  
  {id:1, title:"Title", planned:23, kms:11},
  {id:2, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},
  {id:3, title:"Title", planned:23, kms:11},
  // ...
];

  useEffect(() => {
    // Vérifie le localStorage au chargement
    const saved = localStorage.getItem("pseudo");
    if (saved) setPseudo(saved);
  }, []);

  // Handler pour récupérer le pseudo de PseudoForm
  function handlePseudoSubmit(newPseudo) {
    setPseudo(newPseudo);
    localStorage.setItem("pseudo", newPseudo);
  }

return (
    <BrowserRouter>
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col w-[85vw] h-[85vh] max-h-[95vh] overflow-hidden">
          {!pseudo ? (
            <PseudoForm onSubmit={handlePseudoSubmit} />
          ) : (
            <div className="flex flex-col w-[85vw] h-[85vh] max-h-[95vh] overflow-hidden rounded-2xl shadow-xl">
              {/* Header sur toutes les pages sauf sur le PseudoForm */}
              <AppHeader />
              <div className="flex-1 overflow-hidden">
                <Routes>
                  <Route path="/tracks" element={<TrackScreen tracks={DEMO_TRACKS} />} />
                  <Route path="/tracks/new" element={<div>Nouveau Track !</div>} />
                  <Route path="/races" element={<RacesScreen />} />
                  <Route path="/" element={<Navigate to="/tracks" />} />
                  <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                  />
                  {/* ...autres routes */}
                </Routes>
              </div>
            </div>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}