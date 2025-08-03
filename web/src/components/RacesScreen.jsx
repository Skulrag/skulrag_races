import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SwitchButton from "./SwitchButton.jsx";
import { fetchNui } from "../utils/fetchNui.js";

export default function RacesScreen() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    owned: false,
    participated: true,
    ready: true,
    finished: false,
  });
  const [races, setRaces] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registerLoadingId, setRegisterLoadingId] = useState(null);
  const [delayedLoading, setDelayedLoading] = useState(false);


  const toggle = (k) => setFilters((f) => ({ ...f, [k]: !f[k] }));

  const handleRegister = (id) => {
    setRegisterLoadingId(id);
    fetchNui('__sk_races:postRegisterToRace', { id }).then(() => {
      fetchRaces();
    }).finally(() => setRegisterLoadingId(null));
  }

  const handleCancel = (id) => {
    setRegisterLoadingId(id);
    fetchNui('__sk_races:postUnregisterFromRace', { id }).then(() => {
      fetchRaces();
    }).finally(() => setRegisterLoadingId(null));
  }

  function fetchRaces() {
    setLoading(true);
    fetchNui('__sk_races:getRaces', filters).then((races) => setRaces(races)).finally(() => setLoading(false));
  }

  useEffect(() => { fetchRaces(); }, [filters]);

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
    <div className="w-full h-full flex flex-col bg-black text-white font-mono overflow-hidden">
      {/* FILTRES */}
      <div className="flex space-x-8 mb-6 mt-4 px-8">
        <SwitchButton
          checked={filters.owned}
          onClick={() => toggle("owned")}
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
          checked={filters.finished}
          onClick={() => toggle("finished")}
          text={t("racesScreen.filterEnded")}
        />
      </div>

      {/* LISTE DES COURSES */}
      <div className="flex-1 flex justify-center items-center overflow-hidden">
        <div className="w-[70%] h-[70%] max-w-full max-h-full overflow-auto flex flex-col gap-6">
          {races && races.map((race) =>
            // race.isOnline ? (
              <div
                key={race.id}
                className="relative bg-[#23312c] border border-[#3BE696] p-4 flex flex-col min-h-[120px] justify-between"
              >
                {/* Badge ID en haut à droite */}
                {race.owner && (
                  <span className="absolute top-3 right-3 bg-black text-[#3BE696] px-2 py-1 text-xs font-semibold shadow-sm z-10">
                    #{race.id}
                  </span>
                )}
                <div className="flex">
                  <div className="flex-1">
                    <div className="text-base mb-2 text-white">{t("racesScreen.online")}</div>
                    <div className="text-lg">{race.trackName}</div>
                    <div className="mt-8 text-base">{t("racesScreen.entriesLeft", { count: race.entriesLeft })}</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-lg text-white text-center">
                      {t("racesScreen.cashprize")}<br />
                      <span className="text-2xl font-bold tracking-wide">
                        {race.cashprize}   $
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end justify-end">
                    {!race.isRegistered ? (
                      <button
                        className="bg-[#202122] text-white px-6 py-2 self-end transition-transform duration-150 hover:scale-95"
                        onClick={() => handleRegister(race.id)}
                      >
                        {registerLoadingId === race.id ? (
                          <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                        ) : (
                          t("racesScreen.register")
                        )}
                      </button>
                    ) : (
                      <button
                        className="bg-[#740000] text-white px-6 py-2 self-end transition-transform duration-150 hover:scale-95"
                        onClick={() => handleCancel(race.id)}
                      >
                        {registerLoadingId === race.id ? (
                          <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                        ) : (
                          t("racesScreen.cancel")
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            // ) : (
            //   <div
            //     key={race.id}
            //     className="relative bg-[#23312c] border border-[#3BE696] p-4 flex flex-col min-h-[120px] justify-between"
            //   >
            //     {/* Badge ID en haut à droite */}
            //     {race.owner && (
            //       <span className="absolute top-3 right-3 bg-black text-[#3BE696] px-2 py-1 text-xs font-semibold shadow-sm z-10">
            //         #{race.id}
            //       </span>
            //     )}
            //     <div className="flex">
            //       <div className="flex-1">
            //         <div className="text-base mb-2 text-white">{t("racesScreen.ended")}</div>
            //         <div className="text-lg">{race.trackName}</div>
            //         <div className="mb-2">{t("racesScreen.initiatedBy", { name: race.pseudo })}</div>
            //       </div>
            //       <div className="flex-1 flex flex-col items-center justify-center">
            //         <div className="font-bold">
            //           {t("racesScreen.winner")} <br />{race.firstFinisher} !
            //         </div>
            //       </div>
            //       <div className="flex-1 flex flex-col items-end justify-center">
            //         <div>
            //           {t("racesScreen.cashprize")}<br />
            //           <span className="text-2xl font-bold tracking-wide">
            //             {race.cashprize}  $
            //           </span>
            //         </div>
            //       </div>
            //     </div>
            //     {race.participants && race.participants.length > 0 && (
            //       <div className="mt-2 text-xs flex items-center">
            //         <span className="text-white/60 mr-2">{t("racesScreen.participants")}</span>
            //         <div className="w-full overflow-x-hidden">
            //           <MarqueeParticipants participants={race.participants} />
            //         </div>
            //       </div>
            //     )}
            //   </div>
            // )
          )}
        </div>
      </div>

      {/* Bas de page */}
      <div className="text-center mt-2 text-gray-400 flex-shrink-0">{t("racesScreen.wheelScroll")}</div>
    </div>
  );
}

function MarqueeParticipants({ participants }) {
  if (!participants) return;
  const text = participants
    .map((p) => `${p}`)
    .join("; ");
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