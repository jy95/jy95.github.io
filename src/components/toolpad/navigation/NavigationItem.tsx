import { useId, useState } from "react";

import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Link } from "@/i18n/routing";
import { useAppContext } from "../provider/useAppContext";
import { MINI_DRAWER_WIDTH } from "../drawerConstants";
import { navigationListItemButtonSx } from "./navigationStyles";

import type { MouseEvent, ReactNode } from "react";
import type { Href } from "@/i18n/routing";

export type NavItemProps = {
  title: string;
  mini?: boolean;
  controlsId?: string;
  badgeDescriptionId?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  hint?: string;
  href?: string;
  selected: boolean;
  onClick?: () => void;
  hasChildren?: boolean;
  expanded?: boolean;
  miniPopoverContent?: ReactNode;
};

const buttonSx = {
  ...navigationListItemButtonSx,
  position: "relative",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  px: 1.4,
  py: 1,
} as const;

const miniIconSx = { position: "absolute", left: "50%", top: "calc(50% - 6px)", transform: "translate(-50%, -50%)" } as const;
const miniCaptionSx = {
  position: "absolute", bottom: -18, left: "50%", transform: "translateX(-50%)",
  fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  maxWidth: MINI_DRAWER_WIDTH - 28,
} as const;

type ButtonCommonProps = {
  "aria-label": string;
  "aria-describedby": string | undefined;
  selected: boolean;
  sx: typeof buttonSx & { minHeight: number };
};

type ItemContentProps = Pick<NavItemProps, "title" | "icon" | "badge" | "hasChildren" | "expanded">;

function getDescribedBy(
  isMini: boolean,
  hint: string | undefined,
  hintId: string,
  badgeDescriptionId: string | undefined,
): string | undefined {
  const hintDescriptionId = !isMini && hint ? hintId : undefined;
  return [hintDescriptionId, badgeDescriptionId].filter(Boolean).join(" ") || undefined;
}

function getButtonCommonProps(
  title: string,
  describedBy: string | undefined,
  selected: boolean,
  isMini: boolean,
): ButtonCommonProps {
  return {
    "aria-label": title,
    "aria-describedby": describedBy,
    selected,
    sx: { ...buttonSx, minHeight: isMini ? 60 : 48 },
  };
}

function MiniItemContent({ title, icon, badge, hasChildren }: ItemContentProps) {
  return (
    <>
      <Box sx={miniIconSx}>
        <ListItemIcon sx={{ justifyContent: "center", minWidth: 34 }}>
          <Box component="span" aria-hidden="true">{icon}</Box>
          {badge && <Box sx={{ position: "absolute", top: -5, right: -8 }}>{badge}</Box>}
        </ListItemIcon>
        <Typography variant="caption" sx={miniCaptionSx}>{title}</Typography>
      </Box>
      {hasChildren && (
        <ExpandMoreIcon aria-hidden="true" sx={{
          flexShrink: 0,
          transform: "rotate(-90deg)",
          position: "absolute",
          top: 14,
          right: 2,
          fontSize: 18,
        }} />
      )}
    </>
  );
}

function FullItemContent({
  title,
  icon,
  badge,
  hasChildren,
  expanded,
  hint,
  hintId,
}: ItemContentProps & { hint?: string; hintId: string }) {
  return (
    <>
      <Box sx={{ flexShrink: 0 }}>
        <ListItemIcon sx={{ justifyContent: "center", minWidth: 34 }}>
          <Box component="span" aria-hidden="true">{icon}</Box>
        </ListItemIcon>
      </Box>
      <ListItemText
        primary={title}
        secondary={hint}
        sx={{ ml: 1.2, minWidth: 0 }}
        slotProps={{
          primary: { sx: { whiteSpace: "normal", overflowWrap: "anywhere" } },
          secondary: { id: hintId, sx: { whiteSpace: "normal", overflowWrap: "anywhere", fontSize: 12 } },
        }}
      />
      {badge && <Box component="span" sx={{ display: "inline-flex", flexShrink: 0 }}>{badge}</Box>}
      {hasChildren && (
        <ExpandMoreIcon aria-hidden="true" sx={{
          flexShrink: 0,
          transform: `rotate(${expanded ? 0 : -90}deg)`,
          ml: 0.5,
        }} />
      )}
    </>
  );
}

type LinkButtonProps = {
  href: string;
  common: ButtonCommonProps;
  children: ReactNode;
};

function LinkButton({ href, common, children }: LinkButtonProps) {
  return (
    <ListItemButton
      component={Link}
      href={href as Href}
      aria-current={common.selected ? "page" : undefined}
      {...common}
    >
      {children}
    </ListItemButton>
  );
}

type ActionButtonProps = {
  common: ButtonCommonProps;
  children: ReactNode;
  anchorRef: (node: HTMLElement | null) => void;
  hasChildren: boolean;
  isMini: boolean;
  popupOpen: boolean;
  expanded: boolean;
  controlsId?: string;
  hasPopup: boolean;
  onPopupOpen: () => void;
  onClick?: () => void;
};

function ActionButton({
  common,
  children,
  anchorRef,
  hasChildren,
  isMini,
  popupOpen,
  expanded,
  controlsId,
  hasPopup,
  onPopupOpen,
  onClick,
}: ActionButtonProps) {
  return (
    <ListItemButton
      component="button"
      type="button"
      ref={anchorRef}
      aria-expanded={hasChildren ? (isMini ? popupOpen : expanded) : undefined}
      aria-controls={hasChildren ? controlsId : undefined}
      onClick={hasPopup ? onPopupOpen : onClick}
      {...common}
    >
      {children}
    </ListItemButton>
  );
}

type MiniPopperProps = {
  title: string;
  anchor: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
};

function MiniPopper({ title, anchor, open, onClose, children }: MiniPopperProps) {
  const closeOnLinkClick = (event: MouseEvent<HTMLElement>) => {
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest("a")) return;
    onClose();
  };

  return (
    <Popper keepMounted open={open} anchorEl={anchor} placement="right-start"
      sx={{ zIndex: theme => theme.zIndex.drawer + 2, pl: 0.75 }}>
      <Paper component="nav" aria-label={title} elevation={1}
        sx={{ py: 0.5, width: 300, maxWidth: "85vw", boxSizing: "border-box",
          maxHeight: "80vh", overflowX: "hidden", overflowY: "auto" }}
        onClick={closeOnLinkClick}>
        {children}
      </Paper>
    </Popper>
  );
}

export default function NavigationItem(props: NavItemProps) {
  const {
    title, icon, badge, hint, href, selected, hasChildren = false, expanded = false,
    controlsId, badgeDescriptionId, miniPopoverContent, onClick,
  } = props;
  const { drawerOpen = true } = useAppContext();
  const isMini = props.mini ?? !drawerOpen;
  const hintId = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  const hasPopup = isMini && hasChildren && Boolean(miniPopoverContent);
  const popupOpen = hasPopup && open;
  const describedBy = getDescribedBy(isMini, hint, hintId, badgeDescriptionId);
  const common = getButtonCommonProps(title, describedBy, selected, isMini);
  const content = isMini
    ? <MiniItemContent title={title} icon={icon} badge={badge} hasChildren={hasChildren} expanded={expanded} />
    : <FullItemContent title={title} icon={icon} badge={badge} hasChildren={hasChildren}
        expanded={expanded} hint={hint} hintId={hintId} />;
  const openPopup = () => setOpen(true);
  const closePopup = () => setOpen(false);
  const button = href
    ? <LinkButton href={href} common={common}>{content}</LinkButton>
    : <ActionButton common={common} anchorRef={setAnchor} hasChildren={hasChildren}
        isMini={isMini} popupOpen={popupOpen} expanded={expanded} controlsId={controlsId}
        hasPopup={hasPopup} onPopupOpen={openPopup} onClick={onClick}>
        {content}
      </ActionButton>;

  return (
    <ClickAwayListener onClickAway={closePopup}>
      <ListItem
        sx={{ py: 0, px: 1, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "visible" }}
        onMouseEnter={() => hasPopup && setOpen(true)}
        onMouseLeave={closePopup}
        onKeyDown={event => event.key === "Escape" && setOpen(false)}
      >
        {button}
        {hasPopup && (
          <MiniPopper title={title} anchor={anchor} open={popupOpen} onClose={closePopup}>
            {miniPopoverContent}
          </MiniPopper>
        )}
      </ListItem>
    </ClickAwayListener>
  );
}
