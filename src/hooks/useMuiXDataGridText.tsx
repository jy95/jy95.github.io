"use client";

import { useLocale } from "next-intl";
import { use } from "react";
import { loadMuiXGridLocaleText } from "`@/hooks/lazyMui`";

import type { GridLocaleText } from "`@mui/x-data-grid`";

export default function useMuiXDataGridText(): Partial<GridLocaleText> {
    const language = useLocale();

    return use(loadMuiXGridLocaleText(language));
}
