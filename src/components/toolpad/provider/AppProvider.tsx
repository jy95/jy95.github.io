"use client";

import { useMemo } from "react";

// Hooks
import { AppContext } from "./useAppContext";

// Types
import type { Navigation, Branding } from "../types";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  navigation?: Navigation;
  branding?: Branding;
};

export default function AppProvider({
  children,
  navigation,
  branding
}: Props) {
  
  // Utilisation de useMemo pour éviter des recalculs inutiles du contexte
  const contextValue = useMemo(() => ({
    navigation,
    branding
  }), [navigation, branding]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}