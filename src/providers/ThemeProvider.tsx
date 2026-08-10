"use client";

import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';

import { useMemo, use } from 'react';
import { loadMuiLocale } from '@/hooks/lazyMui';

import type { ReactNode } from "react";

export function ThemeProvider({ children, lng }: { children: ReactNode, lng : string }) {

    // Use React's use() to synchronously obtain the imported locale object.
    // This will suspend the component until the import resolves; ensure the
    // caller wraps this provider in a Suspense boundary.
    const muiLanguage = use(loadMuiLocale(lng));

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
