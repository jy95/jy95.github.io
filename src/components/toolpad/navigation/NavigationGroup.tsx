"use client";

// React / Next.js / third-party libraries
import { useState } from "react";
import { useTranslations } from "next-intl";

import Divider from "@mui/material/Divider";
import ListSubheader from "@mui/material/ListSubheader";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// Project utilities and shared modules (@/)
import { Link, usePathname } from "@/i18n/routing";
import type { Href } from "@/i18n/routing";

// Navigation feature
import { leafPaths, navigationKey, resolveNavigationPath, selectedNavigationPath } from "./navigationPaths";
import NavigationItem from "./NavigationItem";
import { useAppContext } from "../provider/useAppContext";
import { navigationListItemButtonSx } from "./navigationStyles";
import type { NavigationItem as Item } from "../types";

interface Props {
  item: Item;
  parentPath?: string;
  depth?: number;
  selectedPath?: string | null;
}

export default function NavigationGroup({ item, parentPath = "", depth = 0, selectedPath }: Props) {
  const pathname = usePathname();
  const { drawerOpen = true, navigation } = useAppContext();
  // Titles are resolved here, at render time, so `MenuEntries.tsx` stays a static tree.
  const t = useTranslations("dashboard.menuEntries");

  const isMini = !drawerOpen;
  const itemPath = resolveNavigationPath(item, parentPath);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;

  const activePath = selectedPath === undefined
    ? selectedNavigationPath(navigation ?? [item], pathname, navigation ? '' : parentPath)
    : selectedPath;
  const isChildActive = hasChildren && leafPaths(children, itemPath).includes(activePath ?? '');
  const [open, setOpen] = useState(isChildActive);
  const [previousActivePath, setPreviousActivePath] = useState(activePath);
  if (previousActivePath !== activePath) {
    setPreviousActivePath(activePath);
    if (isChildActive) setOpen(true);
  }
  const isToggle = hasChildren && !isMini;
  const isSelected = hasChildren ? isMini && isChildActive : activePath === itemPath;
  const Badge = item.badge;

  if (item.kind === 'section') {
    return isMini ? <Divider component="li" sx={{ my: 1 }} /> :
      <ListSubheader disableSticky>{t(item.titleKey)}</ListSubheader>;
  }

  // Only displayed by NavigationItem, in mini mode, for items that have children.
  const miniPopover = (
    <List sx={{ padding: 0, minWidth: 200 }}>
      {children.filter(child => child.kind !== "section").map((child) => {
        const childPath = resolveNavigationPath(child, itemPath);
        return (
          <ListItem key={navigationKey(child, itemPath)} sx={{ py: 0, px: 1 }}>
            <ListItemButton
              component={Link}
              // Built from route segments at runtime, so it can't be checked
              // statically against `routing.pathnames`.
              href={childPath as Href}
              selected={activePath === childPath}
              sx={{ ...navigationListItemButtonSx, px: 1.4, height: 48 }}
            >
              <ListItemIcon sx={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 34 }}>
                {child.icon}
              </ListItemIcon>
              <ListItemText primary={t(child.titleKey)} sx={{ ml: 1.2, whiteSpace: "nowrap" }} />
              {child.badge && <child.badge />}
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  return (
    <>
      <NavigationItem
        title={t(item.titleKey)}
        icon={item.icon}
        badge={Badge ? <Badge /> : undefined}
        hint={item.hintKey ? t(item.hintKey) : undefined}
        href={isToggle ? undefined : itemPath}
        selected={isSelected}
        onClick={isToggle ? () => setOpen(value => !value) : undefined}
        expanded={open}
        hasChildren={hasChildren}
        miniPopoverContent={miniPopover}
      />

      {isToggle && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List sx={{ padding: 0, mb: 0.5, pl: 2 * (depth + 1) }}>
            {children.map((child) => (
              <NavigationGroup key={navigationKey(child, itemPath)} selectedPath={activePath ?? null} item={child} parentPath={itemPath} depth={depth + 1} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}
