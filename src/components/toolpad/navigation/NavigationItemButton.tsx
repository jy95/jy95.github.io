import ListItemButton from "@mui/material/ListItemButton";

import { Link } from "@/i18n/routing";
import { buttonStateSx } from "./navigationItemStyles";

import type { ReactNode } from "react";
import type { Href } from "@/i18n/routing";

type DescribedByInput = { isMini: boolean; hint?: string; hintId: string; badgeDescriptionId?: string };

/** The hint only describes the button when it is actually rendered (full mode). */
export function describedByIds({ isMini, hint, hintId, badgeDescriptionId }: DescribedByInput): string | undefined {
  return [!isMini && hint ? hintId : undefined, badgeDescriptionId].filter(Boolean).join(" ") || undefined;
}

type CommonInput = { title: string; selected: boolean; isMini: boolean; describedBy?: string };

/** Props shared by the link and the action variants of the button. */
export function buttonCommonProps({ title, selected, isMini, describedBy }: CommonInput) {
  return {
    "aria-label": title,
    "aria-describedby": describedBy,
    selected,
    sx: buttonStateSx(isMini),
  };
}

export type ButtonCommonProps = ReturnType<typeof buttonCommonProps>;

type ExpandedInput = { hasChildren: boolean; isMini: boolean; popupOpen: boolean; expanded: boolean };

/** Mini items report the popup state; full items report the inline disclosure state. */
export function ariaExpandedState({ hasChildren, isMini, popupOpen, expanded }: ExpandedInput): boolean | undefined {
  if (!hasChildren) return undefined;
  return isMini ? popupOpen : expanded;
}

type LinkButtonProps = { href: string; selected: boolean; common: ButtonCommonProps; children: ReactNode };

export function LinkButton({ href, selected, common, children }: LinkButtonProps) {
  return (
    <ListItemButton component={Link} href={href as Href} aria-current={selected ? "page" : undefined} {...common}>
      {children}
    </ListItemButton>
  );
}

type ActionButtonProps = {
  common: ButtonCommonProps;
  anchorRef: (element: HTMLElement | null) => void;
  ariaExpanded?: boolean;
  ariaControls?: string;
  onClick?: () => void;
  children: ReactNode;
};

export function ActionButton({ common, anchorRef, ariaExpanded, ariaControls, onClick, children }: ActionButtonProps) {
  return (
    <ListItemButton
      component="button"
      type="button"
      ref={anchorRef}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      onClick={onClick}
      {...common}
    >
      {children}
    </ListItemButton>
  );
}
