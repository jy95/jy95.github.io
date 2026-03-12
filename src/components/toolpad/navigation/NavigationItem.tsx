"use client";

import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { Link } from "@/i18n/routing";
import { useAppContext } from "../provider/useAppContext";

type NavItemProps = {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  selected: boolean;
  onClickAction?: () => void;
  isChild?: boolean;
  endIcon?: React.ReactNode;
};

export default function NavigationItem({
  title,
  icon,
  href,
  selected,
  onClickAction,
  isChild,
  endIcon,
}: NavItemProps) {
  const { drawerOpen = true } = useAppContext();

  const button = (
    <ListItemButton
      component={href ? (Link as any) : "div"}
      href={href}
      selected={selected}
      onClick={onClickAction}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        minHeight: 44,
        px: 1.5,
        pl: isChild && drawerOpen ? 3 : 1.5,
        justifyContent: drawerOpen ? "initial" : "center",
        "&.Mui-selected": {
          bgcolor: "primary.main",
          color: "primary.contrastText",
          "&:hover": { bgcolor: "primary.dark" },
          "& .MuiListItemIcon-root": { color: "primary.contrastText" },
        },
      }}
    >
      {icon && (
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: drawerOpen ? 1.5 : "auto",
            justifyContent: "center",
            color: selected ? "inherit" : "text.secondary",
          }}
        >
          {icon}
        </ListItemIcon>
      )}

      {drawerOpen && (
        <>
          <ListItemText
            primary={title}
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: selected ? 600 : 400,
              noWrap: true,
            }}
          />
          {endIcon}
        </>
      )}
    </ListItemButton>
  );

  // Wrap with tooltip when collapsed so the title is still discoverable
  if (!drawerOpen) {
    return (
      <Tooltip title={title} placement="right" arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
}