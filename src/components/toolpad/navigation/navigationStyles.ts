import type { SxProps, Theme } from "@mui/material/styles";

/** Uses CSS-variable palettes and sx to preserve polymorphic button typing. */
export const navigationListItemButtonSx = {
  borderRadius: 2,
  "& .MuiSvgIcon-root": {
    color: "action.active",
  },
  "& .MuiAvatar-root": {
    backgroundColor: "action.active",
  },
  "&.Mui-selected": {
    "& .MuiListItemIcon-root, & .MuiTypography-root, & .MuiSvgIcon-root": {
      color: "primary.dark",
    },
    "& .MuiTouchRipple-child": {
      backgroundColor: "primary.dark",
    },
  },
} satisfies SxProps<Theme>;
