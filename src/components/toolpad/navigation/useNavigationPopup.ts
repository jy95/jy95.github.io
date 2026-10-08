import { useEffect, useRef, useState } from "react";

// A non-modal disclosure keeps native Tab navigation and never traps focus.
import { useNavigationPopupDocumentEffects } from "./useNavigationPopupDocumentEffects";
import { useNavigationPopupHandlers } from "./useNavigationPopupHandlers";

export default function useNavigationPopup(enabled: boolean) {
  const [open, setOpen] = useState(false);
  const effectiveOpen = enabled && open;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  const handlers = useNavigationPopupHandlers({
    enabled,
    open: effectiveOpen,
    triggerRef,
    contentRef,
    setOpen,
  });

  useNavigationPopupDocumentEffects({
    open: effectiveOpen,
    contains: handlers.contains,
    close: handlers.close,
    contentRef,
  });

  useEffect(() => {
    if (!enabled) setOpen(false);
  }, [enabled]);

  return {
    open: effectiveOpen,
    triggerRef,
    contentRef,
    activate: handlers.activate,
    close: handlers.close,
    interactionProps: handlers.interactionProps,
  };
}
