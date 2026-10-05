"use client";

// React / Next.js / third-party libraries
import { useTranslations } from "next-intl";

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// Project utilities and shared modules (@/)
import { useToggle } from "@/hooks/useToggle";
import { Link, usePathname } from "@/i18n/routing";
import type { Href } from "@/i18n/routing";

// Navigation feature
import NavigationItem from "./NavigationItem";
import { useAppContext } from "../provider/useAppContext";
import { navigationListItemButtonSx } from "./navigationStyles";
import type { NavigationItem as Item } from "../types";

const joinPath = (parent: string, segment?: string) => (segment ? `${parent}/${segment}` : parent);

const isWithin = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

/** Hover popover shown in mini mode; children rendered in the full expanded style. */
function MiniPopover({ items, parentPath }: { items: Item[]; parentPath: string }) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.menuEntries");

  return (
    <List sx={{ padding: 0, minWidth: 200 }}>
      {items.map((child, idx) => {
        const childPath = joinPath(parentPath, child.segment);
        return (
          <ListItem key={`${child.segment ?? child.titleKey}-${idx}`} sx={{ py: 0, px: 1 }}>
            <ListItemButton
              component={Link}
              // Built from route segments at runtime, so it cannot be checked
              // statically against `routing.pathnames`.
              href={childPath as Href}
              selected={pathname === childPath}
              sx={{ ...navigationListItemButtonSx, px: 1.4, height: 48 }}
            >
              <Box sx={{ display: "flex" }}>
                <ListItemIcon
                  sx={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 34 }}
                >
                  {child.icon ?? null}
                </ListItemIcon>
              </Box>
              <ListItemText primary={t(child.titleKey)} sx={{ ml: 1.2, whiteSpace: "nowrap" }} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}

interface Props {
  item: Item;
  parentPath?: string;
  depth?: number;
}

export default function NavigationGroup({ item, parentPath = "", depth = 0 }: Props) {
  const pathname = usePathname();
  const { drawerOpen = true } = useAppContext();
  // Titles are resolved here, at render time, so `MenuEntries.tsx` can stay a
  // static, translation-agnostic tree.
  const t = useTranslations("dashboard.menuEntries");

  const isMini = !drawerOpen;
  const itemPath = joinPath(parentPath, item.segment);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const isChildActive = children.some((child) => isWithin(pathname, joinPath(itemPath, child.segment)));
  const [open, toggleOpen] = useToggle(isChildActive);

  // A group toggles (instead of navigating) when the drawer is expanded.
  const isToggle = hasChildren && !isMini;

  // Mini mode highlights the parent of an active child; expanded mode only highlights leaves.
  const isSelected = hasChildren ? isMini && isChildActive : pathname === itemPath;

  return (
    <>
      <NavigationItem
        title={t(item.titleKey)}
        icon={item.icon}
        href={isToggle ? undefined : itemPath}
        selected={isSelected}
        onClick={isToggle ? toggleOpen : undefined}
        expanded={open}
        hasChildren={hasChildren}
        miniPopoverContent={hasChildren && isMini ? <MiniPopover items={children} parentPath={itemPath} /> : undefined}
      />

      {isToggle && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List sx={{ padding: 0, mb: 0.5, pl: 2 * (depth + 1) }}>
            {children.map((child, idx) => (
              <NavigationGroup
                key={`${child.segment ?? child.titleKey}-${idx}`}
                item={child}
                parentPath={itemPath}
                depth={depth + 1}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}
