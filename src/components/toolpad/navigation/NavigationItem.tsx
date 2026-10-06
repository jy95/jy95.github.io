import { useRef, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Grow from "@mui/material/Grow";
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
  icon?: ReactNode;
  href?: string;
  selected: boolean;
  onClick?: () => void;
  hasChildren?: boolean;
  expanded?: boolean;
  miniPopoverContent?: ReactNode;
};

export default function NavigationItem({
  title,
  icon,
  href,
  selected,
  onClick,
  hasChildren = false,
  expanded = false,
  miniPopoverContent,
}: NavItemProps) {
  const { drawerOpen = true } = useAppContext();
  const isMini = !drawerOpen;

  const [hovered, setHovered] = useState(false);
  const listItemRef = useRef<HTMLLIElement>(null);

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
    height: isMini ? 60 : 48,
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
            {iconNode}
          </ListItemIcon>
          {isMini && (
            <Typography variant="caption" sx={MINI_CAPTION_SX}>
              {title}
            </Typography>
          )}
        </Box>
      )}
      {!isMini && <ListItemText primary={title} sx={{ ml: 1.2, whiteSpace: "nowrap", zIndex: 1 }} />}
      {hasChildren && <ExpandMoreIcon sx={chevronSx} />}
    </>
  );

  const showPopover = isMini && hasChildren && Boolean(miniPopoverContent);

  return (
    <ListItem
      ref={listItemRef}
      sx={{ py: 0, px: 1, overflowX: "hidden" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {href ? (
        <ListItemButton
          component={Link}
          // Built from route segments at runtime (see NavigationGroup.tsx), so it
          // can't be checked statically against `routing.pathnames`.
          href={href as Href}
          selected={selected}
          sx={buttonSx}
        >
          {content}
        </ListItemButton>
      ) : (
        <ListItemButton component="div" selected={selected} onClick={onClick} sx={buttonSx}>
          {content}
        </ListItemButton>
      )}

      {/* Popper portals into document.body, so the drawer's overflow:hidden can't clip it. */}
      {showPopover && (
        <Popper
          open={hovered}
          anchorEl={listItemRef.current}
          placement="right-start"
          transition
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps} style={{ transformOrigin: "left top" }}>
              <Paper elevation={1} sx={{ py: 0.5, ml: "6px" }}>
                {miniPopoverContent}
              </Paper>
            </Grow>
          )}
        </Popper>
      )}
    </ListItem>
  );
}
