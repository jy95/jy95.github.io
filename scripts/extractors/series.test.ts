import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveSeries } from './series';

describe.skipIf(!hasRealDb)('extractAndSaveSeries', () => {
    const ctx = useExtractorHarness('extractAndSaveSeries');

    it('matches the row count of the series_as_json view', async () => {
        const expectedCount = ctx.db.prepare('SELECT COUNT(*) AS n FROM series_as_json').get() as { n: number };

        await extractAndSaveSeries(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('every series entry has a non-empty items array', async () => {
        await extractAndSaveSeries(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { items: unknown[] }[];

        for (const serie of written) {
            expect(Array.isArray(serie.items)).toBe(true);
            expect(serie.items.length).toBeGreaterThan(0);
        }
    });

    it('every serie name in the output exists in the series table', async () => {
        await extractAndSaveSeries(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { name: string }[];

        const knownNames = new Set(
            (ctx.db.prepare('SELECT name FROM series').all() as { name: string }[]).map((r) => r.name)
        );
        for (const serie of written) {
            expect(knownNames.has(serie.name)).toBe(true);
        }
    });
});