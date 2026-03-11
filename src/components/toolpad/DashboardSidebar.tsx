"use client";

import { Drawer, Box } from "@mui/material";
import DashboardNavigation from "./DashboardNavigation";
import { useAppContext } from "./provider/useAppContext";

const drawerWidth = 260;
const collapsedWidth = 72;

type Props = {};

export default function DashboardSidebar({}: Props) {

  const { drawerOpen, toggleDrawer } = useAppContext();

  const open = drawerOpen ?? false;
  const collapsed = !drawerOpen;
  const width = collapsed ? collapsedWidth : drawerWidth;

  const drawer = (
    <Box sx={{ width }}>
      <DashboardNavigation />
    </Box>
  );

  return (
    <>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box"
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}