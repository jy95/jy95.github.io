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

import type { ReactNode } from "react";
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
  px: 1.4,
  py: 1,
} as const;

const miniIconSx = { position: "absolute", left: "50%", top: "calc(50% - 6px)", transform: "translate(-50%, -50%)" } as const;
const miniCaptionSx = {
  position: "absolute", bottom: -18, left: "50%", transform: "translateX(-50%)",
  fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  maxWidth: MINI_DRAWER_WIDTH - 28,
} as const;

export default function NavigationItem(props: NavItemProps) {
  const { title, icon, badge, hint, href, selected, hasChildren = false, expanded = false } = props;
  const { drawerOpen = true } = useAppContext();
  const isMini = props.mini ?? !drawerOpen;
  const hintId = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  const hasPopup = isMini && hasChildren && Boolean(props.miniPopoverContent);
  const popupOpen = hasPopup && open;

  const describedBy = [!isMini && hint ? hintId : undefined, props.badgeDescriptionId].filter(Boolean).join(" ") || undefined;

  const content = (
    <>
      <Box sx={isMini ? miniIconSx : undefined}>
        <ListItemIcon sx={{ justifyContent: "center", minWidth: 34 }}>
          <Box component="span" aria-hidden="true">{icon}</Box>
          {isMini && badge && <Box sx={{ position: "absolute", top: -5, right: -8 }}>{badge}</Box>}
        </ListItemIcon>
        {isMini && <Typography variant="caption" sx={miniCaptionSx}>{title}</Typography>}
      </Box>
      {!isMini && (
        <>
          <ListItemText primary={title} secondary={hint} sx={{ ml: 1.2, minWidth: 0 }}
            slotProps={{ secondary: { id: hintId, sx: { whiteSpace: "normal", fontSize: 12 } } }} />
          {badge}
        </>
      )}
      {hasChildren && (
        <ExpandMoreIcon aria-hidden="true" sx={{
          transform: `rotate(${expanded && !isMini ? 0 : -90}deg)`,
          ...(isMini ? { position: "absolute", top: 14, right: 2, fontSize: 18 } : { ml: 0.5 }),
        }} />
      )}
    </>
  );

  const common = {
    "aria-label": title,
    "aria-describedby": describedBy,
    selected,
    sx: { ...buttonSx, minHeight: isMini ? 60 : 48 },
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <ListItem
        sx={{ py: 0, px: 1, overflow: "visible" }}
        onMouseEnter={() => hasPopup && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onKeyDown={event => event.key === "Escape" && setOpen(false)}
      >
        {href ? (
          <ListItemButton component={Link} href={href as Href} aria-current={selected ? "page" : undefined} {...common}>
            {content}
          </ListItemButton>
        ) : (
          <ListItemButton
            component="button"
            type="button"
            ref={setAnchor}
            aria-expanded={hasChildren ? (isMini ? popupOpen : expanded) : undefined}
            aria-controls={hasChildren ? props.controlsId : undefined}
            onClick={hasPopup ? () => setOpen(true) : props.onClick}
            {...common}
          >
            {content}
          </ListItemButton>
        )}

        {hasPopup && (
          <Popper keepMounted open={popupOpen} anchorEl={anchor} placement="right-start"
            sx={{ zIndex: theme => theme.zIndex.drawer + 2, pl: 0.75 }}>
            <Paper component="nav" aria-label={title} elevation={1}
              sx={{ py: 0.5, maxHeight: "80vh", overflowY: "auto" }}
              onClick={event => event.target instanceof Element && event.target.closest("a") && setOpen(false)}>
              {props.miniPopoverContent}
            </Paper>
          </Popper>
        )}
      </ListItem>
    </ClickAwayListener>
  );
}