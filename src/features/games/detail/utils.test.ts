import { describe, it, expect } from 'vitest';
import { formatDate } from './utils';

describe('formatDate', () => {
    it('matches the native Date#toLocaleDateString output for the same input', () => {
        // Compared against the native call (rather than a hardcoded string)
        // so the test isn't tied to the runner's default locale.
        const input = '2023-06-15';
        expect(formatDate(input)).toBe(new Date(input).toLocaleDateString());
    });

    it('produces different output for different dates', () => {
        expect(formatDate('2020-01-01')).not.toBe(formatDate('2024-12-31'));
    });

    it('re-exports the GameDetailView predicates via the barrel file', async () => {
        // utils.ts does `export * from "./predicates"` — guard against that
        // barrel silently breaking (e.g. predicates.ts renamed/removed).
        const utils = await import('./utils');
        expect(typeof utils.hasDuration).toBe('function');
        expect(typeof utils.hasGenres).toBe('function');
    });
});