import { useEffect } from "react";
import type { RefObject } from "react";

interface Params {
  open: boolean;
  contains: (target: EventTarget | null) => boolean;
  close: (restoreFocus?: boolean) => void;
  contentRef: RefObject<HTMLElement | null>;
}

export function useNavigationPopupDocumentEffects({
  open,
  contains,
  close,
  contentRef,
}: Params) {
  useEffect(() => {
    if (!open) return;

    const onOutsidePointer = (event: globalThis.PointerEvent) => {
      if (!contains(event.target)) close();
    };

    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;

      const restoreFocus = Boolean(
        contentRef.current?.contains(document.activeElement),
      );
      close(restoreFocus);
    };

    document.addEventListener("pointerdown", onOutsidePointer);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("pointerdown", onOutsidePointer);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, contains, close, contentRef]);
}
