"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";

import { usePathname } from "@/i18n/routing";
import {
  leafPaths,
  navigationKey,
  resolveNavigationPath,
  selectedNavigationPath,
} from "./navigationPaths";
import NavigationItem from "./NavigationItem";
import { useAppContext } from "../provider/useAppContext";
import type { NavigationItem as Item } from "../types";

interface Props {
  item: Item;
  parentPath?: string;
  selectedPath?: string | null;
  mini?: boolean;
}

export default function NavigationGroup({
  item,
  parentPath = "",
  selectedPath,
  mini,
}: Props) {
  const pathname = usePathname();
  const { drawerOpen = true, navigation } = useAppContext();
  const t = useTranslations("dashboard.menuEntries");

  const isMini = mini ?? !drawerOpen;
  const path = resolveNavigationPath(item, parentPath);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const activePath =
    selectedPath === undefined
      ? selectedNavigationPath(navigation ?? [item], pathname, navigation ? "" : parentPath)
      : selectedPath;
  const isChildActive =
    hasChildren && leafPaths(children, path).includes(activePath ?? "");
  const isToggle = hasChildren && !isMini;
  const selected = isChildActive || activePath === path;

  const id = useId();
  const childrenId = `${id}-children`;
  const badgeDescriptionId = `${id}-count`;

  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  if (item.kind === "section") {
    return isMini ? (
      <Divider component="li" sx={{ my: 1 }} />
    ) : (
      <ListSubheader disableSticky>{t(item.titleKey)}</ListSubheader>
    );
  }

  const childList = hasChildren ? (
    <List
      id={childrenId}
      sx={{
        p: 0,
        mb: 0.5,
        pl: isMini ? 0 : 2,
        width: isMini ? 300 : undefined,
        maxWidth: "85vw",
      }}
    >
      {children.map((child) => (
        <NavigationGroup
          key={navigationKey(child, path)}
          item={child}
          parentPath={path}
          selectedPath={activePath}
        />
      ))}
    </List>
  ) : null;

  const Badge = item.badge;

  return (
    <>
      <NavigationItem
        title={t(item.titleKey)}
        icon={item.icon}
        badge={Badge ? <Badge descriptionId={badgeDescriptionId} /> : undefined}
        badgeDescriptionId={Badge ? badgeDescriptionId : undefined}
        hint={item.hintKey ? t(item.hintKey) : undefined}
        href={hasChildren ? undefined : path}
        selected={selected}
        onClick={isToggle ? () => setOpen((open) => !open) : undefined}
        expanded={open}
        hasChildren={hasChildren}
        miniPopoverContent={childList}
        mini={isMini}
        controlsId={hasChildren ? childrenId : undefined}
      />

      {isToggle && (
        <Collapse
          component="li"
          in={open}
          timeout="auto"
          sx={{ listStyle: "none" }}
        >
          {childList}
        </Collapse>
      )}
    </>
  );
}
