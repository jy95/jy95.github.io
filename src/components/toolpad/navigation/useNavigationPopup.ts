import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent } from "react";

// A non-modal disclosure keeps native Tab navigation and never traps focus.
export default function useNavigationPopup(enabled: boolean) {
  const [open, setOpen] = useState(false);
  const [previousEnabled, setPreviousEnabled] = useState(enabled);
  if (previousEnabled !== enabled) {
    setPreviousEnabled(enabled);
    setOpen(false);
  }
  const effectiveOpen = [enabled, open].every(Boolean);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointerInside = useRef(false);
  const suppressed = useRef(false);

  const cancelDismissal = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
  }, []);
  const contains = useCallback((node: EventTarget | null) => {
    if (!(node instanceof Node)) return false;
    const isContained = [
      () => Boolean(triggerRef.current?.contains(node)),
      () => Boolean(contentRef.current?.contains(node)),
    ].some(predicate => predicate());
    return isContained;
  }, []);
  const close = useCallback((restoreFocus = false) => {
    cancelDismissal();
    suppressed.current = true;
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, [cancelDismissal]);
  const scheduleDismissal = () => {
    cancelDismissal();
    timer.current = setTimeout(() => {
      const shouldDismiss = [
        () => !pointerInside.current,
        () => !contains(document.activeElement),
      ].every(predicate => predicate());
      if (shouldDismiss) setOpen(false);
    }, 150);
  };
  const onPointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (!enabled) return;
    const supportsHover = [
      () => event.pointerType === "mouse",
      () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    ].every(predicate => predicate());
    if (!supportsHover) return;
    pointerInside.current = true;
    cancelDismissal();
    const shouldOpen = [enabled, !suppressed.current].every(Boolean);
    if (shouldOpen) setOpen(true);
  };
  const onPointerLeave = () => {
    if (!enabled) return;
    pointerInside.current = false;
    suppressed.current = false;
    scheduleDismissal();
  };
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    const shouldDismiss = [() => enabled, () => !contains(event.relatedTarget)].every(predicate => predicate());
    if (shouldDismiss) scheduleDismissal();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const shouldClose = [event.key === "Escape", effectiveOpen].every(Boolean);
    if (shouldClose) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
  };
  const activate = (keyboard: boolean) => {
    if (!enabled) return;
    cancelDismissal();
    const shouldToggleClosed = [effectiveOpen, !keyboard].every(Boolean);
    if (shouldToggleClosed) close();
    else {
      suppressed.current = false;
      setOpen(true);
      if (keyboard) {
        // Popper's kept-mounted content is available before the next render.
        timer.current = setTimeout(() => {
          contentRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]')?.focus();
        }, 0);
      }
    }
  };

  useEffect(() => {
    if (!effectiveOpen) return;
    const onOutsidePointer = (event: globalThis.PointerEvent) => {
      if (!contains(event.target)) close();
    };
    const onEscape = (event: globalThis.KeyboardEvent) => {
      const shouldIgnore = [event.key !== "Escape", event.defaultPrevented].some(Boolean);
      if (shouldIgnore) return;
      // Hover leaves focus untouched, including when dismissed from elsewhere.
      const restoreFocus = Boolean(contentRef.current?.contains(document.activeElement));
      close(restoreFocus);
    };
    document.addEventListener("pointerdown", onOutsidePointer);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutsidePointer);
      document.removeEventListener("keydown", onEscape);
    };
  }, [effectiveOpen, contains, close]);
  // Mode transitions cancel both dismissal and keyboard focus-entry work.
  useEffect(() => {
    cancelDismissal();
  }, [enabled, cancelDismissal]);
  useEffect(() => () => cancelDismissal(), [cancelDismissal]);

  return { open: effectiveOpen, triggerRef, contentRef, activate, close,
    interactionProps: { onPointerEnter, onPointerLeave, onFocus: cancelDismissal, onBlur, onKeyDown } };
}
