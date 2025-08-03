import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppHeader from "./components/AppHeader.jsx";
import PseudoForm from "./components/PseudoForm.jsx";
import TrackScreen from "./components/TrackScreen.jsx";
import RacesScreen from "./components/RacesScreen.jsx";
import HelpScreen from "./components/HelpScreen.jsx";
import CreateTrack from './components/CreateTrack.jsx';
import { fetchNui } from "./utils/fetchNui.js";
import RaceHistory from "./components/RaceHistory.jsx";

export default function App() {
  const [pseudo, setPseudo] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchNui('__sk_races:getPseudo').then(({ pseudo }) => {
      setPseudo(pseudo);
      setLoading(false);
    }
    );
  }, []);

  // Handler pour récupérer le pseudo de PseudoForm
  const handlePseudoSubmit = async (formData) => {
    return await fetchNui('__sk_races:postPseudoForm', {
      pseudo: formData?.get('pseudo'),
      pin: formData?.get('pin')
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        {/* Loader stylé, ici un simple spinner */}
        <span className="animate-spin inline-block h-12 w-12 border-4 border-[#53756E] rounded-full border-t-transparent"></span>
      </div>
    );
  }
  return (
    <BrowserRouter>
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col w-[85vw] h-[85vh] max-h-[95vh] overflow-hidden">
          {!pseudo ? (
            <PseudoForm onSubmit={handlePseudoSubmit} setPseudo={setPseudo} />
          ) : (
            <div className="flex flex-col w-[85vw] h-[85vh] max-h-[95vh] overflow-hidden rounded-2xl shadow-xl">
              {/* Header sur toutes les pages sauf sur le PseudoForm */}
              <AppHeader />
              <div className="flex-1 overflow-hidden">
                <Routes>
                  <Route path="/tracks" element={<TrackScreen />} />
                  <Route path="/tracks/new" element={<CreateTrack />} />
                  <Route path="/races" element={<RacesScreen />} />
                  <Route path="/help" element={<HelpScreen />} />
                  <Route path="/history" element={<RaceHistory />} />
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