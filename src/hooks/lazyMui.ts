import type { ThemeOptions } from "`@mui/material/styles`";
import type { GridLocaleText } from "`@mui/x-data-grid`";

const muiLocaleCache = new Map<string, Promise<ThemeOptions>>();
const muiXGridLocaleCache = new Map<string, Promise<Partial<GridLocaleText>>>();

export function loadMuiLocale(lng: string): Promise<ThemeOptions> {
    const cachedLocale = muiLocaleCache.get(lng);

    if (cachedLocale) {
        return cachedLocale;
    }

    const locale = (async (): Promise<ThemeOptions> => {
        if (lng === "fr") {
            const { frFR } = await import("`@mui/material/locale`");
            return frFR;
        }

        return {};
    })();

    muiLocaleCache.set(lng, locale);

    return locale;
}

export function loadMuiXGridLocaleText(
    lng: string
): Promise<Partial<GridLocaleText>> {
    const cachedLocale = muiXGridLocaleCache.get(lng);

    if (cachedLocale) {
        return cachedLocale;
    }

    const locale = (async (): Promise<Partial<GridLocaleText>> => {
        if (lng === "fr") {
            const { frFR } = await import("`@mui/x-data-grid/locales`");
            return frFR.components.MuiDataGrid.defaultProps.localeText;
        }

        return {};
    })();

    muiXGridLocaleCache.set(lng, locale);

    return locale;
}
