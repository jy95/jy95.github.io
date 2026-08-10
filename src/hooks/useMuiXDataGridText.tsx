"use client";

import { useLocale } from 'next-intl';
import { use } from 'react';
import { loadMuiXGridLocaleText } from '@/hooks/lazyMui';

import type { GridLocaleText } from '@mui/x-data-grid';

// MUI X Data Grid doesn't have the locale text built-in
// This hook uses React's `use()` to synchronously consume a cached import
// promise. The calling component must be inside a Suspense boundary.
export default function useMuiXDataGridText() : Partial<GridLocaleText> {
    const language = useLocale();
    const localeText = use(loadMuiXGridLocaleText(language));
    return localeText ?? {};
}
