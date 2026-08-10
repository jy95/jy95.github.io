"use client";

import React, { useRef, useState } from "react";
import { styled } from "@mui/material/styles";
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
import type { Href } from "@/i18n/routing";
import { useAppContext } from "../provider/useAppContext";
import { MINI_DRAWER_WIDTH } from "../DashboardSidebar";

const LIST_ITEM_ICON_SIZE = 34;

/**
 * Faithful copy of Toolpad's NavigationListItemButton styles.
 *
 * Critical: use `(theme.vars ?? theme).palette.x` everywhere so that the
 * generated CSS uses MUI CSS-variable references. Without this, plain
 * `theme.palette.x` bakes in the light-mode value at build time and dark
 * mode colours never apply.
 *
 * Non-selected state: only .MuiSvgIcon-root and .MuiAvatar-root are
 * overridden — no ListItemIcon colour, no text colour — both inherit from
 * the theme naturally and therefore work correctly in dark mode.
 *
 * Defined as sx prop object to preserve polymorphic component typing.
 */
const navigationListItemButtonSx = {
  borderRadius: 2,
  // Non-selected: icon SVGs use action.active (adapts in dark mode via CSS vars)
  "& .MuiSvgIcon-root": {
    color: (theme: any) => (theme.vars ?? theme).palette.action.active,
  },
  "& .MuiAvatar-root": {
    backgroundColor: (theme: any) => (theme.vars ?? theme).palette.action.active,
  },
  // Selected: primary.dark accent for all children; no background tint
  "&.Mui-selected": {
    "& .MuiListItemIcon-root": {
      color: (theme: any) => (theme.vars ?? theme).palette.primary.dark,
    },
    "& .MuiTypography-root": {
      color: (theme: any) => (theme.vars ?? theme).palette.primary.dark,
    },
    "& .MuiSvgIcon-root": {
      color: (theme: any) => (theme.vars ?? theme).palette.primary.dark,
    },
    "& .MuiAvatar-root": {
      backgroundColor: (theme: any) => (theme.vars ?? theme).palette.primary.dark,
    },
    "& .MuiTouchRipple-child": {
      backgroundColor: (theme: any) => (theme.vars ?? theme).palette.primary.dark,
    },
  },
} as const;

export type NavItemProps = {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  selected: boolean;
  onClick?: () => void;
  hasChildren?: boolean;
  expanded?: boolean;
  miniPopoverContent?: React.ReactNode;
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
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  const buttonSx = {
    px: 1.4,
    height: isMini ? 60 : 48,
    position: "relative",
  } as const;

  // Shared content for both branches below — kept as a single JSX value so
  // the two ListItemButton variants (link vs. plain) don't duplicate markup.
  const buttonContent = (
    <>
      {/* ── Icon / Avatar area ───────────────────────────────────────── */}
      {(icon || isMini) ? (
        <Box
          sx={
            isMini
              ? {
                  position: "absolute",
                  left: "50%",
                  top: "calc(50% - 6px)",
                  transform: "translate(-50%, -50%)",
                }
              : {}
          }
        >
          <ListItemIcon
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: LIST_ITEM_ICON_SIZE,
            }}
          >
            {icon ?? null}
            {!icon && isMini ? (
              <Avatar
                sx={{
                  width: LIST_ITEM_ICON_SIZE - 7,
                  height: LIST_ITEM_ICON_SIZE - 7,
                  fontSize: 12,
                }}
              >
                {initials}
              </Avatar>
            ) : null}
          </ListItemIcon>

          {/* Caption below icon in mini mode — inherits colour from button */}
          {isMini ? (
            <Typography
              variant="caption"
              sx={{
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
              }}
            >
              {title}
            </Typography>
          ) : null}
        </Box>
      ) : null}

      {/* ── Text (expanded mode only) ────────────────────────────────── */}
      {!isMini ? (
        <ListItemText
          primary={title}
          sx={{ ml: 1.2, whiteSpace: "nowrap", zIndex: 1 }}
        />
      ) : null}

      {/* ── Expand chevron with rotation transition (expanded mode) ───── */}
      {hasChildren && !isMini ? (
        <ExpandMoreIcon
          sx={{
            ml: 0.5,
            transform: `rotate(${expanded ? 0 : -90}deg)`,
            transition: (theme) =>
              theme.transitions.create("transform", {
                easing: theme.transitions.easing.sharp,
                duration: 100,
              }),
          }}
        />
      ) : null}

      {/* ── Small right-arrow for mini items with children ─────────── */}
      {hasChildren && isMini ? (
        <ExpandMoreIcon
          sx={{
            fontSize: 18,
            position: "absolute",
            top: "41.5%",
            right: "2px",
            transform: "translateY(-50%) rotate(-90deg)",
          }}
        />
      ) : null}
    </>
  );

  return (
    <ListItem
      ref={listItemRef}
      sx={{ py: 0, px: 1, overflowX: "hidden" }}
      {...(isMini && hasChildren
        ? {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => setHovered(false),
          }
        : {})}
    >
      {href ? (
        <ListItemButton
          component={Link}
          // `href` is built by the caller by concatenating route segments
          // at runtime (see NavigationGroup.tsx), so it can't be statically
          // checked against the finite `routing.pathnames` union — it's
          // still guaranteed valid since it's derived from the same
          // segment strings the routes are defined with.
          href={href as Href}
          selected={selected}
          sx={{ ...navigationListItemButtonSx, ...buttonSx }}
        >
          {buttonContent}
        </ListItemButton>
      ) : (
        <ListItemButton
          component="div"
          selected={selected}
          onClick={onClick}
          sx={{ ...navigationListItemButtonSx, ...buttonSx }}
        >
          {buttonContent}
        </ListItemButton>
      )}

      {/*
       * Mini hover popover — uses MUI Popper (portal into document.body) so
       * the drawer's overflow:hidden ancestor cannot clip it.
       */}
      {isMini && hasChildren && miniPopoverContent ? (
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
      ) : null}
    </ListItem>
  );
}