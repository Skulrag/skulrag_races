import { NavLink, useNavigate } from "react-router-dom";

export default function AppHeader() {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex-shrink-0 flex justify-between items-center p-6 bg-[#000000]">
        <div className="flex items-center space-x-4">
          <div className="font-mono bg-[#000000] text-[#4e7868] font-bold rounded-full w-10 h-10 flex items-center justify-center text-xl">{'>'}S</div>
          <span className="font-mono text-white text-2xl font-light tracking-wider">Races</span>
        </div>
        <div className="space-x-6 flex items-center">
          {/* Onglets navigables via NavLink */}
          <NavLink
            to="/tracks"
            className={({ isActive }) =>
              "text-white py-1 px-2 " + (isActive ? "border-b-2 border-[#4e7868]" : "opacity-50 hover:opacity-100")
            }
          >
            Tracks
          </NavLink>
          <NavLink
            to="/races"
            className={({ isActive }) =>
              "text-white py-1 px-2 " + (isActive ? "border-b-2 border-[#4e7868]" : "opacity-50 hover:opacity-100")
            }
          >
            Races
          </NavLink>
          <button
            className="ml-8 border border-[#4e7868] px-4 py-1 text-[#4e7868] transition-transform duration-150 hover:scale-97"
            onClick={() => navigate("/tracks/new")}
          >
            New Track
          </button>
        </div>
      </div>
      <div className="border-t-4 border-[#4e7868]" />
    </>
  );
}
