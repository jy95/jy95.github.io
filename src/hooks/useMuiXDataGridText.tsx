"use client";

import { use } from 'react';
import { useLocale } from 'next-intl';
import { loadDataGridLocale } from './dataGridLocaleCache';

import type { GridLocaleText } from '@mui/x-data-grid';

// MUI X Data Grid doesn't have the locale text built-in.
// Callers must be rendered inside a <Suspense> boundary, since this
// suspends while the locale bundle loads instead of flashing English text.
export default function useMuiXDataGridText(): Partial<GridLocaleText> {
    const language = useLocale();
    return use(loadDataGridLocale(language));
}