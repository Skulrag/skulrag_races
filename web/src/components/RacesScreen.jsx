import { useState } from "react";
import { useTranslation } from "react-i18next";
import SwitchButton from "./SwitchButton.jsx";
// Dummy data exemple
const DEMO_RACES = [
  {
    id: 1,
    isOnline: true,
    entriesLeft: 3,
    firstPrize: 50000,
    isRegistered: true,
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

export default function RacesScreen() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    initiated: true,
    participated: true,
    ready: true,
    ended: true,
  });

  const toggle = (k) => setFilters((f) => ({ ...f, [k]: !f[k] }));

  const goToTracks = () => alert(t("racesScreen.goToTracks"));
  const goToRaces = () => alert(t("racesScreen.goToRaces"));
  const handleRegister = (raceId) => alert(t("racesScreen.registering", { raceId }));
  const handleCancel = (raceId) => alert(t("racesScreen.canceling", { raceId }));

  return (
    <div className="w-full h-full flex flex-col bg-black text-white font-mono overflow-hidden">
      {/* FILTRES */}
      <div className="flex space-x-8 mb-6 mt-4 px-8">
        <SwitchButton
          checked={filters.initiated}
          onClick={() => toggle("initiated")}
          text={t("racesScreen.filterInitiated")}
        />
        <SwitchButton
          checked={filters.participated}
          onClick={() => toggle("participated")}
          text={t("racesScreen.filterParticipated")}
        />
        <SwitchButton
          checked={filters.ready}
          onClick={() => toggle("ready")}
          text={t("racesScreen.filterReady")}
        />
        <SwitchButton
          checked={filters.ended}
          onClick={() => toggle("ended")}
          text={t("racesScreen.filterEnded")}
        />
      </div>

      {/* LISTE DES COURSES */}
      <div className="flex-1 flex justify-center items-center overflow-hidden">
        <div className="w-[70%] h-[70%] max-w-full max-h-full overflow-auto flex flex-col gap-6">
          {DEMO_RACES.map((race) =>
            race.isOnline ? (
              <div
                key={race.id}
                className="bg-[#23312c] border border-[#3BE696] p-4 flex flex-col min-h-[120px] justify-between"
              >
                <div className="flex">
                  <div className="flex-1">
                    <div className="text-base mb-2 text-white">{t("racesScreen.online")}</div>
                    <div className="mt-8 text-base">{t("racesScreen.entriesLeft", { count: race.entriesLeft })}</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-lg text-white text-center">
                      {t("racesScreen.firstPrizeTitle")}<br />
                      <span className="text-2xl font-bold tracking-wide">
                        {race.firstPrize.toLocaleString()}   $  
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end justify-end">
                    {!race.isRegistered ? (
                      <button
                        className="bg-[#202122] text-white px-6 py-2 self-end transition-transform duration-150 hover:scale-95"
                        onClick={() => handleRegister(race.id)}
                      >
                        {t("racesScreen.register")}
                      </button>
                    ) : (
                      <button
                        className="bg-[#740000] text-white px-6 py-2 self-end transition-transform duration-150 hover:scale-95"
                        onClick={() => handleCancel(race.id)}
                      >
                        {t("racesScreen.cancel")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={race.id}
                className="bg-[#23312c] border border-[#3BE696] p-4 flex flex-col min-h-[120px] justify-between"
              >
                <div className="flex">
                  <div className="flex-1">
                    <div className="text-base mb-2 text-white">{t("racesScreen.ended")}</div>
                    <div className="mb-2">{t("racesScreen.initiatedBy", { name: race.endedBy })}</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="font-bold">
                      {t("racesScreen.winner")} <br />{race.winner} !
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-end justify-center">
                    <div>
                      {t("racesScreen.firstPrizeTitle")}<br />
                      <span className="text-2xl font-bold tracking-wide">
                        {race.firstPrize.toLocaleString()}  $ 
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs flex items-center">
                  <span className="text-white/60 mr-2">{t("racesScreen.participants")}</span>
                  <div className="w-full overflow-x-hidden">
                    <MarqueeParticipants participants={race.participants} />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Bas de page */}
      <div className="text-center mt-2 text-gray-400 flex-shrink-0">{t("racesScreen.wheelScroll")}</div>
    </div>
  );
}

function MarqueeParticipants({ participants }) {
  const text = participants
    .map((p) => `${p.pseudo} :  $ {p.cashprize}   $  ;`)
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