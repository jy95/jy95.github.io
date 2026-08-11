import type { ElementType, ReactNode } from "react";
import type { DashboardMenuKey } from "@/types/navigation";

export type NavigationItem = {
  titleKey: DashboardMenuKey;
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