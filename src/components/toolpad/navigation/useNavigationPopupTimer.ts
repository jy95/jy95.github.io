import { useCallback, useEffect, useRef } from "react";

// Focus entry and dismissal share one timer so either action cancels stale work.
export function useNavigationPopupTimer(enabled: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  const schedule = (callback: () => void, delay: number) => {
    cancel();
    timerRef.current = setTimeout(() => {
      timerRef.current = undefined;
      callback();
    }, delay);
  };

  useEffect(() => {
    if (!enabled) cancel();
    return cancel;
  }, [enabled, cancel]);

  return { cancel, schedule };
}
