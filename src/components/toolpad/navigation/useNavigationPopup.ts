import { useEffect, useRef, useState } from "react";

// A non-modal disclosure keeps native Tab navigation and never traps focus.
import { useNavigationPopupDocumentEffects } from "./useNavigationPopupDocumentEffects";
import { useNavigationPopupHandlers } from "./useNavigationPopupHandlers";

export default function useNavigationPopup(enabled: boolean) {
  const [open, setOpen] = useState(false);
  const effectiveOpen = enabled && open;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointerInsideRef = useRef(false);
  const suppressedRef = useRef(false);

  const handlers = useNavigationPopupHandlers({
    enabled,
    open: effectiveOpen,
    triggerRef,
    contentRef,
    timerRef,
    pointerInsideRef,
    suppressedRef,
    setOpen,
  });

  useNavigationPopupDocumentEffects({
    open: effectiveOpen,
    contains: handlers.contains,
    close: handlers.close,
    contentRef,
  });

  useEffect(() => {
    if (!enabled) {
      handlers.cancelDismissal();
      setOpen(false);
    }
  }, [enabled, handlers.cancelDismissal]);

  useEffect(
    () => () => handlers.cancelDismissal(),
    [handlers.cancelDismissal],
  );

  return {
    open: effectiveOpen,
    triggerRef,
    contentRef,
    activate: handlers.activate,
    close: handlers.close,
    interactionProps: handlers.interactionProps,
  };
}
