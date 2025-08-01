import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import RaceModal from "./RaceModal.jsx";
import { fetchNui } from "../utils/fetchNui.js";

export default function TrackScreen() {
  const [showModal, setShowModal] = useState(false);
  const [delayedLoading, setDelayedLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [trackToDelete, setTrackToDelete] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();



  function fetchTracks() {
    setLoading(true);
    fetchNui('__sk_races:getTracks')
      .then((tracks) => setTracks(tracks))
      .finally(() => setLoading(false));
  }
  useEffect(() => { fetchTracks(); }, []);

  async function onDelete(track) {
    await fetchNui('__sk_races:deleteTrack', { track });
    fetchTracks(); // Pour garder la vérité du serveur
    setTrackToDelete(null);
  }

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setDelayedLoading(true), 200);
    } else {
      setDelayedLoading(false);
      clearTimeout(timer);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  if (delayedLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <span className="animate-spin inline-block h-12 w-12 border-4 border-[#53756E] rounded-full border-t-transparent"></span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col text-white font-mono overflow-hidden bg-[#000000]">
      <div className="flex-1 flex flex-col overflow-hidden">
        {tracks.length === 0 ? (
          <div className="flex flex-1 justify-center items-center">
            <span className="text-xl text-gray-400">{t("trackScreen.noTrack")}</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-start justify-start overflow-hidden">
            <div className="ml-8 mb-4 mt-2 text-white text-sm font-mono">{t("trackScreen.onlyMine")}</div>
            <div className="flex-1 w-full flex justify-center items-start">
              <div className="w-[85%] h-[70%] max-w-full max-h-full overflow-auto rounded-2xl border-2 border-black bg-black p-4">
                <div className="grid grid-cols-4 gap-6">
                  {tracks.map((track, i) => (
                    <div
                      key={track.id + '-' + i}
                      className="bg-[#23312c] p-4 border border-[#3BE696] flex flex-col h-36 justify-between relative" // Ajoute 'relative'
                    >
                      {/* Badge ID en haut à droite */}
                      <span className="absolute top-2 right-3 text-xs text-[#3BE696] bg-black/80 px-2 py-1 font-bold">
                        {t("trackScreen.trackId", { id: track.id })}
                      </span>
                      <div>
                        <div className="text-lg">{track.name}</div>
                        <div className="text-sm mt-2">
                          {t("trackScreen.plannedTimes", { count: track.planned })}
                        </div>
                        <div className="text-sm">
                          {t("trackScreen.kms", { count: (track.distance / 1000).toFixed(3) })}
                        </div>
                      </div>

                      {/* Bottom bar */}
                      <div className="flex items-end justify-between mt-2">
                        {/* Bouton corbeille en bas à gauche */}
                        <button
                          className="p-1 bg-transparent transition transition-transform duration-150 hover:scale-95"
                          title={t("trackScreen.delete")}
                          onClick={() => setTrackToDelete(track)}
                          type="button"
                        >
                          <svg
                            className="w-5 h-5 text-[#840D0D] hover:text-[#F61E1E]"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V4h6v3M10 11v6m4-6v6M4 7h16l-1.5 14h-13L4 7z" />
                          </svg>
                        </button>

                        {/* Bouton Race aligné à droite */}
                        <button
                          className="bg-[#202122] text-white px-4 py-1 transition-transform duration-150 hover:scale-95"
                          onClick={() => { setShowModal(true); setSelectedTrack(track); }}
                        >
                          {t("trackScreen.raceButton")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bas de page */}
      <div className="text-center mt-2 text-gray-400 flex-shrink-0">{t("trackScreen.wheelScroll")}</div>

      {/* MODAL */}
      {showModal && (
        <RaceModal track={selectedTrack} onClose={() => setShowModal(false)} />
      )}

      {trackToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-black border-25 border-[#344D42] shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
            <div className="mb-4 text-center text-white font-semibold">
              {t("trackScreen.confirmDeleteTitle", { title: trackToDelete.name })}
            </div>
            <div className="flex gap-4 mt-4">
              <button
                className="px-4 py-1 text-white transition-transform duration-150 hover:scale-95"
                onClick={() => setTrackToDelete(null)}
              >
                {t("trackScreen.cancel")}
              </button>
              <button
                className="px-4 py-1 bg-[#840D0D] text-white transition-transform duration-150 hover:scale-95"
                onClick={() => {
                  onDelete(trackToDelete);
                  setTrackToDelete(null);
                }}
              >
                {t("trackScreen.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
