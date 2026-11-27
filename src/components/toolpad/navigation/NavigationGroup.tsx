"use client";

import { useId, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useTranslations } from "next-intl";

import Divider from "@mui/material/Divider";
import ListSubheader from "@mui/material/ListSubheader";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";

import { usePathname } from "@/i18n/routing";

import { leafPaths, navigationKey, resolveNavigationPath, selectedNavigationPath } from "./navigationPaths";
import NavigationItem from "./NavigationItem";
import type { NavItemProps } from "./NavigationItem";
import { useAppContext } from "../provider/useAppContext";
import type { Navigation, NavigationItem as Item } from "../types";

type Props = {
  item: Item;
  parentPath?: string;
  selectedPath?: string | null;
  mini?: boolean;
};

type NavigableItem = Exclude<Item, { kind: "section" }>;

type NavigationGroupContentProps = {
  item: NavigableItem;
  parentPath: string;
  activePath: string | null | undefined;
  isChildActive: boolean;
  isMini: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  childrenId: string;
  badgeDescriptionId: string;
  title: string;
  hint?: string;
};

function getActivePath(
  selectedPath: string | null | undefined,
  navigation: Navigation | undefined,
  item: Item,
  pathname: string,
  parentPath: string,
): string | null | undefined {
  if (selectedPath !== undefined) return selectedPath;
  return selectedNavigationPath(navigation ?? [item], pathname, navigation ? "" : parentPath);
}

function hasActiveChild(children: Item[], itemPath: string, activePath: string | null | undefined): boolean {
  return children.length > 0 && leafPaths(children, itemPath).includes(activePath ?? "");
}

function isItemSelected(
  hasChildren: boolean,
  isChildActive: boolean,
  activePath: string | null | undefined,
  itemPath: string,
): boolean {
  return hasChildren ? isChildActive : activePath === itemPath;
}

function NavigationSection({ title, mini }: { title: string; mini: boolean }) {
  return mini ? <Divider component="li" sx={{ my: 1 }} /> : <ListSubheader disableSticky>{title}</ListSubheader>;
}

function NavigationChildren({
  children,
  itemPath,
  activePath,
  childrenId,
  isMini,
}: {
  children: Item[];
  itemPath: string;
  activePath: string | null | undefined;
  childrenId: string;
  isMini: boolean;
}) {
  return (
    <List id={childrenId} sx={{ p: 0, mb: 0.5, pl: isMini ? 0 : 2,
      width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      {children.map(child => (
        <NavigationGroup key={navigationKey(child, itemPath)} mini={false} selectedPath={activePath ?? null}
          item={child} parentPath={itemPath} />
      ))}
    </List>
  );
}

function buildNavigationItemProps(
  item: NavigableItem,
  options: {
    itemPath: string;
    hasChildren: boolean;
    isChildActive: boolean;
    isMini: boolean;
    open: boolean;
    activePath: string | null | undefined;
    childrenId: string;
    badgeDescriptionId: string;
    childList: ReactNode;
    title: string;
    hint?: string;
    onToggle: () => void;
  },
): NavItemProps {
  const Badge = item.badge;
  return {
    title: options.title,
    icon: item.icon,
    badge: Badge ? <Badge descriptionId={options.badgeDescriptionId} /> : undefined,
    badgeDescriptionId: Badge ? options.badgeDescriptionId : undefined,
    hint: options.hint,
    href: options.hasChildren ? undefined : options.itemPath,
    selected: isItemSelected(options.hasChildren, options.isChildActive, options.activePath, options.itemPath),
    onClick: options.hasChildren && !options.isMini ? options.onToggle : undefined,
    expanded: options.open,
    hasChildren: options.hasChildren,
    miniPopoverContent: options.childList,
    mini: options.isMini,
    controlsId: options.hasChildren ? options.childrenId : undefined,
  };
}

function NavigationGroupContent({
  item,
  parentPath,
  activePath,
  isChildActive,
  isMini,
  open,
  setOpen,
  childrenId,
  badgeDescriptionId,
  title,
  hint,
}: NavigationGroupContentProps) {
  const itemPath = resolveNavigationPath(item, parentPath);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const isToggle = hasChildren && !isMini;
  const childList = (
    <NavigationChildren
      children={children}
      itemPath={itemPath}
      activePath={activePath}
      childrenId={childrenId}
      isMini={isMini}
    />
  );
  const itemProps = buildNavigationItemProps(item, {
    title,
    hint,
    itemPath,
    hasChildren,
    isChildActive,
    isMini,
    open,
    activePath,
    childrenId,
    badgeDescriptionId,
    childList,
    onToggle: () => setOpen(value => !value),
  });

  return (
    <>
      <NavigationItem {...itemProps} />
      {isToggle && (
        <Collapse component="li" in={open} timeout="auto" sx={{ listStyle: "none" }}>
          {childList}
        </Collapse>
      )}
    </>
  );
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
  const activePath = getActivePath(selectedPath, navigation, item, pathname, parentPath);
  const isChildActive = hasActiveChild(children, itemPath, activePath);
  const [open, setOpen] = useState(isChildActive);
  const [previousActivePath, setPreviousActivePath] = useState(activePath);

  if (previousActivePath !== activePath) {
    setPreviousActivePath(activePath);
    if (isChildActive) setOpen(true);
  }

  if (item.kind === "section") {
    return <NavigationSection title={t(item.titleKey)} mini={isMini} />;
  }

  const title = t(item.titleKey);
  const hint = item.hintKey ? t(item.hintKey) : undefined;

  return (
    <NavigationGroupContent
      item={item}
      parentPath={parentPath}
      activePath={activePath}
      isChildActive={isChildActive}
      isMini={isMini}
      open={open}
      setOpen={setOpen}
      childrenId={childrenId}
      badgeDescriptionId={badgeDescriptionId}
      title={title}
      hint={hint}
    />
  );
}
