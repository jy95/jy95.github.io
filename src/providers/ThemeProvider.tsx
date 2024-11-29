"use client";

import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';

import { useMemo } from 'react';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';


export function ThemeProvider({ children, lng }: { children: React.ReactNode, lng : string }) {

    // Prepare theme for possible darkmode
    const muiLanguage = useAsyncMemo(async () => {
        switch(lng) {
            case 'fr':
                const { frFR : language} = await import("@mui/material/locale");
                return language;
            // English is by default built-in in @mui package, so no need to include
            default:
                return {};
        }
    }, [lng], {} as any);

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