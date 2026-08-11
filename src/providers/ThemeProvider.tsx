"use client";

import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';

import { use, useMemo } from 'react';
import { loadMuiThemeLocale } from './muiLocaleCache';

import type { ReactNode } from "react";

export function ThemeProvider({ children, lng }: { children: ReactNode, lng : string }) {

    // Suspends until the locale bundle (or the empty-object fallback for
    // English) resolves — no flash of the default English theme.
    const muiLanguage = use(loadMuiThemeLocale(lng));

    const theme = useMemo(
        () =>
            createTheme({
                colorSchemes: { light: true, dark: true },
                cssVariables: {
                    colorSchemeSelector: 'data-toolpad-color-scheme',
                }
            }, muiLanguage),
        [muiLanguage],
    );

    return (
        <MUIThemeProvider theme={theme}>
            {children}
        </MUIThemeProvider>
    )
}