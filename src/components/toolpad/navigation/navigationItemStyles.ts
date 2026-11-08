import type { Theme } from "@mui/material/styles";

import { MINI_DRAWER_WIDTH } from "../drawerConstants";
import { navigationListItemButtonSx } from "./navigationStyles";

export const buttonSx = {
  ...navigationListItemButtonSx,
  position: "relative",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  px: 1.4,
  py: 1,
} as const;

export const listItemSx = {
  py: 0, px: 1, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "visible",
} as const;

export const iconWrapperSx = { justifyContent: "center", minWidth: 34 } as const;
export const fullIconSx = { flexShrink: 0 } as const;
export const miniIconSx = {
  position: "absolute", left: "50%", top: "calc(50% - 6px)", transform: "translate(-50%, -50%)",
} as const;
export const miniCaptionSx = {
  position: "absolute", bottom: -18, left: "50%", transform: "translateX(-50%)",
  fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  maxWidth: MINI_DRAWER_WIDTH - 28,
} as const;

export const miniBadgeSx = { position: "absolute", top: -5, right: -8 } as const;
export const fullBadgeSx = { display: "inline-flex", flexShrink: 0 } as const;

export const popperSx = { zIndex: (theme: Theme) => theme.zIndex.drawer + 2, pl: 0.75 } as const;
export const paperSx = {
  py: 0.5, width: 300, maxWidth: "85vw", boxSizing: "border-box",
  maxHeight: "80vh", overflowX: "hidden", overflowY: "auto",
} as const;

const MINI_CHEVRON_SX = { position: "absolute", top: 14, right: 2, fontSize: 18 } as const;
const FULL_CHEVRON_SX = { ml: 0.5 } as const;

/** The chevron only points down when the item is expanded in full (non-mini) mode. */
export function chevronSx(isMini: boolean, expanded: boolean) {
  return {
    flexShrink: 0,
    transform: `rotate(${expanded && !isMini ? 0 : -90}deg)`,
    ...(isMini ? MINI_CHEVRON_SX : FULL_CHEVRON_SX),
  };
}

export const buttonStateSx = (isMini: boolean) => ({ ...buttonSx, minHeight: isMini ? 60 : 48 });
