import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { fetchNui } from "../utils/fetchNui.js";

// utilities
function getStatus(race) {
    if (race.isCanceled) return "canceled";
    else if (race.isFinished) return "finished";
    else if (race.isRunning) return "running";
    return "";
}

function formatTime(secs) {
    if (secs == null) return "-";
    let m = Math.floor(secs / 60);
    let s = secs % 60;
    return `${m}:${s.toFixed(2).toString().padStart(5, "0")}`;
}

function statusIcon(status) {
    if (status === "finished")
        // Cercle vert très pâle + check white
        return (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#3BE696]">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
                <path
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 13l3 3 6-6"
                />
            </svg>
        );
    if (status === "running")
        // Spinner
        return (
            <svg className="animate-spin h-5 w-5 text-[#C57D19]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
        );
    if (status === "canceled")
        // Cercle rouge pâle + croix rouge
        return (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#740000]">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
                <line x1="7" y1="7" x2="17" y2="17"
                    stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <line x1="17" y1="7" x2="7" y2="17"
                    stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
        );
    return null;
}

export default function RaceHistory() {
    // races: array of race objects fetched from your API
    const { t } = useTranslation();
    const [openIdx, setOpenIdx] = useState(null);
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [delayedLoading, setDelayedLoading] = useState(false);

    function fetchRaces() {
        setLoading(true);
        fetchNui('__sk_races:getRacesHistory').then((races) => setRaces(races)).finally(() => setLoading(false));
    }

    useEffect(() => { fetchRaces(); }, []);

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
        <div className="w-full min-h-screen flex flex-col items-center bg-black">
            <div className="w-full md:w-3/4 max-w-4xl flex flex-col mt-5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-white">{t("history.title", "Historique des courses")}</span>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 text-sm" onClick={() => window.location.reload()}>
                        {t("refresh", "Rafraîchir")}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto overflow-hidden max-h-[65vh] space-y-2 pr-2">
                    {loading ? (
                        <div className="text-gray-400 text-center p-8 italic">{t("history.loading", "Chargement...")}</div>
                    ) : races.length === 0 ? (
                        <div className="text-gray-400 text-center p-8">{t("history.empty", "Aucune course à afficher.")}</div>
                    ) : races.map((race, idx) => {
                        const status = getStatus(race);
                        const opened = openIdx === idx;
                        return (
                            <div
                                key={race.id}
                                className="mb-4 border-2 border-[#3BE696] bg-[#23312c]"
                            >
                                <button
                                    type="button"
                                    className="w-full flex justify-between items-center px-4 py-3 bg-[#23312c] text-white focus:outline-none"
                                    onClick={() => setOpenIdx(opened ? null : idx)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{race.name}</span>
                                        <span className="text-xs ml-2">{race.date}</span>
                                        <span className="text-xs ml-4">{race.initiator && `par ${race.initiator}`}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {race.owner && (
                                            <span className="bg-black text-[#3BE696] px-2 py-1 text-xs font-semibold shadow-sm z-10">
                                                #{race.id}
                                            </span>
                                        )}
                                        {statusIcon(status)}
                                        <svg className={`w-5 h-5 transition-transform duration-300 ${opened ? "rotate-180" : ""}`} fill="none" stroke="white" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>
                                {opened && (
                                    <div className="px-4 pb-4 pt-2 bg-[#23312c] text-white">
                                        {/* Contenu détaillé, exemple avec le tableau */}
                                        <table className="w-full text-white">
                                            <thead>
                                                <tr className="bg-[#23312c] text-left text-sm text-white">
                                                    <th className="w-14 py-1 px-2">Place</th>
                                                    <th className="py-1 px-2">Pseudo</th>
                                                    <th className="py-1 px-2">Temps</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(race.results || []).length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="italic py-2 text-center text-white">
                                                            Aucun résultat.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    race.results.map((r, i) => (
                                                        <tr key={r.rank ?? i} className="border-t border-[#3BE696]">
                                                            <td className="py-1 px-2">{r.rank}</td>
                                                            <td className="py-1 px-2">{r.pseudo}</td>
                                                            <td className="py-1 px-2">{formatTime(r.elapsed)}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
