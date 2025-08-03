import React, { useState } from "react";
import { useTranslation } from "react-i18next";

// utilities
function getStatus(race) {
    if (race.isCanceled) return "canceled";
    if (race.isFinished) return "finished";
    if (race.isStarted && !race.isFinished) return "running";
    return "";
}

function formatDate(ts) {
    // Expect ts in milliseconds
    const d = new Date(ts);
    return d.toLocaleDateString() + " - " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatTime(secs) {
    if (secs == null) return "-";
    let m = Math.floor(secs / 60);
    let s = secs % 60;
    return `${m}:${s.toFixed(2).toString().padStart(5, "0")}`;
}

function statusColor(status) {
    if (status === "finished") return "bg-green-500";
    if (status === "running") return "bg-orange-500 animate-pulse";
    if (status === "canceled") return "bg-red-500";
    return "bg-gray-400";
}

function statusIcon(status) {
    if (status === "finished")
        // Cercle vert + check inside
        return (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
                <circle cx="12" cy="12" r="10" fill="white" opacity="0.15" />
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
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
        );
    if (status === "canceled")
        // Cercle rouge + croix
        return (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
                <line x1="7" y1="7" x2="17" y2="17"
                    stroke="white" strokeWidth="3" strokeLinecap="round" />
                <line x1="17" y1="7" x2="7" y2="17"
                    stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
        );
    return "";
}

export default function RaceHistory({ races }) {
    // races: array of race objects fetched from your API
    const { t } = useTranslation();
    const [openIdx, setOpenIdx] = useState(null);
    const [races, setRaces] = useState(null);
    const [loading, setLoading] = useState(false);
    const [delayedLoading, setDelayedLoading] = useState(false);

    function fetchRaces() {
        setLoading(true);
        fetchNui('__sk_races:getRacesHistory', filters).then((races) => setRaces(races)).finally(() => setLoading(false));
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
        <div className="w-full max-w-3xl mx-auto space-y-2 mt-5">
            {races.length === 0 ? (
                <div className="text-gray-400 text-center p-8">
                    {t("history.empty", "Aucune course à afficher.")}
                </div>
            ) : races.map((race, idx) => {
                const status = getStatus(race);
                return (
                    <div key={race.id} className="border rounded shadow bg-white">
                        {/* Bandeau (header du collapse) */}
                        <button
                            className="w-full flex items-center p-3 text-lg gap-3 focus:outline-none"
                            onClick={() => setOpenIdx(idx === openIdx ? null : idx)}
                        >
                            {/* Chevron */}
                            <span
                                className={`transition-transform duration-300 ${idx === openIdx ? "rotate-180" : ""
                                    }`}
                            >
                                ▼
                            </span>
                            {/* Nom */}
                            <span className="flex-1 font-semibold">{race.name}</span>
                            {/* Date */}
                            <span className="text-sm text-gray-600 mr-3 min-w-[130px] text-right">
                                {formatDate(race.date)}
                            </span>
                            {/* Badge statut */}
                            <span
                                className={`ml-4 inline-flex items-center justify-center w-7 h-7 rounded-full text-white font-bold shadow ${statusColor(status)
                                    }`}
                            >
                                {statusIcon(status)}
                            </span>
                        </button>
                        {/* Content (collapse) */}
                        {openIdx === idx && (
                            <div className="border-t px-5 pb-4 pt-3 bg-gray-50 animate-fadein">
                                {/* Ligne infos initiateur/gagnant/cashprize */}
                                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mb-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">{t('history.initiator', 'Initiateur')}:</span>{" "}
                                        <span className="font-medium">{race.pseudo ?? "-"}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">{t('history.winner', 'Gagnant')}:</span>{" "}
                                        <span className="font-medium">{race.firstFinisher ?? "-"}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">{t('history.cashprize', 'Cashprize')}:</span>{" "}
                                        <span className="font-medium">${race.cashprize ?? 0} $</span>
                                    </div>
                                </div>
                                {/* Tableau participants */}
                                <div>
                                    <table className="w-full bg-white">
                                        <thead>
                                            <tr className="bg-gray-200 text-left text-sm">
                                                <th className="w-14 py-1 px-2">{t('history.place', 'Place')}</th>
                                                <th className="py-1 px-2">{t('history.pseudo', 'Pseudo')}</th>
                                                <th className="py-1 px-2">{t('history.time', 'Temps')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(race.results || []).length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="text-gray-400 italic py-2 text-center">
                                                        {t('history.no_results', "Aucun résultat.")}
                                                    </td>
                                                </tr>
                                            ) : (
                                                race.results.map((r, i) => (
                                                    <tr key={r.rank ?? i} className="border-t last:border-b">
                                                        <td className="py-1 px-2">{r.rank}</td>
                                                        <td className="py-1 px-2">{r.pseudo}</td>
                                                        <td className="py-1 px-2">{formatTime(r.elapsed)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
