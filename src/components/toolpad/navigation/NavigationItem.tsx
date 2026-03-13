"use client";

import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Grow from "@mui/material/Grow";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link } from "@/i18n/routing";
import { useAppContext } from "../provider/useAppContext";
import { MINI_DRAWER_WIDTH } from "../DashboardSidebar";

const LIST_ITEM_ICON_SIZE = 34;

// Matches Toolpad's NavigationListItemButton styled component exactly
const NavigationListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 8,
  "&.Mui-selected": {
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.dark,
    },
    "& .MuiTypography-root": {
      color: theme.palette.primary.dark,
    },
    "& .MuiSvgIcon-root": {
      color: theme.palette.primary.dark,
    },
    "& .MuiAvatar-root": {
      backgroundColor: theme.palette.primary.dark,
    },
    "& .MuiTouchRipple-child": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  "& .MuiSvgIcon-root": {
    color: theme.palette.action.active,
  },
  "& .MuiAvatar-root": {
    backgroundColor: theme.palette.action.active,
  },
}));

export type NavItemProps = {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  selected: boolean;
  onClick?: () => void;
  /** True when the item has children (controls expand icon rendering) */
  hasChildren?: boolean;
  /** Whether the children list is currently expanded (controls icon rotation) */
  expanded?: boolean;
  /** Content rendered in the mini hover popover (only used when isMini && hasChildren) */
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

  // Initials for Avatar fallback in mini mode (when no icon)
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  return (
    <ListItem
      sx={{ py: 0, px: 1, overflowX: "hidden" }}
      {...(isMini && hasChildren
        ? {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => setHovered(false),
          }
        : {})}
    >
      <NavigationListItemButton
        // @ts-ignore - MUI's ListItemButtonProps doesn't allow component to be a next Link, but it works fine
        component={href ? (Link as any) : "div"}
        href={href}
        selected={selected}
        onClick={onClick}
        sx={{
          px: 1.4,
          // Mini items are taller to accommodate icon + caption
          height: isMini ? 60 : 48,
          position: "relative",
        }}
      >
        {/* ── Icon area ───────────────────────────────────────────────────── */}
        {(icon || isMini) ? (
          <Box
            sx={
              isMini
                ? {
                    // Centered absolutely — matches Toolpad's mini icon positioning
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
              {/* Fallback Avatar with initials when no icon in mini mode */}
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

            {/* Caption label below icon in mini mode */}
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

        {/* ── Text (expanded mode only) ───────────────────────────────────── */}
        {!isMini ? (
          <ListItemText
            primary={title}
            sx={{ ml: 1.2, whiteSpace: "nowrap", zIndex: 1 }}
          />
        ) : null}

        {/* ── Expand chevron — rotates with CSS transition (expanded mode) ── */}
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

        {/* ── Small right-arrow chevron in mini mode for items with children ── */}
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
      </NavigationListItemButton>

      {/* ── Hover popover for child navigation in mini mode ─────────────── */}
      {isMini && hasChildren && miniPopoverContent ? (
        <Grow in={hovered}>
          <Box
            sx={{
              position: "fixed",
              left: MINI_DRAWER_WIDTH - 2,
              pl: "6px",
            }}
          >
            <Paper sx={{ pt: 0.5, pb: 0.5, transform: "translateY(calc(50% - 30px))" }}>
              {miniPopoverContent}
            </Paper>
          </Box>
        </Grow>
      ) : null}
    </ListItem>
  );
}