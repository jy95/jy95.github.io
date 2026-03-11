"use client";

import { createContext, useContext } from "react";
import type { AppContextValue } from "./types";

export const AppContext = createContext<AppContextValue>({});

export function useAppContext() {
  return useContext(AppContext);
}