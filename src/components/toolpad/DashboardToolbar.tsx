"use client";

import {
  AppBar,
  Toolbar,
  IconButton,
  Box
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

import { DashboardLayoutSlots, DashboardLayoutSlotProps } from "./types";

type Props = {
  toggleSidebarAction: () => void;
  slots?: DashboardLayoutSlots;
  slotProps?: DashboardLayoutSlotProps;
};

export default function DashboardToolbar({
  toggleSidebarAction,
  slots,
  slotProps
}: Props) {

  const ToolbarActions = slots?.toolbarActions;

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>

        <IconButton
          type="button"
          edge="start"
          size="large"
          aria-label="toggle sidebar"
          onClick={toggleSidebarAction}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        {ToolbarActions && (
          <ToolbarActions {...(slotProps?.toolbarActions ?? {})} />
        )}

      </Toolbar>
    </AppBar>
  );
}