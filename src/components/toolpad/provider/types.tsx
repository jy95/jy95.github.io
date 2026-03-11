import { ReactNode } from "react";
import { Navigation } from "../types";

export type Branding = {
  title?: string;
  logo?: ReactNode;
};

export type AppContextValue = {
  navigation?: Navigation;
  branding?: Branding;
};