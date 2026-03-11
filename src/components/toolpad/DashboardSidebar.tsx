"use client";

import { Drawer, Box } from "@mui/material";
import { Navigation } from "./types";
import DashboardNavigation from "./DashboardNavigation";

const drawerWidth = 260;

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

  const drawer = (
    <Box sx={{ width: collapsed ? 72 : drawerWidth }}>
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
          display: { xs: "block", md: "none" }
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
          "& .MuiDrawer-paper": {
            width: collapsed ? 72 : drawerWidth,
            boxSizing: "border-box"
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}