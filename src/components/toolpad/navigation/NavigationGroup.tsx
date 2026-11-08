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

type GroupEntryProps = {
  item: Item;
  isMini: boolean;
  childrenId: string;
  badgeDescriptionId: string;
  state: GroupState;
  isToggle: boolean;
  childList: ReactNode;
};

/** The row itself; titles are resolved here so `MenuEntries.tsx` stays a static tree. */
function GroupEntry({
  item,
  isMini,
  childrenId,
  badgeDescriptionId,
  state,
  isToggle,
  childList,
}: GroupEntryProps) {
  const t = useTranslations("dashboard.menuEntries");

  return (
    <NavigationItem
      title={t(item.titleKey)}
      icon={item.icon}
      {...groupBadgeProps(item.badge, badgeDescriptionId)}
      hint={item.hintKey ? t(item.hintKey) : undefined}
      {...groupLinkProps(state, childrenId)}
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
  const childrenId = `${instanceId}-${navigationKey(item, parentPath)}-children`;
  const badgeDescriptionId = `${instanceId}-count`;
  const isToggle = state.hasChildren && !isMini;

  const childList = (
    <List
      id={childrenId}
      sx={{
        p: 0,
        mb: 0.5,
        pl: isMini ? 0 : 2,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {state.children.map(child => (
        <NavigationGroup
          key={navigationKey(child, state.itemPath)}
          mini={false}
          selectedPath={state.activePath ?? null}
          item={child}
          parentPath={state.itemPath}
        />
      ))}
    </List>
  );

  return (
    <>
      <GroupEntry
        item={item}
        isMini={isMini}
        childrenId={childrenId}
        badgeDescriptionId={badgeDescriptionId}
        state={state}
        isToggle={isToggle}
        childList={childList}
      />

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
