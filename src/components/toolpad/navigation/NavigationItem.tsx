"use client";

import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link } from "@/i18n/routing";

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
  title, icon, href, selected, onClickAction, isChild, endIcon 
}: NavItemProps) {
  return (
    <ListItemButton
      component={href ? (Link as any) : "div"}
      href={href}
      selected={selected}
      onClick={onClickAction}
      sx={{
        mx: 1,
        mb: 0.5,
        borderRadius: 2,
        pl: isChild ? 4 : undefined,
        "&.Mui-selected": { 
          bgcolor: isChild ? 'primary.main' : 'action.selected',
          color: isChild ? 'primary.contrastText' : 'inherit'
        }
      }}
    >
      {icon && <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>}
      <ListItemText primary={title} />
      {endIcon}
    </ListItemButton>
  );
}