"use client";

import {
  AppBar,
  Toolbar,
  IconButton,
  Box
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

import { DashboardLayoutSlots, DashboardLayoutSlotProps } from "./types";
import { useAppContext } from "./provider/useAppContext";

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

        <Box sx={{ flexGrow: 1 }} />

        {ToolbarActions && (
          <ToolbarActions {...(slotProps?.toolbarActions ?? {})} />
        )}

      </Toolbar>
    </AppBar>
  );
}