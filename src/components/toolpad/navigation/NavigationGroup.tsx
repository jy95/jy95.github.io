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

const Section = ({ item, mini }: Pick<Props, "item" | "mini">) => {
  const t = useTranslations("dashboard.menuEntries");

  if (mini) return <Divider component="li" sx={{ my: 1 }} />;

  return (
    <ListSubheader disableSticky>
      {t(item.titleKey)}
    </ListSubheader>
  );
};

const ChildList = ({
  children,
  path,
  activePath,
  mini,
  id,
}: {
  children: Item[];
  path: string;
  activePath: string | null | undefined;
  mini: boolean;
  id: string;
}) => (
  <List
    id={id}
    sx={{
      p: 0,
      mb: 0.5,
      pl: mini ? 0 : 2,
      width: mini ? 300 : undefined,
      maxWidth: "85vw",
    }}
  >
    {children.map((item) => (
      <NavigationGroup
        key={navigationKey(item, path)}
        item={item}
        parentPath={path}
        selectedPath={activePath ?? null}
      />
    ))}
  </List>
);

const Entry = ({
  item,
  parentPath,
  selectedPath,
  mini,
}: Props) => {
  const pathname = usePathname();
  const { drawerOpen = true, navigation } = useAppContext();
  const t = useTranslations("dashboard.menuEntries");

  const isMini = mini ?? !drawerOpen;
  const path = resolveNavigationPath(item, parentPath);
  const children = item.children ?? [];
  const hasChildren = children.length !== 0;

  const activePath =
    selectedPath ??
    selectedNavigationPath(
      navigation ?? [item],
      pathname,
      navigation ? "" : parentPath,
    );

  const childActive = leafPaths(children, path).includes(activePath ?? "");

  const [open, setOpen] = useState(childActive);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  const id = useId();
  const childrenId = `${id}-children`;
  const badgeId = `${id}-count`;
  const Badge = item.badge;
  const childList = (
    <ChildList
      children={children}
      path={path}
      activePath={activePath}
      mini={isMini}
      id={childrenId}
    />
  );

  return (
    <>
      <NavigationItem
        title={t(item.titleKey)}
        icon={item.icon}
        badge={Badge && <Badge descriptionId={badgeId} />}
        badgeDescriptionId={Badge ? badgeId : undefined}
        hint={item.hintKey && t(item.hintKey)}
        href={hasChildren ? undefined : path}
        selected={hasChildren ? childActive : activePath === path}
        onClick={hasChildren && !isMini
          ? () => setOpen((value) => !value)
          : undefined}
        expanded={open}
        hasChildren={hasChildren}
        miniPopoverContent={childList}
        mini={isMini}
        controlsId={hasChildren ? childrenId : undefined}
      />

      {hasChildren && !isMini && (
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
};

export default function NavigationGroup(props: Props) {
  const { drawerOpen = true } = useAppContext();
  const mini = props.mini ?? !drawerOpen;

  return props.item.kind === "section"
    ? <Section item={props.item} mini={mini} />
    : <Entry {...props} mini={mini} />;
}
