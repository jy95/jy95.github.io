/**
 * Per-locale promise cache for MUI's theme locale bundle. Using `use()` to
 * consume this (instead of the old useEffect/useState-based useAsyncMemo)
 * means the component *suspends* while the locale loads instead of doing
 * an initial render with the English default and flashing to the correct
 * locale once the dynamic import resolves.
 */
const muiThemeLocaleCache = new Map<string, Promise<Record<string, unknown>>>();

export function loadMuiThemeLocale(lng: string): Promise<Record<string, unknown>> {
    let cached = muiThemeLocaleCache.get(lng);
    if (!cached) {
        cached = lng === 'fr'
            ? import("@mui/material/locale").then(({ frFR }) => frFR)
            : Promise.resolve({});
        muiThemeLocaleCache.set(lng, cached);
    }
    return cached;
}