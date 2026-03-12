"use client";

import { Drawer, Box, Divider } from "@mui/material";
import DashboardNavigation from "./DashboardNavigation";
import { useAppContext } from "./provider/useAppContext";

const DRAWER_WIDTH = 320;
const MINI_DRAWER_WIDTH = 56;

export default function DashboardSidebar() {
  const { drawerOpen = false, toggleDrawer } = useAppContext();

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Divider />

      {/* Scrollable navigation */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 1 }}>
        <DashboardNavigation />
      </Box>
    </Box>
  );

  const transitionSx = (theme: any) =>
    theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: drawerOpen
        ? theme.transitions.duration.enteringScreen
        : theme.transitions.duration.leavingScreen,
    });

  return (
    <>
      {/* Mobile — temporary */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            maxWidth: "80vw",
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop — permanent */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
          flexShrink: 0,
          transition: transitionSx,
          "& .MuiDrawer-paper": {
            position: "relative",
            height: "100%",
            width: drawerOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
            boxSizing: "border-box",
            overflowX: "hidden",
            borderRight: "1px solid",
            borderColor: "divider",
            transition: transitionSx,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}