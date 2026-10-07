import { useEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent } from "react";

// A non-modal disclosure keeps native Tab navigation and never traps focus.
export default function useNavigationPopup(enabled: boolean) {
  const [open, setOpen] = useState(false);
  const [previousEnabled, setPreviousEnabled] = useState(enabled);
  if (previousEnabled !== enabled) {
    setPreviousEnabled(enabled);
    setOpen(false);
  }
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointerInside = useRef(false);
  const suppressed = useRef(false);

  const cancelDismissal = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
  };
  const contains = (node: EventTarget | null) => node instanceof Node &&
    (triggerRef.current?.contains(node) || contentRef.current?.contains(node));
  const close = (restoreFocus = false) => {
    cancelDismissal();
    suppressed.current = true;
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };
  const scheduleDismissal = () => {
    cancelDismissal();
    timer.current = setTimeout(() => {
      if (!pointerInside.current && !contains(document.activeElement)) setOpen(false);
    }, 150);
  };
  const onPointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    pointerInside.current = true;
    cancelDismissal();
    if (enabled && !suppressed.current) setOpen(true);
  };
  const onPointerLeave = () => {
    pointerInside.current = false;
    suppressed.current = false;
    scheduleDismissal();
  };
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!contains(event.relatedTarget)) scheduleDismissal();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
  };
  const activate = (keyboard: boolean) => {
    cancelDismissal();
    if (open && !keyboard) close();
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
    if (!enabled || !open) return;
    const onOutsidePointer = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node && (triggerRef.current?.contains(target) || contentRef.current?.contains(target)))) {
        suppressed.current = true;
        setOpen(false);
      }
    };
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      clearTimeout(timer.current);
      suppressed.current = true;
      setOpen(false);
      // Hover leaves focus untouched, including when dismissed from elsewhere.
      if (contentRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onOutsidePointer);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutsidePointer);
      document.removeEventListener("keydown", onEscape);
    };
  }, [enabled, open]);
  useEffect(() => () => clearTimeout(timer.current), [enabled]);

  return { open: enabled && open, triggerRef, contentRef, activate, close,
    interactionProps: { onPointerEnter, onPointerLeave, onFocus: cancelDismissal, onBlur, onKeyDown } };
}
