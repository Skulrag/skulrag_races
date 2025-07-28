import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CreateTrack({ onTrackCreate }) {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [type, setType] = useState("sprint");
    const navigate = useNavigate();

    function handleConfirm() {
        if (name.trim()) {
            onTrackCreate?.({ name, type });
            navigate("/tracks");
        }
    }

    function handleCancel() {
        navigate(-1);
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-black text-white font-mono overflow-hidden">
            <div className="w-full max-w-xl flex flex-col items-center">
                <div className="text-center text-base mb-10 leading-6 text-white select-none">
                    <div className="mb-1 font-mono">{t("createTrackScreen.instructionsTitle")}</div>
                    {t("createTrackScreen.instructions")
                        .split('\n')
                        .map((l, i) => <div key={i}>{l}</div>)}
                </div>
                <input
                    className="w-full bg-transparent border-2 border-[#344D42] rounded-sm text-center py-4 mb-8 focus:outline-none text-white text-lg placeholder-white placeholder-opacity-50"
                    type="text"
                    value={name}
                    maxLength={50}
                    onChange={e => setName(e.target.value)}
                    placeholder={t("createTrackScreen.trackNamePlaceholder", "Nom du circuit")}
                />
                <div className="w-full flex flex-col items-center mb-10">
                    <div className="mb-2 text-lg">{t("createTrackScreen.chooseType", "Choisir le type de course")}</div>
                    <div className="flex gap-4 items-center">
                        <span className={type === "sprint" ? "font-bold" : "opacity-60"}>{t("createTrackScreen.type.sprint", "Sprint")}</span>
                        <button
                            className="relative w-14 h-7 bg-gray-600 rounded-full outline-none focus:ring-2 focus:ring-cyan-400 border-2 border-gray-800"
                            aria-pressed={type === "laps"}
                            onClick={() => setType(type === "sprint" ? "laps" : "sprint")}
                            type="button"
                        >
                            <span
                                className={`absolute top-0.5 left-1 transition-all w-6 h-6 rounded-full ${type === "laps" ? "translate-x-7 bg-cyan-400" : "bg-green-400"
                                    }`}
                                style={{
                                    transform: type === "laps" ? "translateX(24px)" : "translateX(0)",
                                    boxShadow: "0 2px 4px #0005",
                                }}
                            />
                        </button>
                        <span className={type === "laps" ? "font-bold" : "opacity-60"}>{t("createTrackScreen.type.laps", "Laps")}</span>
                    </div>
                </div>
                <button
                    className="w-full bg-[#53756E] hover:bg-[#5d8a7e] py-4 text-lg font-semibold mb-4 transition disabled:opacity-30 outline-none focus:ring-2 focus:ring-[#53756E]"
                    onClick={handleConfirm}
                    disabled={!name.trim()}
                >
                    {t("createTrackScreen.confirm", "Confirmer")}
                </button>
                <button
                    className="w-full bg-transparent border border-[#344D42] py-4 text-base font-normal text-white hover:bg-[#202122] transition"
                    onClick={handleCancel}
                >
                    {t("createTrackScreen.cancel", "Annuler")}
                </button>
            </div>
        </div>
    );
}
