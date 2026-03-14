"use client";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import DashboardNavigation from "./DashboardNavigation";
import { useAppContext } from "./provider/useAppContext";
import { getDrawerWidthTransitionMixin } from "./utils";

export const DRAWER_WIDTH = 320;
export const MINI_DRAWER_WIDTH = 84;

export default function DashboardSidebar() {
  const { drawerOpen = false, toggleDrawer } = useAppContext();

  // When sidebar is closed → mini mode
  const isMini = !drawerOpen;

  const getDrawerContent = () => (
    <>
      {/* Spacer that matches AppBar height so nav starts below it */}
      <Toolbar />
      <Box
        component="nav"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "auto",
          scrollbarGutter: isMini ? "stable" : "auto",
          overflowX: "hidden",
          pt: 2,
        }}
      >
        <DashboardNavigation />
      </Box>
    </>
  );

  // Matches getDrawerSharedSx from the original
  const getDrawerSx = (mini: boolean, isTemporary: boolean) => {
    const width = mini ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;
    return {
      displayPrint: "none",
      width,
      flexShrink: 0,
      ...getDrawerWidthTransitionMixin(drawerOpen),
      ...(isTemporary ? { position: "absolute" } : {}),
      "& .MuiDrawer-paper": {
        position: "absolute",
        width,
        boxSizing: "border-box",
        backgroundImage: "none",
        ...getDrawerWidthTransitionMixin(drawerOpen),
      },
    } as const;
  };

  return (
    <>
      {/* Mobile — temporary, always full-width when open */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          ...getDrawerSx(false, true),
        }}
      >
        {getDrawerContent()}
      </Drawer>

      {/* Tablet — permanent, collapsible mini */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block", md: "none" },
          ...getDrawerSx(isMini, false),
        }}
      >
        {getDrawerContent()}
      </Drawer>

      {/* Desktop — permanent, collapsible mini */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          ...getDrawerSx(isMini, false),
        }}
      >
        {getDrawerContent()}
      </Drawer>
    </>
  );
}