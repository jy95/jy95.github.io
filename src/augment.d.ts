import type { ExtendTheme } from '@mui/material-pigment-css';

declare module '@mui/material-pigment-css' {
    interface ThemeArgs {
      theme: ExtendTheme;
    }
}