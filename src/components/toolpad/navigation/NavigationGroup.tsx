"use client";

import { useTranslations } from "next-intl";

import NavigationGroupItem from "./NavigationGroupItem";
import NavigationGroupSection from "./NavigationGroupSection";
import NavigationGroupChildren from "./NavigationGroupChildren";
import useNavigationGroup from "./useNavigationGroup";
import { navigationKey } from "./navigationPaths";
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
  const t = useTranslations("dashboard.menuEntries");
  const { drawerOpen = true } = useAppContext();
  const isMini = mini ?? !drawerOpen;

  if (item.kind === "section") {
    return <NavigationGroupSection title={t(item.titleKey)} mini={isMini} />;
  }

  return <NavigationGroupNode item={item} parentPath={parentPath} selectedPath={selectedPath} mini={isMini} />;
}

function NavigationGroupNode({
  item,
  parentPath,
  selectedPath,
  mini,
}: Omit<Props, "parentPath" | "mini"> & { parentPath: string; mini: boolean }) {
  const group = useNavigationGroup({
    item,
    parentPath,
    selectedPath,
    mini,
  });

  const childList = group.hasChildren ? (
    <NavigationGroupChildren
      childrenId={group.childrenId}
      mini={group.isMini}
    >
      {group.children.map(child => (
        <NavigationGroup
          key={navigationKey(child, group.itemPath)}
          mini={false}
          selectedPath={group.activePath ?? null}
          item={child}
          parentPath={group.itemPath}
        />
      ))}
    </NavigationGroupChildren>
  ) : null;

  return (
    <NavigationGroupItem item={item} group={group}>
      {childList}
    </NavigationGroupItem>
  );
}
