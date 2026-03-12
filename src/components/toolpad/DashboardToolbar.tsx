"use client";

import { AppBar, Toolbar, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

import Branding from "./Branding";
import { useAppContext } from "./provider/useAppContext";
import type { DashboardLayoutSlots, DashboardLayoutSlotProps } from "./types";

type Props = {
  slots?: DashboardLayoutSlots;
  slotProps?: DashboardLayoutSlotProps;
};

export default function DashboardToolbar({ slots, slotProps }: Props) {
  const ToolbarActions = slots?.toolbarActions;
  const { drawerOpen = false, toggleDrawer } = useAppContext();

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar>
        <IconButton
          type="button"
          edge="start"
          size="large"
          aria-label="toggle sidebar"
          onClick={toggleDrawer}
          sx={{ mr: 2 }}
        >
          {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>

        <Branding />

        <Box sx={{ flexGrow: 1 }} />

        {ToolbarActions && (
          <ToolbarActions {...(slotProps?.toolbarActions ?? {})} />
        )}
      </Toolbar>
    </AppBar>
  );
}