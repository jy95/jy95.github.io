// src/providers/muiLocaleCache.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('loadMuiThemeLocale', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('resolves to an empty object for a non-French locale, without importing @mui/material/locale', async () => {
        const { loadMuiThemeLocale } = await import('./muiLocaleCache');
        const result = await loadMuiThemeLocale('en');
        expect(result).toEqual({});
    });

    it('caches the promise per language so a second call reuses the first', async () => {
        const { loadMuiThemeLocale } = await import('./muiLocaleCache');
        const first = loadMuiThemeLocale('en');
        const second = loadMuiThemeLocale('en');
        expect(first).toBe(second);
    });

    it('does not share the cache entry between two different languages', async () => {
        const { loadMuiThemeLocale } = await import('./muiLocaleCache');
        const en = loadMuiThemeLocale('en');
        const fr = loadMuiThemeLocale('fr');
        expect(en).not.toBe(fr);
    });

    it('resolves the French locale bundle from @mui/material/locale', async () => {
        const { loadMuiThemeLocale } = await import('./muiLocaleCache');
        const result = await loadMuiThemeLocale('fr');
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
    });

    it('treats any non-"fr" locale the same way (empty object, no crash)', async () => {
        const { loadMuiThemeLocale } = await import('./muiLocaleCache');
        const de = await loadMuiThemeLocale('de');
        expect(de).toEqual({});
    });
});
