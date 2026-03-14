"use client";

import { useState } from "react";
import { usePathname } from "@/i18n/routing";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import NavigationItem from "./NavigationItem";
import { useAppContext } from "../provider/useAppContext";
import type { NavigationItem as Item } from "../types";
import { Link } from "@/i18n/routing";

/**
 * Same styled button used for popover child items — identical colour rules
 * to NavigationListItemButton in NavigationItem.tsx.
 */
const PopoverListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 8,
  "& .MuiSvgIcon-root": {
    color: (theme.vars ?? theme).palette.action.active,
  },
  "& .MuiAvatar-root": {
    backgroundColor: (theme.vars ?? theme).palette.action.active,
  },
  "&.Mui-selected": {
    "& .MuiListItemIcon-root": {
      color: (theme.vars ?? theme).palette.primary.dark,
    },
    "& .MuiTypography-root": {
      color: (theme.vars ?? theme).palette.primary.dark,
    },
    "& .MuiSvgIcon-root": {
      color: (theme.vars ?? theme).palette.primary.dark,
    },
    "& .MuiTouchRipple-child": {
      backgroundColor: (theme.vars ?? theme).palette.primary.dark,
    },
  },
}));

function hasChildren(item: Item): item is Item & { children: Item[] } {
  return !!item.children?.length;
}

interface Props {
  item: Item;
  parentPath?: string;
  depth?: number;
}

export default function NavigationGroup({
  item,
  parentPath = "",
  depth = 0,
}: Props) {
  const pathname = usePathname();
  const { drawerOpen = true } = useAppContext();
  const isMini = !drawerOpen;

  const itemPath = item.segment ? `${parentPath}/${item.segment}` : parentPath;
  const hasAnyChild = hasChildren(item);

  const isAnyChildSelected =
    hasAnyChild &&
    item.children.some((child) => {
      const childPath = child.segment ? `${itemPath}/${child.segment}` : itemPath;
      return pathname === childPath || pathname.startsWith(`${childPath}/`);
    });

  const [open, setOpen] = useState(isAnyChildSelected);

  // In mini mode highlight parent when any child is active; in expanded mode
  // only leaf items are highlighted.
  const isSelected = hasAnyChild
    ? isMini && isAnyChildSelected
    : pathname === itemPath;

  // Popover children rendered in full expanded style matching Toolpad's DOM
  const miniPopover =
    hasAnyChild && isMini ? (
      <List sx={{ padding: 0, minWidth: 200 }}>
        {item.children.map((child, idx) => {
          const childPath = child.segment
            ? `${itemPath}/${child.segment}`
            : itemPath;
          const childSelected = pathname === childPath;
          return (
            <ListItem
              key={`${child.segment ?? child.title}-${idx}`}
              sx={{ py: 0, px: 1 }}
            >
              <PopoverListItemButton
                // @ts-ignore - ListItemButtonProps doesn't allow 'div' but it works fine and avoids invalid DOM attributes from Link
                component={Link as any}
                href={childPath}
                selected={childSelected}
                sx={{ px: 1.4, height: 48, borderRadius: 2 }}
              >
                <Box sx={{ display: "flex" }}>
                  <ListItemIcon
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 34,
                    }}
                  >
                    {child.icon ?? null}
                  </ListItemIcon>
                </Box>
                <ListItemText
                  primary={child.title}
                  sx={{ ml: 1.2, whiteSpace: "nowrap" }}
                />
              </PopoverListItemButton>
            </ListItem>
          );
        })}
      </List>
    ) : undefined;

  return (
    <>
      <NavigationItem
        title={item.title}
        icon={item.icon}
        href={hasAnyChild && !isMini ? undefined : itemPath}
        selected={isSelected}
        onClick={
          hasAnyChild && !isMini ? () => setOpen((prev) => !prev) : undefined
        }
        expanded={open}
        hasChildren={hasAnyChild}
        miniPopoverContent={miniPopover}
      />

      {hasAnyChild && !isMini ? (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List sx={{ padding: 0, mb: 0.5, pl: 2 * (depth + 1) }}>
            {item.children.map((child, idx) => (
              <NavigationGroup
                key={`${child.segment ?? child.title}-${idx}`}
                item={child}
                parentPath={itemPath}
                depth={depth + 1}
              />
            ))}
          </List>
        </Collapse>
      ) : null}
    </>
  );
}