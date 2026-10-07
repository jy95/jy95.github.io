import type { SxProps, Theme } from "@mui/material/styles";  
  
/**  
 * Faithful copy of Toolpad's NavigationListItemButton styles.  
 *  
 * `sx` resolves palette shorthand ("primary.dark", "action.active") through  
 * the theme, including CSS-variable tokens when the theme was created with  
 * `extendTheme()` — so these adapt to dark mode with no callbacks needed.  
 *  
 * Non-selected state: only .MuiSvgIcon-root and .MuiAvatar-root are  
 * overridden — no ListItemIcon colour, no text colour — both inherit from  
 * the theme naturally.  
 *  
 * Defined as sx prop objects to preserve polymorphic component typing.  
 */  
  
const baseListItemButtonSx = {  
  borderRadius: 2,  
  "& .MuiSvgIcon-root": { color: "action.active" },  
  "& .MuiAvatar-root": { backgroundColor: "action.active" },  
  "&.Mui-selected": {  
    "& .MuiListItemIcon-root": { color: "primary.dark" },  
    "& .MuiTypography-root": { color: "primary.dark" },  
    "& .MuiSvgIcon-root": { color: "primary.dark" },  
    "& .MuiTouchRipple-child": { backgroundColor: "primary.dark" },  
  },  
} satisfies SxProps<Theme>;  
  
/** Main nav items — adds the selected-avatar accent on top of the base. */  
export const navigationListItemButtonSx = {  
  ...baseListItemButtonSx,  
  "&.Mui-selected": {  
    ...baseListItemButtonSx["&.Mui-selected"],  
    "& .MuiAvatar-root": { backgroundColor: "primary.dark" },  
  },  
} satisfies SxProps<Theme>;  
  
/** Popover child items in the mini drawer. */  
export const popoverListItemButtonSx = baseListItemButtonSx;
