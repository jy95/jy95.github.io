"use client";

import List from "@mui/material/List";
import NavigationGroup from "./navigation/NavigationGroup";
import { useAppContext } from "./provider/useAppContext";
import { MINI_DRAWER_WIDTH } from "./DashboardSidebar";

export default function DashboardNavigation() {
  const { navigation, drawerOpen = false } = useAppContext();
  const entries = navigation ?? [];
  const isMini = !drawerOpen;

  return (
    <List
      sx={{
        padding: 0,
        mb: 4,
        // Constrain list to mini drawer width when collapsed (matches original)
        width: isMini ? MINI_DRAWER_WIDTH : "auto",
      }}
    >
      {entries.map((item, index) => (
        <NavigationGroup
          key={`${item.segment ?? "group"}:${item.title}:${index}`}
          item={item}
        />
      ))}
    </List>
  );
}