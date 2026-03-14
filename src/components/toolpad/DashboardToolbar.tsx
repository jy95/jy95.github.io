"use client";

import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import Branding from "./Branding";
import { useAppContext } from "./provider/useAppContext";
import type { DashboardLayoutSlots, DashboardLayoutSlotProps } from "./types";

// Matches Toolpad's AppBar style exactly
const AppBar = styled(MuiAppBar)(({ theme }) => ({
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: "solid",
  borderColor: theme.palette.divider,
  boxShadow: "none",
  zIndex: theme.zIndex.drawer + 1,
}));

type Props = {
  slots?: DashboardLayoutSlots;
  slotProps?: DashboardLayoutSlotProps;
};

export default function DashboardToolbar({ slots, slotProps }: Props) {
  const ToolbarActionsSlot = slots?.toolbarActions ?? null;
  const { drawerOpen = false, toggleDrawer } = useAppContext();

  return (
    <AppBar color="inherit" position="absolute" sx={{ displayPrint: "none" }}>
      <Toolbar sx={{ backgroundColor: "inherit", mx: { xs: -0.75, sm: -1 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ flexWrap: "wrap", width: "100%" }}
        >
          <Stack direction="row" alignItems="center">
            <Tooltip
              title={drawerOpen ? "Collapse menu" : "Expand menu"}
              enterDelay={1000}
            >
              <Box>
                <IconButton
                  aria-label={
                    drawerOpen
                      ? "Collapse navigation menu"
                      : "Expand navigation menu"
                  }
                  onClick={toggleDrawer}
                >
                  {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
                </IconButton>
              </Box>
            </Tooltip>
            <Branding />
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ marginLeft: "auto" }}
          >
            {ToolbarActionsSlot && (
              <ToolbarActionsSlot {...(slotProps?.toolbarActions ?? {})} />
            )}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}