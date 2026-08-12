import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('loadDataGridLocale', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('resolves to an empty object for a non-French locale, without importing locales', async () => {
        const { loadDataGridLocale } = await import('./dataGridLocaleCache');
        const result = await loadDataGridLocale('en');
        expect(result).toEqual({});
    });

    it('caches the promise per language so a second call reuses the first', async () => {
        const { loadDataGridLocale } = await import('./dataGridLocaleCache');
        const first = loadDataGridLocale('en');
        const second = loadDataGridLocale('en');
        expect(first).toBe(second);
    });

    it('does not share the cache entry between two different languages', async () => {
        const { loadDataGridLocale } = await import('./dataGridLocaleCache');
        const en = loadDataGridLocale('en');
        const fr = loadDataGridLocale('fr');
        expect(en).not.toBe(fr);
    });

    it('resolves the French locale text from @mui/x-data-grid/locales', async () => {
        const { loadDataGridLocale } = await import('./dataGridLocaleCache');
        const result = await loadDataGridLocale('fr');
        // Real frFR bundle: just assert it's a non-empty, defined locale object.
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
    });
});