"use client";

import type { ReactNode } from "react";
import { Box, Toolbar } from "@mui/material";
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
    <Box
      sx={{
        position: "relative",
        display: "flex",
        overflow: "hidden",
        height: "100vh",
        width: "100vw",
      }}
    >
      {/* AppBar is position="absolute" — rendered first so it paints on top */}
      <DashboardToolbar slots={slots} slotProps={slotProps} />

      <DashboardSidebar />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Pushes content below the absolute AppBar */}
        <Toolbar sx={{ displayPrint: "none" }} />

        <Box
          component="main"
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}