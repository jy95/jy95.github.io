import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveGenres } from './genres';

describe.skipIf(!hasRealDb)('extractAndSaveGenres', () => {
    const ctx = useExtractorHarness('extractAndSaveGenres');

    it('writes exactly the rows in the genres table, in the same order', async () => {
        await extractAndSaveGenres(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));
        const rows = ctx.db.prepare('SELECT id, name FROM genres').all();
        expect(written).toEqual(rows);
    });

    it('produces valid, parseable JSON even when the table is queried twice in a row', async () => {
        await extractAndSaveGenres(ctx.db, ctx.outPath);
        const firstRun = await readFile(ctx.outPath, 'utf-8');

        await extractAndSaveGenres(ctx.db, ctx.outPath);
        const secondRun = await readFile(ctx.outPath, 'utf-8');

        expect(JSON.parse(secondRun)).toEqual(JSON.parse(firstRun));
    });
});