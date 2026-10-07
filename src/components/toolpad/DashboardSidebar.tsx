"use client";

import { useTranslations } from "next-intl";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import DashboardNavigation from "./DashboardNavigation";
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from "./drawerConstants";
import { useAppContext } from "./provider/useAppContext";
import { getDrawerWidthTransitionMixin } from "./utils";

type DrawerVariantConfig = {
  key: string;
  display: Record<'xs' | 'sm' | 'md', 'none' | 'block'>;
  variant: 'temporary' | 'permanent';
  mini: boolean;
};

const DRAWER_VARIANTS: DrawerVariantConfig[] = [
  { key: 'mobile', display: { xs: 'block', sm: 'none', md: 'none' }, variant: 'temporary', mini: false },
  { key: 'tablet', display: { xs: 'none', sm: 'block', md: 'none' }, variant: 'permanent', mini: true },
  { key: 'desktop', display: { xs: 'none', sm: 'none', md: 'block' }, variant: 'permanent', mini: true },
];

export default function DashboardSidebar() {
  const t = useTranslations("dashboard.menuEntries");
  const { drawerOpen = false, toggleDrawer } = useAppContext();

  // When sidebar is closed → mini mode
  const isMini = !drawerOpen;

  const getDrawerContent = (mini: boolean) => (
    <>
      {/* Spacer that matches AppBar height so nav starts below it */}
      <Toolbar />
      <Box
        component="nav"
        aria-label={t("navigationLabel")}
        sx={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflowX: "hidden",
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          pt: 2,
        }}
      >
        <DashboardNavigation mini={mini} />
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
      {DRAWER_VARIANTS.map(({ key, display, variant, mini }) => (
        <Drawer
          key={key}
          variant={variant}
          open={variant === 'temporary' ? drawerOpen : undefined}
          onClose={variant === 'temporary' ? toggleDrawer : undefined}
          ModalProps={variant === 'temporary' ? { keepMounted: true } : undefined}
          sx={{
            display: { xs: display.xs, sm: display.sm, md: display.md },
            ...getDrawerSx(mini ? isMini : false, variant === 'temporary'),
          }}
        >
          {getDrawerContent(mini && isMini)}
        </Drawer>
      ))}
    </>
  );
}
