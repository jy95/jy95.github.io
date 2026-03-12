import type { ElementType, ReactNode } from "react";

export type NavigationItem = {
  title: string;
  icon?: ReactNode;
  segment?: string;
  children?: NavigationItem[];
};

export type Navigation = NavigationItem[];

export type DashboardLayoutSlots = {
  toolbarActions?: ElementType;
};

export type DashboardLayoutSlotProps = {
  toolbarActions?: any;
};