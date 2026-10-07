import { useId, useRef, useState } from "react";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Link } from "@/i18n/routing";
import { useAppContext } from "../provider/useAppContext";
import { MINI_DRAWER_WIDTH } from "../drawerConstants";

import { navigationListItemButtonSx } from "./navigationStyles";

import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import type { Href } from "@/i18n/routing";

const LIST_ITEM_ICON_SIZE = 34;

const itemButtonSx = {
  ...navigationListItemButtonSx,
  "&.Mui-selected": {
    ...navigationListItemButtonSx["&.Mui-selected"],
    "& .MuiAvatar-root": {
      backgroundColor: (theme: Theme) => (theme.vars ?? theme).palette.primary.dark,
    },
  },
} as const;

// In mini mode the icon, its caption and the chevron are positioned absolutely.
const MINI_ICON_SX = {
  position: "absolute",
  left: "50%",
  top: "calc(50% - 6px)",
  transform: "translate(-50%, -50%)",
} as const;

const MINI_CAPTION_SX = {
  position: "absolute",
  bottom: -18,
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: 10,
  fontWeight: 500,
  textAlign: "center",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: MINI_DRAWER_WIDTH - 28,
} as const;

const MINI_CHEVRON_SX = {
  fontSize: 18,
  position: "absolute",
  top: "41.5%",
  right: "2px",
  transform: "translateY(-50%) rotate(-90deg)",
} as const;

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

export default function NavigationItem({
  title,
  mini,
  controlsId,
  badgeDescriptionId,
  icon,
  badge,
  hint,
  href,
  selected,
  onClick,
  hasChildren = false,
  expanded = false,
  miniPopoverContent,
}: NavItemProps) {
  const { drawerOpen = true } = useAppContext();
  const isMini = mini ?? !drawerOpen;
  const hintId = useId();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const controlRef = useRef<HTMLButtonElement>(null);

  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  // Mini mode without an icon falls back to an avatar with the title's initials.
  const iconNode =
    icon ||
    (isMini && (
      <Avatar sx={{ width: LIST_ITEM_ICON_SIZE - 7, height: LIST_ITEM_ICON_SIZE - 7, fontSize: 12 }}>
        {initials}
      </Avatar>
    ));

  const chevronSx = isMini
    ? MINI_CHEVRON_SX
    : {
        ml: 0.5,
        transform: `rotate(${expanded ? 0 : -90}deg)`,
        transition: (theme: Theme) =>
          theme.transitions.create("transform", {
            easing: theme.transitions.easing.sharp,
            duration: 100,
          }),
      };

  const buttonSx = {
    ...itemButtonSx,
    px: 1.4,
    minHeight: isMini ? 60 : 48,
    py: 1,
    width: "100%",
    "&.Mui-focusVisible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
    position: "relative",
  } as const;

  // Shared by the link and plain variants below.
  const content = (
    <>
      {iconNode && (
        <Box sx={isMini ? MINI_ICON_SX : undefined}>
          <ListItemIcon
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: LIST_ITEM_ICON_SIZE }}
          >
            <Box component="span" aria-hidden="true">{iconNode}</Box>
            {isMini && badge && <Box sx={{ position: "absolute", top: -5, right: -8 }}>{badge}</Box>}
          </ListItemIcon>
          {isMini && (
            <Typography variant="caption" sx={MINI_CAPTION_SX}>
              {title}
            </Typography>
          )}
        </Box>
      )}
      {!isMini && (
        <ListItemText primary={title} secondary={hint}
          slotProps={{ secondary: { id: hintId, sx: { whiteSpace: "normal", fontSize: 12 } } }}
          sx={{ ml: 1.2, minWidth: 0, whiteSpace: "normal", zIndex: 1 }} />
      )}
      {!isMini && badge}
      {hasChildren && <ExpandMoreIcon aria-hidden="true" sx={chevronSx} />}
    </>
  );

  const showPopover = isMini && hasChildren && Boolean(miniPopoverContent);

  return (
    <ListItem
      sx={{ py: 0, px: 1, overflow: "visible" }}
    >
      {href ? (
        <ListItemButton
          component={Link}
          // Built from route segments at runtime (see NavigationGroup.tsx), so it
          // can't be checked statically against `routing.pathnames`.
          href={href as Href}
          aria-label={title}
          aria-current={selected ? "page" : undefined}
          aria-describedby={[!isMini && hint ? hintId : undefined, badgeDescriptionId].filter(Boolean).join(" ") || undefined}
          selected={selected}
          sx={buttonSx}
        >
          {content}
        </ListItemButton>
      ) : (
        <ListItemButton component="button" type="button" ref={controlRef} aria-label={title}
          aria-expanded={hasChildren ? (isMini ? popoverOpen : expanded) : undefined}
          aria-controls={hasChildren ? controlsId : undefined}
          selected={selected} onClick={isMini && hasChildren ? () => setPopoverOpen(value => !value) : onClick} sx={buttonSx}>
          {content}
        </ListItemButton>
      )}

      {showPopover && (
        <Popover keepMounted open={popoverOpen} anchorEl={controlRef.current} onClose={() => setPopoverOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{ paper: { sx: { ml: 0.75, maxHeight: "80vh" } } }}>
          <Paper component="nav" aria-label={title} elevation={0} sx={{ py: 0.5 }} onClick={event => {
            if (event.target instanceof Element && event.target.closest("a")) setPopoverOpen(false);
          }}>{miniPopoverContent}</Paper>
        </Popover>
      )}
    </ListItem>
  );
}
