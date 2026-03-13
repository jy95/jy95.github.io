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

/**
 * Matches Toolpad's NavigationListItemButton styling:
 * - Non-selected: text.primary for text; text.secondary for icons/avatar
 * - Selected: primary.dark for icon, text and ripple; no background change
 */
const NavigationListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 8,
  // Non-selected state — explicit colours so dark mode works correctly
  "& .MuiListItemText-primary": {
    color: theme.palette.text.primary,
  },
  "& .MuiSvgIcon-root": {
    color: theme.palette.text.secondary,
  },
  "& .MuiAvatar-root": {
    backgroundColor: theme.palette.text.secondary,
  },
  // Selected state
  "&.Mui-selected": {
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.dark,
    },
    "& .MuiListItemText-primary": {
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
}));

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

  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  return (
    <ListItem
      sx={{
        py: 0,
        px: 1,
        // Must be relative + visible so the absolute popover can escape
        position: "relative",
        overflow: "visible",
      }}
      {...(isMini && hasChildren
        ? {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => setHovered(false),
          }
        : {})}
    >
      <NavigationListItemButton
        // @ts-ignore - ListItemButtonProps doesn't allow 'div' but it works fine and avoids invalid DOM attributes from Link
        component={href ? (Link as any) : "div"}
        href={href}
        selected={selected}
        onClick={onClick}
        sx={{
          px: 1.4,
          height: isMini ? 60 : 48,
          position: "relative",
        }}
      >
        {/* ── Icon / Avatar area ───────────────────────────────────────── */}
        <Box
          sx={
            isMini
              ? {
                  position: "absolute",
                  left: "50%",
                  top: "calc(50% - 6px)",
                  transform: "translate(-50%, -50%)",
                }
              : { display: "flex" }
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
            {icon ?? (
              isMini ? (
                <Avatar
                  sx={{
                    width: LIST_ITEM_ICON_SIZE - 7,
                    height: LIST_ITEM_ICON_SIZE - 7,
                    fontSize: 12,
                  }}
                >
                  {initials}
                </Avatar>
              ) : null
            )}
          </ListItemIcon>

          {/* Caption label in mini mode */}
          {isMini && (
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
                // inherit selected colour
                color: selected ? "primary.dark" : "text.secondary",
              }}
            >
              {title}
            </Typography>
          )}
        </Box>

        {/* ── Text (expanded mode only) ────────────────────────────────── */}
        {!isMini && (
          <ListItemText
            primary={title}
            sx={{ ml: 1.2, whiteSpace: "nowrap", zIndex: 1 }}
          />
        )}

        {/* ── Expand chevron — rotates with CSS transition (expanded mode) */}
        {hasChildren && !isMini && (
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
        )}

        {/* ── Small right-arrow for mini items with children ─────────── */}
        {hasChildren && isMini && (
          <ExpandMoreIcon
            sx={{
              fontSize: 18,
              position: "absolute",
              top: "41.5%",
              right: "2px",
              transform: "translateY(-50%) rotate(-90deg)",
            }}
          />
        )}
      </NavigationListItemButton>

      {/* ── Mini hover popover ───────────────────────────────────────────
           Positioned absolute from the ListItem (position:relative above).
           left:100% places it immediately to the right of the mini drawer item.
           top:0 aligns it with the top of the hovered item.
      ─────────────────────────────────────────────────────────────────── */}
      {isMini && hasChildren && miniPopoverContent && (
        <Grow in={hovered}>
          <Box
            sx={{
              position: "absolute",
              left: "100%",
              top: 0,
              pl: "6px",
              zIndex: (theme) => theme.zIndex.drawer + 2,
            }}
          >
            <Paper elevation={1} sx={{ py: 0.5 }}>
              {miniPopoverContent}
            </Paper>
          </Box>
        </Grow>
      )}
    </ListItem>
  );
}