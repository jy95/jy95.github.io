"use client";

import {
  AppBar,
  Toolbar,
  IconButton,
  Box
} from "@mui/material";

import Branding from "./Branding";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

// Context
import { useAppContext } from "./provider/useAppContext";

// Types
import type { DashboardLayoutSlots, DashboardLayoutSlotProps } from "./types";

type Props = {
  slots?: DashboardLayoutSlots;
  slotProps?: DashboardLayoutSlotProps;
};

export default function DashboardToolbar({
  slots,
  slotProps
}: Props) {

  const ToolbarActions = slots?.toolbarActions;
  const { drawerOpen, toggleDrawer } = useAppContext();
  const open = drawerOpen ?? false;

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>

        {/* Collapse sidebar button */}
        <IconButton
          type="button"
          edge="start"
          size="large"
          aria-label="toggle sidebar"
          onClick={toggleDrawer}
          sx={{ mr: 2 }}
        >
          {open ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>

        <Branding />

        {/* Spacing */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Toolbar actions */}
        {ToolbarActions && (
          <ToolbarActions {...(slotProps?.toolbarActions ?? {})} />
        )}

      </Toolbar>
    </AppBar>
  );
}