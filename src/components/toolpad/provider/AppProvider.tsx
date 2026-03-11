"use client";

import { useMemo, useState, useCallback } from "react";

// Hooks
import { AppContext } from "./useAppContext";

// Types
import type { Navigation, Branding } from "../types";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  navigation?: Navigation;
  branding?: Branding;
  initialDrawerOpen?: boolean;
};

export default function AppProvider({
  children,
  navigation,
  branding,
  initialDrawerOpen = false
}: Props) {
  
  const [drawerOpen, setDrawerOpen] = useState(initialDrawerOpen);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);

  const contextValue = useMemo(() => ({
    navigation,
    branding,
    drawerOpen,
    toggleDrawer,
  }), [navigation, branding, drawerOpen, toggleDrawer]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}