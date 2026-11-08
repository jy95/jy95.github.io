import { useState } from "react";

import { usePathname } from "@/i18n/routing";
import { useAppContext } from "../provider/useAppContext";
import { leafPaths, resolveNavigationPath, selectedNavigationPath } from "./navigationPaths";

import type { NavigationItem } from "../types";

type ActivePath = string | null | undefined;

/** An explicit `selectedPath` (handed down by a parent group) wins over the one derived from the URL. */
function useActivePath(item: NavigationItem, parentPath: string, selectedPath: ActivePath): ActivePath {
  const pathname = usePathname();
  const { navigation } = useAppContext();
  if (selectedPath !== undefined) return selectedPath;
  return selectedNavigationPath(navigation ?? [item], pathname, navigation ? "" : parentPath);
}

function isActiveAncestor(children: NavigationItem[], itemPath: string, activePath: ActivePath): boolean {
  return children.length > 0 && leafPaths(children, itemPath).includes(activePath ?? "");
}

/**
 * Disclosure state that re-opens once when the active destination moves
 * into this group (adjusted during render, not in an effect).
 */
function useGroupOpen(isChildActive: boolean, activePath: ActivePath) {
  const [open, setOpen] = useState(isChildActive);
  const [previousActivePath, setPreviousActivePath] = useState(activePath);
  if (previousActivePath !== activePath) {
    setPreviousActivePath(activePath);
    if (isChildActive) setOpen(true);
  }
  return { open, toggle: () => setOpen(value => !value) };
}

/** Everything a destination/group needs to know about its position in the navigation tree. */
export function useNavigationGroupState(item: NavigationItem, parentPath: string, selectedPath: ActivePath) {
  const itemPath = resolveNavigationPath(item, parentPath);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const activePath = useActivePath(item, parentPath, selectedPath);
  const isChildActive = isActiveAncestor(children, itemPath, activePath);
  const { open, toggle } = useGroupOpen(isChildActive, activePath);
  const isSelected = hasChildren ? isChildActive : activePath === itemPath;

  return { itemPath, children, hasChildren, activePath, open, toggle, isSelected };
}
