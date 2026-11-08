"use client";

// React / Next.js / third-party libraries
import { useId } from "react";
import { useTranslations } from "next-intl";

import Divider from "@mui/material/Divider";
import ListSubheader from "@mui/material/ListSubheader";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";

// Navigation feature
import { navigationKey } from "./navigationPaths";
import NavigationItem from "./NavigationItem";
import { useIsMini } from "./useIsMini";
import { useNavigationGroupState } from "./useNavigationGroupState";

import type { ElementType, ReactNode } from "react";
import type { NavigationItem as Item, NavigationSection } from "../types";

interface Props {
  item: Item;
  parentPath?: string;
  selectedPath?: string | null;
  mini?: boolean;
}

type GroupState = ReturnType<typeof useNavigationGroupState>;

function groupIds(instanceId: string, item: Item, parentPath: string) {
  return {
    childrenId: `${instanceId}-${navigationKey(item, parentPath)}-children`,
    badgeDescriptionId: `${instanceId}-count`,
  };
}

type GroupIds = ReturnType<typeof groupIds>;

function groupBadgeProps(Badge: ElementType | undefined, descriptionId: string) {
  return Badge ? { badge: <Badge descriptionId={descriptionId} />, badgeDescriptionId: descriptionId } : {};
}

function groupLinkProps(state: GroupState, childrenId: string) {
  return {
    href: state.hasChildren ? undefined : state.itemPath,
    controlsId: state.hasChildren ? childrenId : undefined,
  };
}

/** Section headers are plain labels (a divider when collapsed). */
function SectionGroup({ item, mini }: { item: NavigationSection; mini?: boolean }) {
  const t = useTranslations("dashboard.menuEntries");
  const isMini = useIsMini(mini);

  return isMini
    ? <Divider component="li" sx={{ my: 1 }} />
    : <ListSubheader disableSticky>{t(item.titleKey)}</ListSubheader>;
}

type ChildListProps = {
  id: string;
  items: Item[];
  isMini: boolean;
  activePath: string | null | undefined;
  parentPath: string;
};

function ChildList({ id, items, isMini, activePath, parentPath }: ChildListProps) {
  return (
    <List id={id} sx={{ p: 0, mb: 0.5, pl: isMini ? 0 : 2,
      width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      {items.map(child => (
        <NavigationGroup key={navigationKey(child, parentPath)} mini={false} selectedPath={activePath ?? null}
          item={child} parentPath={parentPath} />
      ))}
    </List>
  );
}

type GroupEntryProps = {
  item: Item;
  isMini: boolean;
  ids: GroupIds;
  state: GroupState;
  isToggle: boolean;
  childList: ReactNode;
};

/** The row itself; titles are resolved here so `MenuEntries.tsx` stays a static tree. */
function GroupEntry({ item, isMini, ids, state, isToggle, childList }: GroupEntryProps) {
  const t = useTranslations("dashboard.menuEntries");

  return (
    <NavigationItem
      title={t(item.titleKey)}
      icon={item.icon}
      {...groupBadgeProps(item.badge, ids.badgeDescriptionId)}
      hint={item.hintKey ? t(item.hintKey) : undefined}
      {...groupLinkProps(state, ids.childrenId)}
      selected={state.isSelected}
      onClick={isToggle ? state.toggle : undefined}
      expanded={state.open}
      hasChildren={state.hasChildren}
      miniPopoverContent={childList}
      mini={isMini}
    />
  );
}

function DestinationGroup({ item, parentPath = "", selectedPath, mini }: Props) {
  const isMini = useIsMini(mini);
  const instanceId = useId();
  const state = useNavigationGroupState(item, parentPath, selectedPath);
  const ids = groupIds(instanceId, item, parentPath);
  const isToggle = state.hasChildren && !isMini;
  const childList = (
    <ChildList id={ids.childrenId} items={state.children} isMini={isMini}
      activePath={state.activePath} parentPath={state.itemPath} />
  );

  return (
    <>
      <GroupEntry item={item} isMini={isMini} ids={ids} state={state} isToggle={isToggle} childList={childList} />

      {isToggle && (
        <Collapse component="li" in={state.open} timeout="auto" sx={{ listStyle: "none" }}>
          {childList}
        </Collapse>
      )}
    </>
  );
}

export default function NavigationGroup(props: Props) {
  const { item } = props;
  if (item.kind === "section") return <SectionGroup item={item} mini={props.mini} />;
  return <DestinationGroup {...props} />;
}
