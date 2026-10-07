"use client";

import List from "@mui/material/List";

import { usePathname } from "@/i18n/routing";

import { navigationKey, selectedNavigationPath } from "./navigation/navigationPaths";
import NavigationGroup from "./navigation/NavigationGroup";
import { useAppContext } from "./provider/useAppContext";
import { MINI_DRAWER_WIDTH } from "./drawerConstants";

export default function DashboardNavigation({ mini }: { mini?: boolean } = {}) {
  const { navigation, drawerOpen = false } = useAppContext();
  const entries = navigation ?? [];
  const pathname = usePathname();
  const selectedPath = selectedNavigationPath(entries, pathname);
  const isMini = mini ?? !drawerOpen;

  return (
    <List
      sx={{
        padding: 0,
        mb: 4,
        // Constrain list to mini drawer width when collapsed (matches original)
        width: isMini ? MINI_DRAWER_WIDTH : "auto",
      }}
    >
      {entries.map((item) => (
        <NavigationGroup
          key={navigationKey(item)}
          selectedPath={selectedPath ?? null}
          item={item}
          mini={isMini}
        />
      ))}
    </List>
  );
}
