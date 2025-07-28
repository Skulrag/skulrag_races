import React, {Context, createContext, useContext, useEffect, useState} from "react";
import {useNuiEvent} from "../hooks/useNuiEvent";
import {fetchNui} from "../utils/fetchNui";
import { isEnvBrowser } from "../utils/misc";

const VisibilityCtx = createContext<VisibilityProviderValue | null>(null)

interface VisibilityProviderValue {
  setVisible: (visible: boolean) => void
  visible: boolean
}

// This should be mounted at the top level of your application, it is currently set to
// apply a CSS visibility value. If this is non-performant, this should be customized.
export const VisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(isEnvBrowser() ? true : false)

  useNuiEvent<boolean>('skulrag_races_setVisible', setVisible)

  // Handle pressing escape/backspace
  useEffect(() => {
    // Only attach listener when we are visible
    if (!visible) {
      document.body.style.background = "transparent";
      document.body.style.backdropFilter = "none";
      return;
    }

    const keyHandler = (e: KeyboardEvent) => {
      if (["Backspace", "Escape"].includes(e.code)) {
        if (!isEnvBrowser()) fetchNui("skulrag_races_hideFrame");
      }
    }

    window.addEventListener("keydown", keyHandler)
    document.body.style.background = "rgba(0,0,0,0.7)";
    // document.body.style.backdropFilter = "blur(2px)";
    return () => {
      document.body.style.background = "transparent";
      document.body.style.backdropFilter = "none";
      window.removeEventListener("keydown", keyHandler)
    }
  }, [visible])

  return (
    <VisibilityCtx.Provider value={{ visible, setVisible }}>
      {/* Toute l'app (router, tous tes composants) */}
      <div
        className={
          // Si visible, on affiche le fond et centre tout
          visible
            ? "fixed inset-0 w-screen h-screen flex items-center justify-center bg-transparent"
            // Si non visible, on cache tout (ou fallback transparent)
            : "fixed inset-0 w-screen h-screen pointer-events-none"
        }
        style={{ zIndex: 10000 }} // si tu veux forcer le dessus de tout
      >
        {/* Les enfants ne sont PAS stretchés, juste centrés */}
        {visible && children}
      </div>
    </VisibilityCtx.Provider>
  );
};

export const useVisibility = () => useContext<VisibilityProviderValue>(VisibilityCtx as Context<VisibilityProviderValue>)
