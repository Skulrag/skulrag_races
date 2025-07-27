import React, { useEffect, useState } from 'react';

export default function PseudoForm({ onSubmit }) {
  const [pseudo, setPseudo] = useState('');
  const [pin, setPin] = useState('');
  const [needPin, setNeedPin] = useState(true);

  useEffect(() => {
    const handler = (event) => {
      if (event.data?.action === 'displayUi') {
        setNeedPin(Boolean(event.data.needPin));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pseudo.trim() || (needPin && !pin.trim())) return;

    fetch('https://NOM_DE_TA_RESSOURCE/submitPseudo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ pseudo, pin: needPin ? pin : null })
    });
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="bg-[#000000] w-full max-w-2xl rounded-2xl shadow-xl p-8">
        <header className="flex items-center space-x-4 mb-3">
          <span className="font-mono bg-[#000000] text-[#4e7868] font-bold rounded-full w-10 h-10 flex items-center justify-center text-xl">
            &gt;S
          </span>
          <span className="font-mono text-white text-2xl font-light tracking-wider">
            Races
          </span>
        </header>
        <div className="border-t border-[#4e7868] mb-8" />
        <form className="flex flex-col items-center gap-5" onSubmit={handleSubmit}>
          <p className="font-mono text-[#bdbdbd] mb-2 text-center">Choose WISELY your pseudonyme</p>
          <input
            type="text"
            placeholder="Type pseudonyme"
            className="font-mono bg-black border border-[#4e7868] text-white text-lg rounded px-4 py-3 w-80 text-center outline-none focus:border-[#6eb595] transition font-mono"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
          />
          {needPin && (
            <input
              type="password"
              placeholder="#Code PIN"
              className="font-mono bg-black border border-[#4e7868] text-white text-lg rounded px-4 py-3 w-80 text-center outline-none focus:border-[#6eb595] transition font-mono"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          )}
          <button
            type="submit"
            className="w-80 py-4 mt-2 bg-[#4e7868] text-white text-lg rounded transition hover:bg-[#325546] font-medium font-mono"
          >
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}