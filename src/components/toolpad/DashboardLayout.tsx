"use client";

import { ReactNode, useState } from "react";
import { Box } from "@mui/material";

import DashboardSidebar from "./DashboardSidebar";
import DashboardToolbar from "./DashboardToolbar";
import { Navigation, DashboardLayoutSlots, DashboardLayoutSlotProps } from "./types";

type Props = {
  children: ReactNode;
  navigation?: Navigation;
  defaultSidebarCollapsed?: boolean;
  slots?: DashboardLayoutSlots;
  slotProps?: DashboardLayoutSlotProps;
};

export default function DashboardLayout({
  children,
  navigation,
  defaultSidebarCollapsed = false,
  slots,
  slotProps,
}: Props) {

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultSidebarCollapsed);

  const toggleSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      <DashboardSidebar
        navigation={navigation}
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onToggleMobile={toggleSidebar}
      />

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>

        <DashboardToolbar
          toggleSidebar={toggleSidebar}
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