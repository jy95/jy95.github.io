import { useState } from "react";

import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";

import { paperSx, popperSx } from "./navigationItemStyles";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

/** Open/close state and handlers of the flyout shown next to a collapsed (mini) item. */
export function useMiniPopper(hasPopup: boolean) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  return {
    anchor,
    setAnchor,
    popupOpen: hasPopup && open,
    open: () => setOpen(true),
    close: () => setOpen(false),
    onMouseEnter: () => { if (hasPopup) setOpen(true); },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => { if (event.key === "Escape") setOpen(false); },
  };
}

export type MiniPopperState = ReturnType<typeof useMiniPopper>;

function isLinkClick(event: MouseEvent<HTMLElement>): boolean {
  return event.target instanceof Element && event.target.closest("a") !== null;
}

type MiniPopperProps = {
  open: boolean;
  anchor: HTMLElement | null;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function MiniPopper({ open, anchor, title, onClose, children }: MiniPopperProps) {
  return (
    <Popper keepMounted open={open} anchorEl={anchor} placement="right-start" sx={popperSx}>
      <Paper component="nav" aria-label={title} elevation={1} sx={paperSx}
        onClick={event => { if (isLinkClick(event)) onClose(); }}>
        {children}
      </Paper>
    </Popper>
  );
}
