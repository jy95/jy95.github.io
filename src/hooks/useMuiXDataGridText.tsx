"use client";

import { useLocale } from 'next-intl';
import { useAsyncMemo } from "./useAsyncMemo"

import type { GridLocaleText } from '@mui/x-data-grid';

// MUI X Data Grid doesn't have the locale text built-in
export default function useMuiXDataGridText() : Partial<GridLocaleText> {
    const language = useLocale();

    const customLocaleText = useAsyncMemo(async () => {
        switch(language) {
            case 'fr':
                const { 
                    frFR : {
                        components : {
                            MuiDataGrid : {
                                defaultProps : {
                                    localeText
                                }
                            }
                        }
                    }
                } = await import("@mui/x-data-grid");
                return localeText;
            // English is by default built-in in @mui package, so no need to include
            default:
                return {};
        }
    }, [language], {});

    return customLocaleText;
}