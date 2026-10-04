import type { Theme } from "@mui/material/styles";

/** Uses CSS-variable palettes and sx to preserve polymorphic button typing. */
export const navigationListItemButtonSx = {
  borderRadius: 2,
  "& .MuiSvgIcon-root": {
    color: (theme: Theme) => (theme.vars ?? theme).palette.action.active,
  },
  "& .MuiAvatar-root": {
    backgroundColor: (theme: Theme) => (theme.vars ?? theme).palette.action.active,
  },
  "&.Mui-selected": {
    "& .MuiListItemIcon-root": {
      color: (theme: Theme) => (theme.vars ?? theme).palette.primary.dark,
    },
    "& .MuiTypography-root": {
      color: (theme: Theme) => (theme.vars ?? theme).palette.primary.dark,
    },
    "& .MuiSvgIcon-root": {
      color: (theme: Theme) => (theme.vars ?? theme).palette.primary.dark,
    },
    "& .MuiTouchRipple-child": {
      backgroundColor: (theme: Theme) => (theme.vars ?? theme).palette.primary.dark,
    },
  },
} as const;

