import { useCallback } from "react";
import type {
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  RefObject,
} from "react";

type MutableRef<T> = { current: T };

import {
  NAVIGATION_POPUP_DISMISS_DELAY,
  NAVIGATION_POPUP_FOCUS_DELAY,
} from "./navigationPopupConstants";
import {
  focusFirstInteractiveElement,
  isContained,
  shouldDismiss,
  supportsHover,
} from "./navigationPopupUtils";

interface Params {
  enabled: boolean;
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  timerRef: MutableRef<ReturnType<typeof setTimeout> | undefined>;
  pointerInsideRef: MutableRef<boolean>;
  suppressedRef: MutableRef<boolean>;
  setOpen: (open: boolean) => void;
}

export function useNavigationPopupHandlers({
  enabled,
  open,
  triggerRef,
  contentRef,
  timerRef,
  pointerInsideRef,
  suppressedRef,
  setOpen,
}: Params) {
  const cancelDismissal = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, [timerRef]);

  const contains = useCallback(
    (target: EventTarget | null) =>
      isContained(triggerRef.current, contentRef.current, target),
    [contentRef, triggerRef],
  );

  const close = useCallback(
    (restoreFocus = false) => {
      cancelDismissal();
      suppressedRef.current = true;
      setOpen(false);

      if (restoreFocus) {
        triggerRef.current?.focus();
      }
    },
    [cancelDismissal, setOpen, suppressedRef, triggerRef],
  );

  const scheduleDismissal = useCallback(() => {
    cancelDismissal();
    timerRef.current = setTimeout(() => {
      const activeElementIsInside = contains(document.activeElement);
      if (shouldDismiss(pointerInsideRef.current, activeElementIsInside)) {
        setOpen(false);
      }
    }, NAVIGATION_POPUP_DISMISS_DELAY);
  }, [
    cancelDismissal,
    contains,
    pointerInsideRef,
    setOpen,
    timerRef,
  ]);

  const onPointerEnter = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!enabled || !supportsHover(event.pointerType)) return;

      pointerInsideRef.current = true;
      cancelDismissal();

      if (!suppressedRef.current) {
        setOpen(true);
      }
    },
    [
      cancelDismissal,
      enabled,
      pointerInsideRef,
      setOpen,
      suppressedRef,
    ],
  );

  const onPointerLeave = useCallback(() => {
    if (!enabled) return;

    pointerInsideRef.current = false;
    suppressedRef.current = false;
    scheduleDismissal();
  }, [enabled, pointerInsideRef, scheduleDismissal, suppressedRef]);

  const onBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (enabled && !contains(event.relatedTarget)) {
        scheduleDismissal();
      }
    },
    [contains, enabled, scheduleDismissal],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== "Escape" || !open) return;

      event.preventDefault();
      event.stopPropagation();
      close(true);
    },
    [close, open],
  );

  const activate = useCallback(
    (keyboard: boolean) => {
      if (!enabled) return;

      cancelDismissal();

      if (open && !keyboard) {
        close();
        return;
      }

      suppressedRef.current = false;
      setOpen(true);

      if (keyboard) {
        timerRef.current = setTimeout(() => {
          focusFirstInteractiveElement(contentRef.current);
        }, NAVIGATION_POPUP_FOCUS_DELAY);
      }
    },
    [
      cancelDismissal,
      close,
      contentRef,
      enabled,
      open,
      setOpen,
      suppressedRef,
      timerRef,
    ],
  );

  return {
    activate,
    close,
    contains,
    cancelDismissal,
    interactionProps: {
      onPointerEnter,
      onPointerLeave,
      onFocus: cancelDismissal,
      onBlur,
      onKeyDown,
    },
  };
}
