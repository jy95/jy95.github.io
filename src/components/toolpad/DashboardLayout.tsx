"use client";

import { ReactNode } from "react";
import { Box } from "@mui/material";

import DashboardSidebar from "./DashboardSidebar";
import DashboardToolbar from "./DashboardToolbar";

// Types
import type { DashboardLayoutSlots, DashboardLayoutSlotProps } from "./types";

type Props = {
  children: ReactNode;
  slots?: DashboardLayoutSlots;
  slotProps?: DashboardLayoutSlotProps;
};

export default function DashboardLayout({
  children,
  slots,
  slotProps,
}: Props) {

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      <DashboardSidebar/>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>

        <DashboardToolbar
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