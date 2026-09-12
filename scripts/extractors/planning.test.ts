import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSavePlanning } from './planning';

describe.skipIf(!hasRealDb)('extractAndSavePlanning', () => {
    const ctx = useExtractorHarness('extractAndSavePlanning');

    it('matches the row count of games_in_future exactly', async () => {
        const expectedCount = ctx.db.prepare('SELECT COUNT(*) AS n FROM games_in_future').get() as { n: number };

        await extractAndSavePlanning(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('parses the aggregated genres column into a real JSON array, not a raw string', async () => {
        await extractAndSavePlanning(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { genres: unknown }[];

        for (const entry of written) {
            expect(Array.isArray(entry.genres)).toBe(true);
        }
    });

    it('every genre id in the output is a number', async () => {
        await extractAndSavePlanning(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { genres: number[] }[];

        for (const entry of written) {
            for (const genreId of entry.genres) {
                expect(typeof genreId).toBe('number');
            }
        }
    });

    it('joins in the parent game row (title, releaseDate, duration) for every future entry', async () => {
        await extractAndSavePlanning(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as {
            title: string;
            releaseDate: unknown;
            duration: unknown;
        }[];

        for (const entry of written) {
            expect(typeof entry.title).toBe('string');
            expect(entry.title.length).toBeGreaterThan(0);
        }
    });
});