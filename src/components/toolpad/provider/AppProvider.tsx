"use client";

import { useMemo, useCallback } from "react";

// Hooks
import { AppContext } from "./useAppContext";
import { useToggle } from "@/hooks/useToggle";

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
  
  const [drawerOpen, toggleDrawerOpen] = useToggle(initialDrawerOpen);

  const toggleDrawer = useCallback(() => {
    toggleDrawerOpen();
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