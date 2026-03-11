"use client";

import { List } from "@mui/material";
import NavigationGroup from "./navigation/NavigationGroup";
import type { Navigation } from "./types";

type Props = { navigation?: Navigation };

export default function DashboardNavigation({ navigation }: Props) {
  if (!navigation) return null;

  return (
    <List sx={{ px: 1 }}>
      {navigation.map((item) => (
        <NavigationGroup 
          key={item.segment ?? item.title} 
          item={item} 
        />
      ))}
    </List>
  );
}