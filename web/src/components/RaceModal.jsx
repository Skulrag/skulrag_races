import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function RaceModal({ track, onClose }) {
  const [date, setDate] = useState(null);
  const [laps, setLaps] = useState("");
  const [cash, setCash] = useState("");

//   const isLaps = track?.type === "laps";
  const isLaps = true;
  const isValid = date && cash && (!isLaps || laps);

  function onConfirm() {
    alert(
      `Date: ${date?.toLocaleString()}\nLaps: ${laps}\nCashprize: ${cash}`
    );
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-opacity-80 flex items-center justify-center z-50 font-mono">
      <div className="bg-black border-25 border-[#344D42] px-6 py-10 w-full max-w-md flex flex-col items-center relative mx-2">
        <button
          onClick={onClose}
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

        {/* --- DatePicker stylisé avec sélection de l'heure --- */}
        <div className="w-full mb-4">
          <DatePicker
            selected={date}
            onChange={setDate}
            showTimeSelect
            timeIntervals={5} // pas de 5 minutes, modifiable selon besoins
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
            className="w-full mb-4 border-2 border-[#344D42] bg-transparent px-4 py-4 text-white text-center focus:outline-none focus:border-[#53756E] transition placeholder-white placeholder-opacity-60"
            placeholder="Nombre de tours"
            required={isLaps}
          />
        )}

        <input
          type="number"
          min={0}
          value={cash}
          onChange={e => setCash(e.target.value)}
          className="w-full mb-8 border-2 border-[#344D42] px-4 py-4 text-white text-center focus:outline-none focus:border-[#53756E] transition placeholder-white placeholder-opacity-60"
          placeholder="Indiquer un cashprize total."
          required
        />

        <button
          className="w-full mb-4 bg-[#344D42] hover:bg-[#5d8a7e] py-4 text-lg font-semibold transition disabled:opacity-40"
          onClick={onConfirm}
          disabled={!isValid}
        >
          Confirm
        </button>
        <button
          className="w-full border border-[#344D42] py-4 text-base font-normal text-white transition"
          onClick={onClose}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
