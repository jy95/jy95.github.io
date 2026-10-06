"use client";

// React / Next.js / third-party libraries
import { useTranslations } from "next-intl";

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

const join = (base: string, segment?: string) => (segment ? `${base}/${segment}` : base);

interface Props {
  item: Item;
  parentPath?: string;
  depth?: number;
}

export default function NavigationGroup({ item, parentPath = "", depth = 0 }: Props) {
  const pathname = usePathname();
  const { drawerOpen = true } = useAppContext();
  // Titles are resolved here, at render time, so `MenuEntries.tsx` stays a static tree.
  const t = useTranslations("dashboard.menuEntries");

  const isMini = !drawerOpen;
  const itemPath = join(parentPath, item.segment);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;

  const isChildActive = children.some((child) => {
    const childPath = join(itemPath, child.segment);
    return pathname === childPath || pathname.startsWith(`${childPath}/`);
  });
  const [open, toggleOpen] = useToggle(isChildActive);

  // An expanded group toggles its children instead of navigating.
  const isToggle = hasChildren && !isMini;
  // Mini mode highlights the parent of an active child; expanded mode only highlights leaves.
  const isSelected = hasChildren ? isMini && isChildActive : pathname === itemPath;

  // Only displayed by NavigationItem, in mini mode, for items that have children.
  const miniPopover = (
    <List sx={{ padding: 0, minWidth: 200 }}>
      {children.map((child) => {
        const childPath = join(itemPath, child.segment);
        return (
          <ListItem key={childPath} sx={{ py: 0, px: 1 }}>
            <ListItemButton
              component={Link}
              // Built from route segments at runtime, so it can't be checked
              // statically against `routing.pathnames`.
              href={childPath as Href}
              selected={pathname === childPath}
              sx={{ ...navigationListItemButtonSx, px: 1.4, height: 48 }}
            >
              <ListItemIcon sx={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 34 }}>
                {child.icon}
              </ListItemIcon>
              <ListItemText primary={t(child.titleKey)} sx={{ ml: 1.2, whiteSpace: "nowrap" }} />
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
        href={isToggle ? undefined : itemPath}
        selected={isSelected}
        onClick={isToggle ? toggleOpen : undefined}
        expanded={open}
        hasChildren={hasChildren}
        miniPopoverContent={miniPopover}
      />

      {isToggle && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List sx={{ padding: 0, mb: 0.5, pl: 2 * (depth + 1) }}>
            {children.map((child) => (
              <NavigationGroup key={join(itemPath, child.segment)} item={child} parentPath={itemPath} depth={depth + 1} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}
