import { useCallback, useRef } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent, RefObject } from "react";

import {
  NAVIGATION_POPUP_DISMISS_DELAY,
  NAVIGATION_POPUP_FOCUS_DELAY,
} from "./navigationPopupConstants";
import {
  focusFirstInteractiveElement,
  isContained,
  shouldIgnoreEscape,
  supportsHover,
} from "./navigationPopupUtils";
import { useNavigationPopupTimer } from "./useNavigationPopupTimer";

interface Params {
  enabled: boolean;
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  setOpen: (open: boolean) => void;
}

export function useNavigationPopupHandlers({
  enabled,
  open,
  triggerRef,
  contentRef,
  setOpen,
}: Params) {
  const pointerInsideRef = useRef(false);
  const suppressedRef = useRef(false);
  const { cancel, schedule } = useNavigationPopupTimer(enabled);

  const contains = useCallback(
    (target: EventTarget | null) =>
      isContained(triggerRef.current, contentRef.current, target),
    [contentRef, triggerRef],
  );

  const close = useCallback(
    (restoreFocus = false) => {
      cancel();
      suppressedRef.current = true;
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    },
    [cancel, setOpen, triggerRef],
  );

  const scheduleDismissal = () => {
    schedule(() => {
      if (!pointerInsideRef.current && !contains(document.activeElement)) {
        setOpen(false);
      }
    }, NAVIGATION_POPUP_DISMISS_DELAY);
  };

  const onPointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (!enabled || !supportsHover(event.pointerType)) return;
    pointerInsideRef.current = true;
    cancel();
    if (!suppressedRef.current) setOpen(true);
  };

  const onPointerLeave = () => {
    if (!enabled) return;
    pointerInsideRef.current = false;
    suppressedRef.current = false;
    scheduleDismissal();
  };

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (enabled && !contains(event.relatedTarget)) scheduleDismissal();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!open || shouldIgnoreEscape(event)) return;
    event.preventDefault();
    event.stopPropagation();
    close(true);
  };

  const activate = (keyboard: boolean) => {
    if (!enabled) return;
    if (open && !keyboard) {
      close();
      return;
    }

    cancel();
    suppressedRef.current = false;
    setOpen(true);
    if (keyboard) {
      // Popper's kept-mounted content is available before the next render.
      schedule(
        () => focusFirstInteractiveElement(contentRef.current),
        NAVIGATION_POPUP_FOCUS_DELAY,
      );
    }
  };

  return {
    activate,
    close,
    contains,
    interactionProps: {
      onPointerEnter,
      onPointerLeave,
      onFocus: cancel,
      onBlur,
      onKeyDown,
    },
  };
}
