import type { MouseEvent } from "react";

const isPlainPrimaryClick = (event: MouseEvent<HTMLElement>): boolean =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

const findLink = (event: MouseEvent<HTMLElement>): Element | null =>
  event.target instanceof Element ? event.target.closest("a[href]") : null;

const staysInCurrentContext = (link: Element): boolean => {
  const target = link.getAttribute("target");
  return !target || target === "_self";
};

/** True for an unmodified click on a same-tab, non-download link. */
export function isSameContextNavigation(
  event: MouseEvent<HTMLElement>,
): boolean {
  if (!isPlainPrimaryClick(event)) return false;

  const link = findLink(event);
  return (
    link !== null &&
    staysInCurrentContext(link) &&
    !link.hasAttribute("download")
  );
}
