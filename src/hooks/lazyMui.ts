// Small promise caches for lazy-imported locale packs.
// These caches ensure each locale module is imported only once per runtime.

type MuiLocale = any;
type MuiXGridLocaleText = any;

const muiLocaleCache = new Map<string, Promise<MuiLocale>>();
const muiXGridLocaleCache = new Map<string, Promise<MuiXGridLocaleText>>();

export function loadMuiLocale(lng: string): Promise<MuiLocale> {
  if (muiLocaleCache.has(lng)) return muiLocaleCache.get(lng)!;

  const promise = (async () => {
    switch (lng) {
      case 'fr': {
        const { frFR } = await import('@mui/material/locale');
        return frFR;
      }
      default:
        return {};
    }
  })();

  muiLocaleCache.set(lng, promise);
  return promise;
}

export function loadMuiXGridLocaleText(lng: string): Promise<MuiXGridLocaleText> {
  if (muiXGridLocaleCache.has(lng)) return muiXGridLocaleCache.get(lng)!;

  const promise = (async () => {
    switch (lng) {
      case 'fr': {
        const { frFR } = await import('@mui/x-data-grid/locales');
        // extract the localeText object path used previously
        return frFR.components.MuiDataGrid.defaultProps.localeText;
      }
      default:
        return {};
    }
  })();

  muiXGridLocaleCache.set(lng, promise);
  return promise;
}
