"use client";

import { ReactNode, useState } from "react";
import { Box } from "@mui/material";

import DashboardSidebar from "./DashboardSidebar";
import DashboardToolbar from "./DashboardToolbar";

// Types
import type { DashboardLayoutSlots, DashboardLayoutSlotProps } from "./types";

// Provider
import { useAppContext } from "./provider/useAppContext";

type Props = {
  children: ReactNode;
  defaultSidebarCollapsed?: boolean;
  slots?: DashboardLayoutSlots;
  slotProps?: DashboardLayoutSlotProps;
};

export default function DashboardLayout({
  children,
  defaultSidebarCollapsed = false,
  slots,
  slotProps,
}: Props) {

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultSidebarCollapsed);

  const toggleSidebar = () => {
    setMobileOpen((prev) => !prev);
  };

  const { navigation } = useAppContext();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      <DashboardSidebar
        navigation={navigation}
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onToggleMobileAction={toggleSidebar}
      />

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>

        <DashboardToolbar
          toggleSidebarAction={toggleSidebar}
          slots={slots}
          slotProps={slotProps}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            flexDirection: "column"
          }}
        >
          {children}
        </Box>

      </Box>

    </Box>
  );
}