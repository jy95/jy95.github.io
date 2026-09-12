import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSavePastGames } from './past-games';

describe.skipIf(!hasRealDb)('extractAndSavePastGames', () => {
    const ctx = useExtractorHarness('extractAndSavePastGames');

    it('matches the row count of the games_in_past view exactly', async () => {
        const expectedCount = ctx.db.prepare('SELECT COUNT(*) AS n FROM games_in_past').get() as { n: number };

        await extractAndSavePastGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('every entry carries either a videoId or a playlistId', async () => {
        await extractAndSavePastGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { videoId?: string; playlistId?: string }[];

        for (const entry of written) {
            expect(Boolean(entry.videoId) || Boolean(entry.playlistId)).toBe(true);
        }
    });

    it('entries have an availableAt date field', async () => {
        await extractAndSavePastGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { availableAt: unknown }[];

        for (const entry of written) {
            expect(entry.availableAt).toBeDefined();
        }
    });
});