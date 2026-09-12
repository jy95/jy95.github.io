import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveRandomList } from './identifiers';

describe.skipIf(!hasRealDb)('extractAndSaveRandomList', () => {
    const ctx = useExtractorHarness('extractAndSaveRandomList');

    it('matches the row count of games_in_present exactly', async () => {
        const expectedCount = ctx.db.prepare('SELECT COUNT(*) AS n FROM games_in_present').get() as { n: number };

        await extractAndSaveRandomList(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('every entry carries exactly one of videoId or playlistId (this feeds /api/random\'s type detection)', async () => {
        await extractAndSaveRandomList(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { videoId?: string; playlistId?: string }[];

        for (const entry of written) {
            const hasVideo = 'videoId' in entry && Boolean(entry.videoId);
            const hasPlaylist = 'playlistId' in entry && Boolean(entry.playlistId);
            // XOR: exactly one should be truthy — /api/random's fallback
            // `entry.playlistId ?? entry.videoId` silently breaks otherwise.
            expect(hasVideo !== hasPlaylist).toBe(true);
        }
    });

    it('contains no duplicate identifiers', async () => {
        await extractAndSaveRandomList(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as { videoId?: string; playlistId?: string }[];

        const ids = written.map((e) => e.videoId ?? e.playlistId);
        expect(new Set(ids).size).toBe(ids.length);
    });
});