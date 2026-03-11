import { Navigation } from "../types";

export type AppContextValue = {
  navigation?: Navigation;
  drawerOpen?: boolean;
  toggleDrawer?: () => void;
};