// Switch bouton avec i18n !
export default function SwitchButton ({ checked, onClick, text }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center space-x-2 focus:outline-none`}
    >
      <div
        className={`w-9 h-5 rounded-full flex items-center bg-[#22352B] transition-colors ${
          checked ? "bg-[#3BE696]" : ""
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