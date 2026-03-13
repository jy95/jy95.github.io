"use client";

import { useState } from "react";
import { usePathname } from "@/i18n/routing";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import NavigationItem from "./NavigationItem";
import { useAppContext } from "../provider/useAppContext";
import { MINI_DRAWER_WIDTH } from "../DashboardSidebar";
import type { NavigationItem as Item } from "../types";

function hasChildren(item: Item): item is Item & { children: Item[] } {
  return !!item.children?.length;
}

interface Props {
  item: Item;
  /** Absolute path prefix built by parent groups, e.g. "" or "/settings" */
  parentPath?: string;
  /** Nesting depth — controls left-padding of the sub-list */
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

  // Full path of this item
  const itemPath = item.segment ? `${parentPath}/${item.segment}` : parentPath;
  const hasAnyChild = hasChildren(item);

  // Whether any immediate child's path is active (for auto-expand + mini selected state)
  const isAnyChildSelected =
    hasAnyChild &&
    item.children.some((child) => {
      const childPath = child.segment ? `${itemPath}/${child.segment}` : itemPath;
      return pathname === childPath || pathname.startsWith(`${childPath}/`);
    });

  const [open, setOpen] = useState(isAnyChildSelected);

  // In mini mode: highlight the parent when any child is active
  // In expanded mode: only highlight leaf items
  const isSelected = hasAnyChild
    ? isMini && isAnyChildSelected
    : pathname === itemPath;

  // Popover content shown on hover when in mini mode and item has children
  const miniPopover = hasAnyChild && isMini ? (
    <List
      sx={{
        padding: 0,
        mt: 0.5,
        mb: 0.5,
        pl: 1,
        minWidth: 240,
        width: MINI_DRAWER_WIDTH,
      }}
    >
      {item.children.map((child, idx) => {
        const childPath = child.segment ? `${itemPath}/${child.segment}` : itemPath;
        return (
          <NavigationItem
            key={`${child.segment ?? child.title}-${idx}`}
            title={child.title}
            icon={child.icon}
            href={childPath}
            selected={pathname === childPath}
            hasChildren={!!child.children?.length}
          />
        );
      })}
    </List>
  ) : undefined;

  return (
    <>
      <NavigationItem
        title={item.title}
        icon={item.icon}
        // In mini mode: group items act as direct links (children shown in popover)
        href={hasAnyChild && !isMini ? undefined : itemPath}
        selected={isSelected}
        onClick={hasAnyChild && !isMini ? () => setOpen((prev) => !prev) : undefined}
        expanded={open}
        hasChildren={hasAnyChild}
        miniPopoverContent={miniPopover}
      />

      {/* Collapsed child list — only rendered in expanded sidebar mode */}
      {hasAnyChild && !isMini ? (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List
            sx={{
              padding: 0,
              mb: 0.5,
              // Indent children: 2 spacing units per depth level (matches original)
              pl: 2 * (depth + 1),
            }}
          >
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