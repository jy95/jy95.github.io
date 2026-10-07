import type { ElementType, ReactNode } from "react";
import type { DashboardMenuKey } from "@/types/navigation";

export type NavigationDestination = {
  kind?: "destination";
  path?: string;
  badge?: ElementType;
  hintKey?: DashboardMenuKey;
  titleKey: DashboardMenuKey;
  icon?: ReactNode;
  segment?: string;
  children?: NavigationItem[];
};

export type NavigationSection = {
  kind: "section";
  titleKey: DashboardMenuKey;
  segment?: never;
  path?: never;
  icon?: never;
  children?: never;
  badge?: never;
  hintKey?: never;
};

export type NavigationItem = NavigationDestination | NavigationSection;

export type Navigation = NavigationItem[];

export type DashboardLayoutSlots = {
  toolbarActions?: ElementType;
};

export type DashboardLayoutSlotProps = {
  toolbarActions?: any;
};