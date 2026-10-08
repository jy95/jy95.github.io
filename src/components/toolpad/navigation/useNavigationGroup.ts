import { useEffect, useId, useState } from "react";

import { usePathname } from "@/i18n/routing";

import {
  leafPaths,
  navigationKey,
  resolveNavigationPath,
  selectedNavigationPath,
} from "./navigationPaths";
import { useAppContext } from "../provider/useAppContext";
import type { NavigationItem as Item } from "../types";

interface Params {
  item: Item;
  parentPath: string;
  selectedPath?: string | null;
  mini?: boolean;
}

export default function useNavigationGroup({
  item,
  parentPath,
  selectedPath,
  mini,
}: Params) {
  const pathname = usePathname();
  const { drawerOpen = true, navigation } = useAppContext();

  const isMini = mini ?? !drawerOpen;
  const instanceId = useId();
  const childrenId = `${instanceId}-${navigationKey(item, parentPath)}-children`;
  const badgeDescriptionId = `${instanceId}-count`;
  const itemPath = resolveNavigationPath(item, parentPath);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;

  const activePath =
    selectedPath === undefined
      ? selectedNavigationPath(
          navigation ?? [item],
          pathname,
          navigation ? "" : parentPath,
        )
      : selectedPath;

  const isChildActive =
    hasChildren &&
    leafPaths(children, itemPath).includes(activePath ?? "");

  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) {
      setOpen(true);
    }
  }, [isChildActive, activePath]);

  return {
    isMini,
    childrenId,
    badgeDescriptionId,
    itemPath,
    children,
    hasChildren,
    activePath,
    open,
    setOpen,
    isToggle: hasChildren && !isMini,
    isSelected: hasChildren ? isChildActive : activePath === itemPath,
  };
}
