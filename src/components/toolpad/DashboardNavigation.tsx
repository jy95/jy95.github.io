"use client";

import { List } from "@mui/material";
import NavigationGroup from "./navigation/NavigationGroup";
import type { Navigation } from "./types";
import { useAppContext } from "./provider/useAppContext";

type Props = {};

export default function DashboardNavigation({}: Props) {

  const { navigation } = useAppContext();
  const entries = navigation ?? [];

  return (
    <List sx={{ px: 1 }}>
      {entries.map((item) => (
        <NavigationGroup 
          key={item.segment ?? item.title} 
          item={item} 
        />
      ))}
    </List>
  );
}