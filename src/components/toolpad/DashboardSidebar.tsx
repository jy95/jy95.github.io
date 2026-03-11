"use client";

import { Drawer, Box } from "@mui/material";
import { Navigation } from "./types";
import DashboardNavigation from "./DashboardNavigation";

const drawerWidth = 260;
const collapsedWidth = 72;

type Props = {
  navigation?: Navigation;
  mobileOpen: boolean;
  collapsed: boolean;
  onToggleMobileAction: () => void;
};

export default function DashboardSidebar({
  navigation,
  mobileOpen,
  collapsed,
  onToggleMobileAction,
}: Props) {

  const width = collapsed ? collapsedWidth : drawerWidth;

  const drawer = (
    <Box sx={{ width }}>
      <DashboardNavigation navigation={navigation} />
    </Box>
  );

  return (
    <>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onToggleMobileAction}
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