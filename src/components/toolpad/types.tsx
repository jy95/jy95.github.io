import type { ReactNode } from "react";

export type NavigationItem = {
  title: string;
  icon?: ReactNode;
  segment?: string;
  children?: NavigationItem[];
};

export type Navigation = NavigationItem[];

export type DashboardLayoutSlots = {
  toolbarActions?: React.ElementType;
};

export type DashboardLayoutSlotProps = {
  toolbarActions?: any;
};

export type Branding = {
  title?: string;
  logo?: ReactNode;
};