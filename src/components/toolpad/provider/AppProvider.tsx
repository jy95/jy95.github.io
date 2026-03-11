"use client";

import { ReactNode } from "react";
import { AppContext } from "./useAppContext";
import { Navigation } from "../types";
import { Branding } from "./types";

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

  return (
    <AppContext.Provider
      value={{
        navigation,
        branding
      }}
    >
      {children}
    </AppContext.Provider>
  );
}