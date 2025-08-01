import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SwitchButton from "./SwitchButton";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { fetchNui } from "../utils/fetchNui.js";

export default function RaceModal({ track, onClose }) {
  const { t } = useTranslation();
  const [date, setDate] = useState(null);
  const [laps, setLaps] = useState("");
  const [cash, setCash] = useState("");
  const [error, setError] = useState("");
  const [type, setType] = useState("legal");
  const [entries, setEntries] = useState("")
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isLaps = track?.type === "laps";
  const isValid = date && cash !== "" && (!isLaps || laps !== "");

  async function onCreateRace({ date, laps, cashprize, type, id, entries }) {
    await fetchNui('__sk_races:postCreateRace', { trackId: id, date, laps, cashprize, type, entries });
    onClose();
    navigate('/races');
  }

  async function onFormSubmit(e) {
    e.preventDefault();
    setError("");
    if (!isValid) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (Number(cash) < 0) {
      setError("Le cashprize doit être positif ou à zéro.");
      return;
    }

    if (Number(entries) <= 0) {
      setError("Le nombre de participants doit être positif.");
      return;
    }
    if (isLaps && Number(laps) < 1) {
      setError("Nombre de tours minimum : 1.");
      return;
    }
    setLoading(true); // Active le loader !
    try {
      await onCreateRace({ id: track?.id, date, laps: isLaps ? Number(laps) : 0, cashprize: Number(cash), type, entries });
    } finally {
      setLoading(false); // Désactive après soumission (ou erreur)
    }
  }


  return (
    <div className="fixed inset-0 bg-opacity-80 flex items-center justify-center z-50 font-mono">
      <div className="bg-black border-25 border-[#344D42] px-6 py-10 w-full max-w-md flex flex-col items-center relative mx-2">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-3 right-4 text-2xl text-[#53756E] hover:text-[#70bfae] focus:outline-none"
        >
          &times;
        </button>
        <div className="w-full text-center text-base leading-6 text-white mb-6 select-none">
          <div className="mb-1 font-mono">/!\ IMPORTANT /!\</div>
          <div>
            Vous êtes sur le point de créer une course.<br />
            Veillez à être présent le moment venu,<br />
            seulement vous pourrez déclencher le départ.
          </div>
        </div>
        <div className="text-[#14FF6C] text-2xl font-bold mb-8">
          ID : <span className="tracking-wider">{track?.id}</span>
        </div>
        <form className="w-full flex flex-col items-center" onSubmit={onFormSubmit} autoComplete="off">
          {/* Switch type */}
          <div className="w-full flex flex-col items-center mb-10">
            <div className="mb-2 text-lg">
              {t("createRaceScreen.chooseType", "Choisir le type de course")}
            </div>
            <div className="flex gap-4 items-center">
              <span className={type === "legal" ? "font-bold" : "opacity-60"}>
                {t("createRaceScreen.type.legal", "Legal")}
              </span>
              <SwitchButton
                checked={type === "illegal"}
                onClick={() => setType(type === "illegal" ? "legal" : "illegal")}
                id="switch-tracktype"
              />
              <span className={type === "illegal" ? "font-bold" : "opacity-60"}>
                {t("createRaceScreen.type.illegal", "Illegal")}
              </span>
            </div>
          </div>
          <div className="w-full mb-4">
            <DatePicker
              selected={date}
              onChange={setDate}
              showTimeSelect
              timeIntervals={5}
              timeFormat="HH:mm"
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText="Choisir date et heure"
              className="w-full border-2 border-[#344D42] bg-transparent px-4 py-4 text-white text-center focus:outline-none focus:border-[#53756E] transition placeholder-white placeholder-opacity-60"
              calendarClassName="bg-[#191b1c] border-[#53756E] text-white"
              popperClassName="z-50 font-mono"
              required
            />
          </div>

          {isLaps && (
            <input
              type="number"
              min={1}
              max={999}
              value={laps}
              onChange={e => setLaps(e.target.value)}
              className="w-full mb-4 border-2 border-[#344D42] bg-transparent px-4 py-4 text-white text-center focus:outline-none focus:border-[#53756E] focus:ring-2 ring-[#14FF6C] transition placeholder-white placeholder-opacity-60"
              placeholder="Nombre de tours"
              required={isLaps}
            />
          )}

          <input
            type="number"
            min={0}
            value={cash}
            onChange={e => setCash(e.target.value)}
            className="w-full mb-8 border-2 border-[#344D42] px-4 py-4 bg-transparent text-white text-center focus:outline-none focus:border-[#53756E] transition placeholder-white placeholder-opacity-60"
            placeholder="Indiquer un cashprize total."
            required
          />

          <input
            type="number"
            min={0}
            value={entries}
            onChange={e => setEntries(e.target.value)}
            className="w-full mb-8 border-2 border-[#344D42] px-4 py-4 bg-transparent text-white text-center focus:outline-none focus:border-[#53756E] transition placeholder-white placeholder-opacity-60"
            placeholder="Indiquer un nombre de participants."
            required
          />
          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}

          <button
            className="w-full mb-4 bg-[#344D42] hover:bg-[#5d8a7e] py-4 text-lg font-semibold transition disabled:opacity-40 flex items-center justify-center"
            disabled={!isValid || loading}
            type="submit"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-80" fill="#14FF6C"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z">
                  </path>
                </svg>
                {t("createRaceScreen.loading", "Création...")}
              </>
            ) : (
              t("createRaceScreen.confirm", "Confirmer")
            )}
          </button>

          <button
            className="w-full border border-[#344D42] py-4 text-base font-normal text-white transition"
            type="button"
            onClick={onClose}
          >
            Annuler
          </button>
        </form>
      </div>
    </div>
  );
}
