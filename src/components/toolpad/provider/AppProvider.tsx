"use client";

import { useMemo, useState, useCallback } from "react";

// Hooks
import { AppContext } from "./useAppContext";

// Types
import type { Navigation } from "../types";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  navigation?: Navigation;
  initialDrawerOpen?: boolean;
};

export default function AppProvider({
  children,
  navigation,
  initialDrawerOpen = false
}: Props) {
  
  const [drawerOpen, setDrawerOpen] = useState(initialDrawerOpen);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);

  const contextValue = useMemo(() => ({
    navigation,
    drawerOpen,
    toggleDrawer,
  }), [navigation, drawerOpen, toggleDrawer]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}