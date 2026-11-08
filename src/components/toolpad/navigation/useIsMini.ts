import { useAppContext } from "../provider/useAppContext";

/** An explicit `mini` prop wins; otherwise the drawer state decides (open by default). */
export function useIsMini(mini?: boolean): boolean {
  const { drawerOpen = true } = useAppContext();
  return mini ?? !drawerOpen;
}
