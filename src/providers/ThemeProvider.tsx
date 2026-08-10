"use client";

import { createTheme, ThemeProvider as MUIThemeProvider } from "`@mui/material/styles`";

import { use, useMemo } from "react";
import { loadMuiLocale } from "`@/hooks/lazyMui`";

import type { ReactNode } from "react";

export function ThemeProvider(
    { children, lng }: { children: ReactNode; lng: string }
) {
    const muiLanguage = use(loadMuiLocale(lng));

    const theme = useMemo(
        () =>
            createTheme(
                {
                    colorSchemes: { light: true, dark: true },
                    cssVariables: {
                        colorSchemeSelector: "data-toolpad-color-scheme"
                    }
                },
                muiLanguage
            ),
        [muiLanguage]
    );

    return (
        <MUIThemeProvider theme={theme}>
            {children}
        </MUIThemeProvider>
    );
}
