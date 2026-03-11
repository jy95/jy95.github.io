"use client";

import { Drawer, Box, styled } from "@mui/material";
import DashboardNavigation from "./DashboardNavigation";
import { useAppContext } from "./provider/useAppContext";

// We define CSS variables for the behavior, not the specific size.
// This allows the content (DashboardNavigation) to define how wide it needs to be.
export default function DashboardSidebar() {
  const { drawerOpen, toggleDrawer } = useAppContext();

  const drawerContent = (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column",
      // This ensures the content doesn't wrap awkwardly during transitions
      minWidth: "max-content" 
    }}>
      <DashboardNavigation />
    </Box>
  );

  return (
    <>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: "80vw", // Responsive relative width
            maxWidth: "300px",
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          // The container grows/shrinks based on the child
          width: drawerOpen ? "auto" : "var(--collapsed-size, 70px)",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            position: "relative",
            overflowX: "hidden",
            transition: (theme) => theme.transitions.create("width"),
            // Logic: If open, fit the content. If closed, clamp it.
            width: drawerOpen ? "max-content" : "var(--collapsed-size, 70px)",
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}