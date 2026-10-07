"use client";

// React / Next.js / third-party libraries
import { useId, useState } from "react";
import { useTranslations } from "next-intl";

import Divider from "@mui/material/Divider";
import ListSubheader from "@mui/material/ListSubheader";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";

// Project utilities and shared modules (@/)
import { usePathname } from "@/i18n/routing";

// Navigation feature
import { leafPaths, navigationKey, resolveNavigationPath, selectedNavigationPath } from "./navigationPaths";
import NavigationItem from "./NavigationItem";
import { useAppContext } from "../provider/useAppContext";
import type { NavigationItem as Item } from "../types";

interface Props {
  item: Item;
  parentPath?: string;
  selectedPath?: string | null;
  mini?: boolean;
}

export default function NavigationGroup({ item, parentPath = "", selectedPath, mini }: Props) {
  const pathname = usePathname();
  const { drawerOpen = true, navigation } = useAppContext();
  // Titles are resolved here, at render time, so `MenuEntries.tsx` stays a static tree.
  const t = useTranslations("dashboard.menuEntries");

  const isMini = mini ?? !drawerOpen;
  const instanceId = useId();
  const childrenId = `${instanceId}-${navigationKey(item, parentPath)}-children`;
  const badgeDescriptionId = `${instanceId}-count`;
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
  const isSelected = hasChildren ? isChildActive : activePath === itemPath;
  const Badge = item.badge;

  if (item.kind === 'section') {
    return isMini ? <Divider component="li" sx={{ my: 1 }} /> :
      <ListSubheader disableSticky>{t(item.titleKey)}</ListSubheader>;
  }

  const childList = (
    <List id={childrenId} sx={{ p: 0, mb: 0.5, pl: isMini ? 0 : 2, width: isMini ? 300 : undefined, maxWidth: "85vw" }}>
      {children.map(child => (
        <NavigationGroup key={navigationKey(child, itemPath)} mini={false} selectedPath={activePath ?? null}
          item={child} parentPath={itemPath} />
      ))}
    </List>
  );

  return (
    <>
      <NavigationItem
        title={t(item.titleKey)}
        icon={item.icon}
        badge={Badge ? <Badge descriptionId={badgeDescriptionId} /> : undefined}
        badgeDescriptionId={Badge ? badgeDescriptionId : undefined}
        hint={item.hintKey ? t(item.hintKey) : undefined}
        href={hasChildren ? undefined : itemPath}
        selected={isSelected}
        onClick={isToggle ? () => setOpen(value => !value) : undefined}
        expanded={open}
        hasChildren={hasChildren}
        miniPopoverContent={childList}
        mini={isMini}
        controlsId={hasChildren ? childrenId : undefined}
      />

      {isToggle && (
        <Collapse component="li" in={open} timeout="auto" sx={{ listStyle: "none" }}>
          {childList}
        </Collapse>
      )}
    </>
  );
}
