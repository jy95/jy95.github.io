"use client";

import { List } from "@mui/material";
import NavigationGroup from "./navigation/NavigationGroup";
import { useAppContext } from "./provider/useAppContext";

export default function DashboardNavigation() {
  const { navigation } = useAppContext();
  const entries = navigation ?? [];

  return (
    <List disablePadding sx={{ px: 1 }}>
      {entries.map((item, index) => (
        <NavigationGroup
          key={`${item.segment ?? "group"}:${item.title}:${index}`}
          item={item}
        />
      ))}
    </List>
  );
}