import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import Collapse from "@mui/material/Collapse";

import NavigationItem from "./NavigationItem";
import type useNavigationGroup from "./useNavigationGroup";
import type { NavigationItem as Item } from "../types";

interface Props {
  item: Item;
  group: ReturnType<typeof useNavigationGroup>;
  children: ReactNode;
}

export default function NavigationGroupItem({
  item,
  group,
  children,
}: Props) {
  const t = useTranslations("dashboard.menuEntries");
  const Badge = item.badge;

  return (
    <>
      <NavigationItem
        title={t(item.titleKey)}
        icon={item.icon}
        badge={
          Badge ? <Badge descriptionId={group.badgeDescriptionId} /> : undefined
        }
        badgeDescriptionId={
          Badge ? group.badgeDescriptionId : undefined
        }
        hint={item.hintKey ? t(item.hintKey) : undefined}
        href={group.hasChildren ? undefined : group.itemPath}
        selected={group.isSelected}
        onClick={
          group.isToggle
            ? () => group.setOpen(value => !value)
            : undefined
        }
        expanded={group.open}
        hasChildren={group.hasChildren}
        miniPopoverContent={children}
        mini={group.isMini}
        controlsId={group.hasChildren ? group.childrenId : undefined}
      />

      {group.isToggle && (
        <Collapse
          component="li"
          in={group.open}
          timeout="auto"
          sx={{ listStyle: "none" }}
        >
          {children}
        </Collapse>
      )}
    </>
  );
}
