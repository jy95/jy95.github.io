import type { GridLocaleText } from '@mui/x-data-grid';

const dataGridLocaleCache = new Map<string, Promise<Partial<GridLocaleText>>>();

export function loadDataGridLocale(language: string): Promise<Partial<GridLocaleText>> {
    let cached = dataGridLocaleCache.get(language);
    if (!cached) {
        cached = language === 'fr'
            ? import("@mui/x-data-grid/locales").then(
                ({ frFR }) => frFR.components.MuiDataGrid.defaultProps.localeText
              )
            : Promise.resolve({});
        dataGridLocaleCache.set(language, cached);
    }
    return cached;
}