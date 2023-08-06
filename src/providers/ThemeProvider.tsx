"use client";

import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectCurrentColor, selectCurrentSystemColor, themeColor } from '@/redux/features/themeColorSlice';
import { useMediaQuery } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';


export function ThemeProvider({ children, lng }: { children: React.ReactNode, lng : string }) {

    // for theme Color
    const dispatch = useAppDispatch();
    const currentColor = useAppSelector((state) => selectCurrentColor(state));
    const currentSystemColor = useAppSelector((state) => selectCurrentSystemColor(state));
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const systemColor = prefersDarkMode ? "dark" : "light";

    // Two case handled here :
    // 1) When user comes to the site and have different color that default
    // 2) When user changes on the fly its preferred system color
    useEffect(() => {
        if (currentSystemColor !== systemColor) {
            dispatch(themeColor({color: systemColor, mode: "auto"}));
        }
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentSystemColor, currentColor]
    );

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
                palette: {
                    mode: currentColor,
                },
            }, muiLanguage),
        [muiLanguage, currentColor],
    );

    return (
        <MUIThemeProvider theme={theme}>
            {children}
        </MUIThemeProvider>
    )
}