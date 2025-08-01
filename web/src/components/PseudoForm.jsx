import React, { useActionState, useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';

export default function PseudoForm({ onSubmit, setPseudo }) {
  const [state, formAction, isPending] = useActionState(handleSubmit)
  const [needPin, setNeedPin] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    setNeedPin(needPin);
  }, [needPin]);

  async function handleSubmit(prevState, data) {
    setError(null);
    const result = await onSubmit(data);
    if (!result.success) {
      if (result.name === "pin") {
        setError("Le code PIN est incorrect.");
      } else if (result.name === "pseudo") {
        setError("Ce pseudo est déjà utilisé.");
      } else {
        setError("Une erreur s'est produite.");
      }
    } else {
      setError(null);
      setPseudo(data.get('pseudo'));
      navigate('/');
    }
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="bg-[#000000] w-full max-w-2xl rounded-2xl shadow-xl p-8">
        <header className="flex items-center space-x-4 mb-3">
          <span className="font-mono bg-[#000000] text-[#4e7868] font-bold rounded-full w-10 h-10 flex items-center justify-center text-xl">
            &gt;S
          </span>
          <span className="font-mono text-white text-2xl font-light tracking-wider">
            {t("pseudoForm.title")}
          </span>
        </header>
        <div className="border-t border-[#4e7868] mb-8" />
        <form className="flex flex-col items-center gap-5" action={formAction}>
          <p className="font-mono text-[#bdbdbd] mb-2 text-center">{t("pseudoForm.choose")}</p>
          <input
            name="pseudo"
            type="text"
            placeholder={t("pseudoForm.placeholderPseudo")}
            className="font-mono bg-black border border-[#4e7868] text-white text-lg rounded px-4 py-3 w-80 text-center outline-none focus:border-[#6eb595] transition font-mono"
            required
          />
          {needPin && (
            <input
              name="pin"
              type="password"
              placeholder={t("pseudoForm.placeholderPin")}
              className="font-mono bg-black border border-[#4e7868] text-white text-lg rounded px-4 py-3 w-80 text-center outline-none focus:border-[#6eb595] transition font-mono"
              required
            />
          )}
          {error && (
            <div className="text-[#740000] text-sm py-2">{error}</div>
          )}
          <button
            type="submit"
            className="w-80 py-4 mt-2 bg-[#4e7868] text-white text-lg rounded transition hover:bg-[#325546] font-medium font-mono"
          >
            {t("pseudoForm.confirm")}
          </button>
        </form>
      </div>
    </div>
  );
}
