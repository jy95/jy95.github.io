import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveTierListGamesFuture } from './tier-list-games-future';

describe.skipIf(!hasRealDb)('extractAndSaveTierListGamesFuture', () => {

    const ctx = useExtractorHarness('extractAndSaveTierListGamesFuture');

    it('the total number of games across all categories equals games_in_future minus dlcs', async () => {
        const expectedCount = ctx.db
            .prepare(
                `SELECT COUNT(*) AS n FROM games_in_future gf JOIN games g ON gf.id = g.id WHERE g.id NOT IN (SELECT dlc FROM games_dlcs)`
            )
            .get() as { n: number };

        await extractAndSaveTierListGamesFuture(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, unknown[]>;
        const total = Object.values(written).reduce((sum, list) => sum + list.length, 0);

        expect(total).toBe(expectedCount.n);
    });

    it('creates every tier category key, even when empty', async () => {
        const categorySlugs = (ctx.db.prepare('SELECT slug FROM tier_categories').all() as { slug: string }[]).map(
            (c) => c.slug
        );

        await extractAndSaveTierListGamesFuture(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, unknown[]>;

        for (const slug of categorySlugs) {
            expect(written).toHaveProperty(slug);
        }
    });

});