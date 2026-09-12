import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveGames } from './games';

describe.skipIf(!hasRealDb)('extractAndSaveGames', () => {
    const ctx = useExtractorHarness('extractAndSaveGames');

    it('excludes rows whose id is registered as a DLC of another game', async () => {
        await extractAndSaveGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { id: number }[];

        const dlcIds = new Set(
            (ctx.db.prepare('SELECT dlc FROM games_dlcs').all() as { dlc: number }[]).map((r) => r.dlc)
        );

        for (const game of written) {
            expect(dlcIds.has(game.id)).toBe(false);
        }
    });

    it('matches the count of games_in_present minus known dlc rows', async () => {
        const expectedCount = ctx.db
            .prepare('SELECT COUNT(*) AS n FROM games_in_present WHERE id NOT IN (SELECT dlc FROM games_dlcs)')
            .get() as { n: number };

        await extractAndSaveGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('every written game has a title and a platform', async () => {
        await extractAndSaveGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { title: string; platform: number }[];

        for (const game of written) {
            expect(typeof game.title).toBe('string');
            expect(game.title.length).toBeGreaterThan(0);
            expect(typeof game.platform).toBe('number');
        }
    });
});