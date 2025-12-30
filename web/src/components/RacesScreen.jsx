import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SwitchButton from "./SwitchButton.jsx";
import { fetchNui } from "../utils/fetchNui.js";

export default function RacesScreen() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    owned: false,
  });
  const [races, setRaces] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registerLoadingId, setRegisterLoadingId] = useState(null);
  const [delayedLoading, setDelayedLoading] = useState(false);
  const [confirmStartRace, setConfirmStartRace] = useState(null);
  const [startLoadingId, setStartLoadingId] = useState(null);
  const [confirmCancelRace, setConfirmCancelRace] = useState(null);


  const toggle = (k) => setFilters((f) => ({ ...f, [k]: !f[k] }));

  const handleStartRace = (id) => {
    setStartLoadingId(id);
    fetchNui('__sk_races:postStartRace', { id }).then(() => {
      fetchRaces();
    }).finally(() => {
      setStartLoadingId(null);
      setConfirmStartRace(null);
    });
  };


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
                  <div className="flex flex-row gap-x-2 items-end">
                    {/* REGISTER */}
                    {!race.isRegistered && race.entriesLeft > 0 && (
                      <button
                        className="bg-[#202122] text-white px-6 py-2 transition-transform duration-150 hover:scale-95"
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
                    )}

                    {/* CANCEL */}
                    {race.isRegistered && (
                      <button
                        className="bg-[#740000] text-white px-6 py-2 transition-transform duration-150 hover:scale-95"
                        onClick={() => handleCancel(race.id)}
                      >
                        {registerLoadingId === race.id ? (
                          <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                        ) : (
                          t("racesScreen.cancelRegister")
                        )}
                      </button>
                    )}

                    {/* START (OWNER SEULEMENT) */}
                    {race.owner && (
                      <button
                        className="bg-[#257417] hover:bg-[#115c20] text-white px-6 py-2 rounded transition-all duration-150"
                        onClick={() => setConfirmStartRace(race.id)}
                        disabled={startLoadingId === race.id}
                      >
                        {t("racesScreen.start")}
                      </button>
                    )}

                    {/* Delete (réservé à l'owner, ou à adapter) */}
                    {race.owner && (
                      <button
                        className="p-1 bg-transparent transition transition-transform duration-150 hover:scale-95"
                        title={t("racesScreen.delete")}
                        onClick={() => setConfirmCancelRace(race.id)}
                        type="button"
                      >
                        <svg
                          className="w-5 h-5 text-[#840D0D] hover:text-[#F61E1E]"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V4h6v3M10 11v6m4-6v6M4 7h16l-1.5 14h-13L4 7z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>


              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bas de page */}
      <div className="text-center mt-2 text-gray-400 flex-shrink-0">{t("racesScreen.wheelScroll")}</div>
      {confirmStartRace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparant">
          <div className="bg-[#1d2823] p-6 w-full max-w-md shadow-lg text-white border border-[#3BE696]">
            <div className="font-bold text-lg mb-2">{t("racesScreen.startTitle", "Démarrer la course ?")}</div>
            <div className="mb-6">{t("racesScreen.startConfirm", "Es-tu sûr de vouloir démarrer cette course ?")}</div>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-1 bg-gray-500 hover:bg-gray-600 text-white"
                onClick={() => setConfirmStartRace(null)}
              >{t("cancel", "Annuler")}</button>
              <button
                className="px-4 py-1 bg-[#257417] hover:bg-[#115c20] text-white flex items-center"
                onClick={() => handleStartRace(confirmStartRace)}
                disabled={startLoadingId === confirmStartRace}
              >
                {startLoadingId === confirmStartRace ? (
                  <svg className="animate-spin h-5 w-5 mx-1" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                ) : t("racesScreen.startNow", "Oui, démarrer")}
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmCancelRace && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                              <div className="bg-[#1d2823] rounded-lg p-6 w-full max-w-md shadow-lg text-white border border-[#3BE696]">
                                  <div className="font-bold text-lg mb-2">{t("races.cancelTitle", "Arrêter la course ?")}</div>
                                  <div className="mb-6">{t("races.cancelConfirm", "Es-tu sûr de vouloir arrêter la course ?")}</div>
                                  <div className="flex justify-end gap-3">
                                      <button
                                          className="px-4 py-1 rounded bg-gray-500 text-white hover:bg-gray-600"
                                          onClick={() => setConfirmCancelRace(null)}
                                      >{t("cancel", "Annuler")}</button>
                                      <button
                                          className="px-4 py-1 rounded bg-[#C05708] text-white hover:bg-[#944205]"
                                          onClick={() => fetchNui("__sk_races:postCancelRace", confirmCancelRace).then(() => setConfirmCancelRace(null)).finally(() => fetchRaces())}
                                      >{t("races.cancelNow", "Oui, arrêter")}</button>
                                  </div>
                              </div>
                          </div>
                      )}
    </div>
  );
}