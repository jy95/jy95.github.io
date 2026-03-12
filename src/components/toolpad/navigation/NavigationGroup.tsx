"use client";

import { useState } from "react";
import { usePathname } from "@/i18n/routing";
import { Collapse, List } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import NavigationItem from "./NavigationItem";

import type { NavigationItem as Item } from "../types";

function hasChildren(item: Item): item is Item & { children: Item[] } {
  return !!item.children?.length;
}

export default function NavigationGroup({ item }: { item: Item }) {
  const pathname = usePathname();
  const parentPath = `/${item.segment}`;
  const hasAnyChild = hasChildren(item);

  // Auto-expand if a child is the current route
  const isAnyChildSelected =
    hasAnyChild &&
    item.children.some((child) => {
      const childPath = child.segment
        ? `${parentPath}/${child.segment}`
        : parentPath;
      return pathname === childPath;
    });

  const [open, setOpen] = useState(isAnyChildSelected);

  const isParentSelected = !hasAnyChild && pathname === parentPath;

  return (
    <>
      <NavigationItem
        title={item.title}
        icon={item.icon}
        href={hasAnyChild ? undefined : parentPath}
        selected={isParentSelected}
        onClickAction={hasAnyChild ? () => setOpen((prev) => !prev) : undefined}
        endIcon={
          hasAnyChild ? open ? <ExpandLess /> : <ExpandMore /> : undefined
        }
      />

      {hasAnyChild && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ mt: 0.5 }}>
            {item.children.map((child) => {
              const childPath = child.segment
                ? `${parentPath}/${child.segment}`
                : parentPath;
              return (
                <NavigationItem
                  key={child.segment ?? child.title}
                  title={child.title}
                  icon={child.icon}
                  href={childPath}
                  selected={pathname === childPath}
                  isChild
                />
              );
            })}
          </List>
        </Collapse>
      )}
    </>
  );
}