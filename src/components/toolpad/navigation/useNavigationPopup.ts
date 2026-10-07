import { useCallback, useEffect, useRef, useState } from "react";
import type {
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  RefObject,
} from "react";

const DISMISS_DELAY_MS = 150;
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex="0"]';

const supportsHover = (event: PointerEvent<HTMLElement>) =>
  event.pointerType === "mouse" &&
  window.matchMedia(HOVER_QUERY).matches;

const focusFirstItem = (content: HTMLElement | null) =>
  content?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

function useDocumentDismissal(
  active: boolean,
  contains: (node: EventTarget | null) => boolean,
  close: (restoreFocus?: boolean) => void,
  contentRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!active) return;

    const onOutsidePointer = (event: globalThis.PointerEvent) => {
      if (!contains(event.target)) close();
    };

    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      close(contentRef.current?.contains(document.activeElement) ?? false);
    };

    document.addEventListener("pointerdown", onOutsidePointer);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("pointerdown", onOutsidePointer);
      document.removeEventListener("keydown", onEscape);
    };
  }, [active, contains, close, contentRef]);
}

export default function useNavigationPopup(enabled: boolean) {
  const [open, setOpen] = useState(false);
  const [previousEnabled, setPreviousEnabled] = useState(enabled);

  if (previousEnabled !== enabled) {
    setPreviousEnabled(enabled);
    setOpen(false);
  }

  const effectiveOpen = enabled && open;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const pointerInside = useRef(false);
  const suppressed = useRef(false);

  const cancelDismissal = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  const contains = useCallback(
    (node: EventTarget | null) =>
      node instanceof Node &&
      (triggerRef.current?.contains(node) ||
        contentRef.current?.contains(node) ||
        false),
    [],
  );

  const close = useCallback(
    (restoreFocus = false) => {
      cancelDismissal();
      suppressed.current = true;
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    },
    [cancelDismissal],
  );

  const scheduleDismissal = () => {
    cancelDismissal();
    timer.current = setTimeout(() => {
      if (!pointerInside.current && !contains(document.activeElement)) {
        setOpen(false);
      }
    }, DISMISS_DELAY_MS);
  };

  const onPointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (!enabled || !supportsHover(event)) return;

    pointerInside.current = true;
    cancelDismissal();

    if (!suppressed.current) setOpen(true);
  };

  const onPointerLeave = () => {
    if (!enabled) return;

    pointerInside.current = false;
    suppressed.current = false;
    scheduleDismissal();
  };

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (enabled && !contains(event.relatedTarget)) scheduleDismissal();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape" || !effectiveOpen) return;

    event.preventDefault();
    event.stopPropagation();
    close(true);
  };

  const activate = (keyboard: boolean) => {
    if (!enabled) return;

    cancelDismissal();

    if (effectiveOpen && !keyboard) {
      close();
      return;
    }

    suppressed.current = false;
    setOpen(true);

    if (keyboard) {
      timer.current = setTimeout(
        () => focusFirstItem(contentRef.current),
        0,
      );
    }
  };

  useDocumentDismissal(effectiveOpen, contains, close, contentRef);

  useEffect(() => {
    if (!enabled) cancelDismissal();
  }, [enabled, cancelDismissal]);

  useEffect(() => cancelDismissal, [cancelDismissal]);

  return {
    open: effectiveOpen,
    triggerRef,
    contentRef,
    activate,
    close,
    interactionProps: {
      onPointerEnter,
      onPointerLeave,
      onFocus: cancelDismissal,
      onBlur,
      onKeyDown,
    },
  };
}
