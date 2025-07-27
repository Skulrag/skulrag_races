import { useState } from "react";

export default function TrackScreen({ tracks }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  return (
    <div className="w-full h-full flex flex-col text-white font-mono overflow-hidden bg-[#000000]">
      {/* LE COEUR DE TA GRID: elle prend tout l’espace dispo, scrollable si besoin */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {tracks.length === 0 ? (
          <div className="flex flex-1 justify-center items-center">
            <span className="text-xl text-gray-400">Aucune track n’a été créée</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-start justify-start overflow-hidden">
            <div className="ml-8 mb-4 mt-2 text-white text-sm font-mono">Only shows my tracks</div>
            <div className="flex-1 w-full flex justify-center items-start">
              <div className="w-[85%] h-[70%] max-w-full max-h-full overflow-auto rounded-2xl border-2 border-black bg-black p-4">
                <div className="grid grid-cols-4 gap-6">
              {tracks.map((track, i) => (
                <div
                  key={track.id + '-' + i}
                  className="bg-[#23312c] p-4 rounded border border-green-200 flex flex-col h-36 justify-between"
                >
                  <div>
                    <div className="text-lg">{track.title}</div>
                    <div className="text-sm mt-2">Planned: {track.planned} times</div>
                    <div className="text-sm">{track.kms} Kms</div>
                  </div>
                  <button
                    className="bg-[#202122] text-white mt-2 px-4 py-1 self-end transition-transform duration-150 hover:scale-95"
                    onClick={() => {setShowModal(true);setSelectedTrack(track);}}
                  >
                    Race !
                  </button>
                </div>
              ))}
            </div>
          </div>
          </div>
          </div>
        )}
      </div>

      {/* Bas de page ("Wheel Scroll...") */}
      <div className="text-center mt-2 text-gray-400 flex-shrink-0">Wheel Scroll to go up/down</div>

      {/* MODAL */}
      {showModal && (
        <RaceModal track={selectedTrack} onClose={() => setShowModal(false)} />
      )}

    </div>
  );
}