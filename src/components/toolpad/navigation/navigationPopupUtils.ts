import {
  NAVIGATION_POPUP_HOVER_MEDIA_QUERY,
  NAVIGATION_POPUP_INTERACTIVE_SELECTOR,
} from "./navigationPopupConstants";

export function isContained(
  trigger: HTMLElement | null,
  content: HTMLElement | null,
  target: EventTarget | null,
) {
  if (!(target instanceof Node)) return false;

  return Boolean(trigger?.contains(target) || content?.contains(target));
}

export function supportsHover(pointerType: string) {
  return (
    pointerType === "mouse" &&
    window.matchMedia(NAVIGATION_POPUP_HOVER_MEDIA_QUERY).matches
  );
}

export function focusFirstInteractiveElement(content: HTMLElement | null) {
  content?.querySelector<HTMLElement>(NAVIGATION_POPUP_INTERACTIVE_SELECTOR)?.focus();
}

export function shouldIgnoreEscape(event: Pick<KeyboardEvent, "key" | "defaultPrevented">) {
  return event.key !== "Escape" || event.defaultPrevented;
}
