"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";

import DashboardSidebar from "./DashboardSidebar";
import DashboardToolbar from "./DashboardToolbar";

import type { DashboardLayoutSlots, DashboardLayoutSlotProps } from "./types";

type Props = {
  children: ReactNode;
  slots?: DashboardLayoutSlots;
  slotProps?: DashboardLayoutSlotProps;
};

export default function DashboardLayout({ children, slots, slotProps }: Props) {
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <DashboardSidebar />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0, // prevents flex child from overflowing
          overflow: "hidden",
        }}
      >
        <DashboardToolbar slots={slots} slotProps={slotProps} />

        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: "auto",
            p: 3,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}