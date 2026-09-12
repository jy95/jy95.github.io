import { describe, it, expect } from 'vitest';
import { useExtractorHarness } from './common/extractorTestHarness';
import { readFile } from 'node:fs/promises';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSavePlatforms } from './platforms';

describe.skipIf(!hasRealDb)('extractAndSavePlatforms', () => {
    const ctx = useExtractorHarness('platforms');

    it('writes a JSON array with one entry per row in the platforms table', async () => {
        const expectedCount = ctx.db.prepare('SELECT COUNT(*) AS n FROM platforms').get() as { n: number };

        await extractAndSavePlatforms(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(Array.isArray(written)).toBe(true);
        expect(written).toHaveLength(expectedCount.n);
    });

    it('every written entry has a numeric id and non-empty name, matching the table directly', async () => {
        await extractAndSavePlatforms(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { id: number; name: string }[];

        const rows = ctx.db.prepare('SELECT id, name FROM platforms').all() as { id: number; name: string }[];
        expect(written).toEqual(rows);
    });

    it('includes the well-known platform ids used elsewhere in the app (1-7)', async () => {
        await extractAndSavePlatforms(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { id: number }[];
        const ids = written.map((p) => p.id).sort((a, b) => a - b);
        expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
});