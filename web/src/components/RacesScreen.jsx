import { useState } from "react";

// Dummy data exemple
const DEMO_RACES = [
  {
    id: 1,
    isOnline: true,
    entriesLeft: 3,
    firstPrize: 50000,
    isRegistered: false,
  },
  {
    id: 2,
    isOnline: true,
    entriesLeft: 8,
    firstPrize: 500000,
    isRegistered: false,
  },
  // Une course terminée
  {
    id: 3,
    isOnline: false,
    endedBy: "Carry Mart",
    winner: "pseudoGagnant",
    firstPrize: 50000,
    participants: [
      { pseudo: "John Doe", cashprize: 25000 },
      { pseudo: "John Die", cashprize: 12500 },
      { pseudo: "John Dae", cashprize: 500 },
    ],
    isRegistered: true,
  },
    {
    id: 4,
    isOnline: true,
    entriesLeft: 3,
    firstPrize: 50000,
    isRegistered: false,
  },
  {
    id: 5,
    isOnline: true,
    entriesLeft: 8,
    firstPrize: 500000,
    isRegistered: false,
  },
  // Une course terminée
  {
    id: 6,
    isOnline: false,
    endedBy: "Carry Mart",
    winner: "pseudoGagnant",
    firstPrize: 50000,
    participants: [
      { pseudo: "John Doe", cashprize: 25000 },
      { pseudo: "John Die", cashprize: 12500 },
      { pseudo: "John Dae", cashprize: 500 },
    ],
    isRegistered: true,
  },
];

function MarqueeParticipants({ participants }) {
  // Texte défilant façon "marquee" (infini, horizontal)
  const text = participants
    .map((p) => `${p.pseudo} : ${p.cashprize}  $ ;`)
    .join(" ");
  return (
    <div className="overflow-hidden whitespace-nowrap w-full">
      <div
        className="inline-block animate-marquee"
        style={{ minWidth: "100%" }}
      >
        {text}
      </div>
    </div>
  );
}

// Animation Tailwind à ajouter dans ton tailwind.config.js
// 'marquee': {
//   '0%': { transform: 'translateX(0%)' },
//   '100%': { transform: 'translateX(-100%)' },
// },
// .animate-marquee { animation: marquee 10s linear infinite; }

export default function RacesScreen() {
  // States switch des filtres
  const [filters, setFilters] = useState({
    initiated: true,
    participated: false,
    ready: true,
    ended: true,
  });

  // Fonction de toggle pour chaque switch
  const toggle = (k) =>
    setFilters((f) => ({ ...f, [k]: !f[k] }));

  // Logique de navigation (à remplacer par react-router... ici, simple : alerte)
  const goToTracks = () => alert("Go to tracks!");
  const goToRaces = () => alert("Déjà ici!");

  // Dummy handle pour les boutons "register/cancel"
  const handleRegister = (raceId) => alert("Registering for " + raceId);
  const handleCancel = (raceId) => alert("Cancelling for " + raceId);

  return (
    <div className="w-full h-full flex flex-col bg-black text-white font-mono overflow-hidden">
      {/* FILTRES */}
      <div className="flex space-x-8 mb-6 mt-4 px-8">
        <SwitchBtn
          checked={filters.initiated}
          onClick={() => toggle("initiated")}
          text="Only show races I initiated"
        />
        <SwitchBtn
          checked={filters.participated}
          onClick={() => toggle("participated")}
          text="Only show races I participated"
        />
        <SwitchBtn
          checked={filters.ready}
          onClick={() => toggle("ready")}
          text="Only show ready races"
        />
        <SwitchBtn
          checked={filters.ended}
          onClick={() => toggle("ended")}
          text="Only show ended races"
        />
      </div>

      {/* LISTE DES COURSES */}
      <div className="flex-1 flex justify-center items-center overflow-hidden">
        <div className="w-[70%] h-[70%] max-w-full max-h-full overflow-auto flex flex-col gap-6">
          {DEMO_RACES.map((race) =>
            race.isOnline ? (
              <div
                key={race.id}
                className="bg-[#23312c] border border-green-200 p-4 flex flex-col min-h-[120px] justify-between"
              >
                <div className="flex">
                  {/* Colonne gauche */}
                  <div className="flex-1">
                    <div className="text-base mb-2 text-white">Race’s Online !</div>
                    <div className="mt-8 text-base">Entries left : {race.entriesLeft}</div>
                  </div>
                  {/* Milieu centré */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-lg text-white text-center">
                      1st place cashprize :<br />
                      <span className="text-2xl font-bold tracking-wide">
                        {race.firstPrize.toLocaleString()}  $ 
                      </span>
                    </div>
                  </div>
                  {/* Bouton droite */}
                  <div className="flex-1 flex items-end justify-end">
                    {!race.isRegistered ? (
                      <button
                        className="bg-[#202122] text-white px-6 py-2 self-end transition-transform duration-150 hover:scale-95"
                        onClick={() => handleRegister(race.id)}
                      >
                        Register now !
                      </button>
                    ) : (
                      <button
                        className="bg-red-800 text-white px-6 py-2 self-end transition-transform duration-150 hover:scale-95"
                        onClick={() => handleCancel(race.id)}
                      >
                        Cancel participation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={race.id}
                className="bg-[#23312c] border border-green-200 p-4 flex flex-col min-h-[120px] justify-between"
              >
                <div className="flex">
                  <div className="flex-1">
                    <div className="text-base mb-2 text-white">Race’s ended !</div>
                    <div className="mb-2">Initiated by : {race.endedBy}</div>
                  </div>
                  {/* Milieu centré */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="font-bold">Winner is<br />{race.winner} !</div>
                  </div>
                  {/* Droite */}
                  <div className="flex-1 flex flex-col items-end justify-center">
                    <div>
                      1st place cashprize :<br />
                      <span className="text-2xl font-bold tracking-wide">
                        {race.firstPrize.toLocaleString()} $
                      </span>
                    </div>
                  </div>
                </div>
                {/* Marquee en bas */}
                <div className="mt-2 text-xs flex items-center">
                  <span className="text-white/60 mr-2">Participants :</span>
                  <div className="w-full overflow-x-hidden">
                    <MarqueeParticipants participants={race.participants} />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

    {/* Bas de page ("Wheel Scroll...") */}
    <div className="text-center mt-2 text-gray-400 flex-shrink-0">Wheel Scroll to go up/down</div>
    </div>
  );
}

// Switch style bouton rond, design très proche du tien
function SwitchBtn({ checked, onClick, text }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 focus:outline-none`}
    >
      <div
        className={`w-9 h-5 rounded-full flex items-center bg-[#22352B] transition-colors ${
          checked ? "bg-green-400" : ""
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      <span className="ml-2 text-sm">{text}</span>
    </button>
  );
}
