import { useId } from "react";

import ClickAwayListener from "@mui/material/ClickAwayListener";
import ListItem from "@mui/material/ListItem";

import { useIsMini } from "./useIsMini";
import { listItemSx } from "./navigationItemStyles";
import { FullItemContent, MiniItemContent } from "./NavigationItemContent";
import {
  ActionButton, LinkButton, ariaExpandedState, buttonCommonProps, describedByIds,
} from "./NavigationItemButton";
import { MiniPopper, useMiniPopper } from "./MiniPopper";

import type { ReactNode } from "react";
import type { MiniPopperState } from "./MiniPopper";

export type NavItemProps = {
  title: string;
  icon?: ReactNode;
  badge?: ReactNode;
  badgeDescriptionId?: string;
  hint?: string;
  href?: string;
  selected: boolean;
  onClick?: () => void;
  expanded?: boolean;
  hasChildren?: boolean;
  mini?: boolean;
  controlsId?: string;
  miniPopoverContent?: ReactNode;
};

/** A flyout only exists for a collapsed item that has something to show. */
const hasMiniPopup = (isMini: boolean, { hasChildren, miniPopoverContent }: NavItemProps) =>
  isMini && Boolean(hasChildren) && Boolean(miniPopoverContent);

type ItemButtonProps = {
  props: NavItemProps;
  isMini: boolean;
  hintId: string;
  hasPopup: boolean;
  popper: MiniPopperState;
};

/** Link or action button, wrapping the mini/full content. */
function ItemButton({ props, isMini, hintId, hasPopup, popper }: ItemButtonProps) {
  const { title, icon, badge, hint, href, selected, hasChildren = false, expanded = false } = props;
  const contentProps = { title, icon, badge, hint, hintId, hasChildren, expanded };
  const content = isMini ? <MiniItemContent {...contentProps} /> : <FullItemContent {...contentProps} />;
  const describedBy = describedByIds({ isMini, hint, hintId, badgeDescriptionId: props.badgeDescriptionId });
  const common = buttonCommonProps({ title, selected, isMini, describedBy });

  if (href) return <LinkButton href={href} selected={selected} common={common}>{content}</LinkButton>;

  return (
    <ActionButton
      common={common}
      anchorRef={popper.setAnchor}
      ariaExpanded={ariaExpandedState({ hasChildren, isMini, popupOpen: popper.popupOpen, expanded })}
      ariaControls={hasChildren ? props.controlsId : undefined}
      onClick={hasPopup ? popper.open : props.onClick}
    >
      {content}
    </ActionButton>
  );
}

export default function NavigationItem(props: NavItemProps) {
  const isMini = useIsMini(props.mini);
  const hasPopup = hasMiniPopup(isMini, props);
  const popper = useMiniPopper(hasPopup);
  const hintId = useId();

  return (
    <ClickAwayListener onClickAway={popper.close}>
      <ListItem
        sx={listItemSx}
        onMouseEnter={popper.onMouseEnter}
        onMouseLeave={popper.close}
        onKeyDown={popper.onKeyDown}
      >
        <ItemButton props={props} isMini={isMini} hintId={hintId} hasPopup={hasPopup} popper={popper} />
        {hasPopup && (
          <MiniPopper open={popper.popupOpen} anchor={popper.anchor} title={props.title} onClose={popper.close}>
            {props.miniPopoverContent}
          </MiniPopper>
        )}
      </ListItem>
    </ClickAwayListener>
  );
}
