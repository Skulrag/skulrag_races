import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SwitchButton from "./SwitchButton.jsx";
import { fetchNui } from "../utils/fetchNui.js";

export default function CreateTrack({ onTrackCreate }) {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [type, setType] = useState("sprint");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function handleSubmitAction(e) {
        setError(null);
        e.preventDefault();
        const result = await fetchNui('__sk_races:postCreateTrack', {
              name,
              type
            });
        if (!result) {
            setError("Une erreur s'est produite.");
        } else {
            setError(null);
            navigate('/');
        }
    }

    function handleCancel(prevState, data) {
        navigate(-1);
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-black text-white font-mono overflow-hidden">
            <form
                className="w-full max-w-xl flex flex-col items-center"
                onSubmit={handleSubmitAction}
                autoComplete="off"
            >
                {/* Entête */}
                <div className="text-center text-base mb-10 leading-6 text-white select-none">
                    <div className="mb-1 font-mono">{t("createTrackScreen.instructionsTitle")}</div>
                    {t("createTrackScreen.instructions")
                        .split('\n')
                        .map((l, i) => <div key={i}>{l}</div>)}
                </div>
                {/* Champ nom */}
                <input
                    name='name'
                    className="w-full bg-transparent border-2 border-[#344D42] rounded-sm text-center py-4 mb-8 focus:outline-none text-white text-lg placeholder-white placeholder-opacity-50"
                    type="text"
                    value={name}
                    maxLength={50}
                    onChange={e => setName(e.target.value)}
                    placeholder={t("createTrackScreen.trackNamePlaceholder", "Nom du circuit")}
                    required
                    autoFocus
                />
                {/* Switch type */}
                <div className="w-full flex flex-col items-center mb-10">
                    <div className="mb-2 text-lg">
                        {t("createTrackScreen.chooseType", "Choisir le type de course")}
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className={type === "sprint" ? "font-bold" : "opacity-60"}>
                            {t("createTrackScreen.type.sprint", "Sprint")}
                        </span>
                        <SwitchButton
                            checked={type === "laps"}
                            onClick={() => setType(type === "laps" ? "sprint" : "laps")}
                            id="switch-tracktype"
                        />
                        <span className={type === "laps" ? "font-bold" : "opacity-60"}>
                            {t("createTrackScreen.type.laps", "Laps")}
                        </span>
                    </div>
                </div>
                {/* Bouton valider */}
                <button
                    className="w-full bg-[#53756E] hover:bg-[#5d8a7e] py-4 text-lg font-semibold mb-4 transition disabled:opacity-30 outline-none focus:ring-2 focus:ring-[#53756E]"
                    type="submit"
                    disabled={!name.trim()}
                >
                    {t("createTrackScreen.confirm", "Confirmer")}
                </button>
                {/* Bouton annuler */}
                <button
                    className="w-full bg-transparent border border-[#344D42] py-4 text-base font-normal text-white hover:bg-[#202122] transition"
                    onClick={handleCancel}
                    type="button"
                >
                    {t("createTrackScreen.cancel", "Annuler")}
                </button>
                 {error && (
                    <div className="text-[#740000] text-sm py-2">{error}</div>
                )}
            </form>
        </div>
    );
}
