import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveTests } from './tests';

describe.skipIf(!hasRealDb)('extractAndSaveTests', () => {
    const ctx = useExtractorHarness('extractAndSaveTests');

    it('matches the row count of the tests table exactly', async () => {
        const expectedCount = ctx.db.prepare('SELECT COUNT(*) AS n FROM tests').get() as { n: number };

        await extractAndSaveTests(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('only selects title/videoId/playlistId/platform, not extra columns like id', async () => {
        await extractAndSaveTests(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, unknown>[];

        for (const entry of written) {
            expect(entry).not.toHaveProperty('id');
        }
    });

    it('every entry carries either a videoId or a playlistId', async () => {
        await extractAndSaveTests(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { videoId?: string; playlistId?: string }[];

        for (const entry of written) {
            expect(Boolean(entry.videoId) || Boolean(entry.playlistId)).toBe(true);
        }
    });
});