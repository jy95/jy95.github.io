"use client";

import type { MouseEvent } from "react";
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

  const closeMobileDrawer = () => { if (drawerOpen) toggleDrawer?.(); };

  const handleDestinationClick = (event: MouseEvent<HTMLElement>) => {
    const isModifiedOrNonPrimary = [
      event.button !== 0, event.metaKey, event.ctrlKey, event.shiftKey, event.altKey,
    ].some(Boolean);
    if (isModifiedOrNonPrimary) return;
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest("a[href]");
    if (!link) return;
    const target = link.getAttribute("target");
    const isSameContext = [!target, target === "_self"].some(Boolean);
    const isNonDownload = !link.hasAttribute("download");
    const shouldClose = [drawerOpen, isSameContext, isNonDownload].every(Boolean);
    if (shouldClose) closeMobileDrawer();
  };

  const getDrawerContent = (mini: boolean, temporary: boolean) => (
    <>
      {/* Spacer that matches AppBar height so nav starts below it */}
      <Toolbar />
      <Box
        component="nav"
        aria-label={t("navigationLabel")}
        onClick={temporary ? handleDestinationClick : undefined}
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
      {DRAWER_VARIANTS.map(({ key, display, variant, mini }) => {
        const isTemporary = variant === "temporary";
        const effectiveMini = [mini, isMini].every(Boolean);
        return (
          <Drawer
            key={key}
            variant={variant}
            open={isTemporary ? drawerOpen : undefined}
            onClose={isTemporary ? closeMobileDrawer : undefined}
            ModalProps={isTemporary ? { keepMounted: true } : undefined}
            sx={{
              display,
              ...getDrawerSx(effectiveMini, isTemporary),
            }}
          >
            {getDrawerContent(effectiveMini, isTemporary)}
          </Drawer>
        );
      })}
    </>
  );
}
