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
  drawerOpen?: boolean;
};

export default function AppProvider({
  children,
  navigation,
  branding,
  drawerOpen = false
}: Props) {
  
  // Utilisation de useMemo pour éviter des recalculs inutiles du contexte
  const contextValue = useMemo(() => ({
    navigation,
    branding,
    drawerOpen
  }), [navigation, branding, drawerOpen]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}