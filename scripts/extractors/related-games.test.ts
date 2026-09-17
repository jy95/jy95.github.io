import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from './common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveRelatedGames } from './related-games';

describe.skipIf(!hasRealDb)('extractAndSaveRelatedGames', () => {
    const ctx = useExtractorHarness('extractAndSaveRelatedGames');

    it('writes an object keyed by published game ids, not an array', async () => {
        await extractAndSaveRelatedGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8'));

        expect(typeof written).toBe('object');
        expect(Array.isArray(written)).toBe(false);
    });

    it('never lists more than 3 related games per entry', async () => {
        await extractAndSaveRelatedGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, unknown[]>;

        for (const related of Object.values(written)) {
            expect(related.length).toBeLessThanOrEqual(3);
        }
    });

    it('never lists a game as related to itself', async () => {
        await extractAndSaveRelatedGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, { id: string }[]>;

        for (const [gameId, related] of Object.entries(written)) {
            expect(related.some((r) => r.id === gameId)).toBe(false);
        }
    });

    it('every related entry has a valid reason and required card fields', async () => {
        await extractAndSaveRelatedGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<
            string,
            { id: string; title: string; imagePath: string; url: string; url_type: string; reason: string }[]
        >;

        const validReasons = new Set(['series', 'genres', 'platform', 'duration']);
        for (const related of Object.values(written)) {
            for (const entry of related) {
                expect(validReasons.has(entry.reason)).toBe(true);
                expect(entry.id).toBeTruthy();
                expect(entry.title).toBeTruthy();
                expect(entry.imagePath).toBeTruthy();
                expect(['VIDEO', 'PLAYLIST']).toContain(entry.url_type);
            }
        }
    });

    it('produces identical output on repeated runs (deterministic)', async () => {
        await extractAndSaveRelatedGames(ctx.db, ctx.outPath);
        const first = await readFile(ctx.outPath, 'utf-8');

        await extractAndSaveRelatedGames(ctx.db, ctx.outPath);
        const second = await readFile(ctx.outPath, 'utf-8');

        expect(second).toBe(first);
    });

    it('excludes games registered as a DLC of another game', async () => {
        await extractAndSaveRelatedGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, unknown>;

        const dlcIdentifiers = new Set(
            (
                ctx.db
                    .prepare(
                        `SELECT COALESCE(g.videoId, g.playlistId) AS identifier
                         FROM games g WHERE g.id IN (SELECT dlc FROM games_dlcs)`
                    )
                    .all() as { identifier: string }[]
            ).map((r) => r.identifier)
        );

        for (const identifier of dlcIdentifiers) {
            expect(written).not.toHaveProperty(identifier);
        }
    });
});