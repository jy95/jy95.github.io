import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from './common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveRelatedGames } from './related-games';

describe.skipIf(!hasRealDb)('extractAndSaveRelatedGames', () => {
    const ctx = useExtractorHarness('extractAndSaveRelatedGames');

    it('writes an object keyed by planning game ids, not an array', async () => {
        await extractAndSaveRelatedGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, unknown>;
        const planningIds = (ctx.db.prepare(`
            SELECT COALESCE(g.videoId, g.playlistId) AS identifier
            FROM games_in_future gif JOIN games g ON g.id = gif.id
            WHERE g.id NOT IN (SELECT dlc FROM games_dlcs)
        `).all() as { identifier: string }[]).map(({ identifier }) => identifier);

        expect(typeof written).toBe('object');
        expect(Array.isArray(written)).toBe(false);
        expect(Object.keys(written).sort()).toEqual(planningIds.sort());
    });

    it('never lists more than 12 related games per entry', async () => {
        await extractAndSaveRelatedGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, unknown[]>;

        for (const related of Object.values(written)) {
            expect(related.length).toBeLessThanOrEqual(12);
        }
    });

    it('never lists a game as related to itself', async () => {
        await extractAndSaveRelatedGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, { id: string }[]>;

        for (const [gameId, related] of Object.entries(written)) {
            expect(related.some((r) => r.id === gameId)).toBe(false);
        }
    });

    it('writes only compact card fields without ranking metadata', async () => {
        await extractAndSaveRelatedGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<
            string,
            Record<string, unknown>[]
        >;

        for (const related of Object.values(written)) {
            for (const entry of related) {
                expect(Object.keys(entry).sort()).toEqual([
                    'id', 'imagePath', 'title', 'url', 'url_type',
                ]);
                expect(entry.id).toBeTruthy();
                expect(entry.title).toBeTruthy();
                expect(entry.imagePath).toBeTruthy();
                expect(['VIDEO', 'PLAYLIST']).toContain(entry.url_type);
                expect(entry).not.toHaveProperty('score');
                expect(entry).not.toHaveProperty('reason');
                expect(entry).not.toHaveProperty('titleSimilarity');
                expect(entry).not.toHaveProperty('durationDeltaSeconds');
            }
        }
    });

    it('only recommends published non-DLC candidates with valid tier categories', async () => {
        await extractAndSaveRelatedGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, { id: string }[]>;
        const candidateRows = ctx.db.prepare(`
            SELECT COALESCE(g.videoId, g.playlistId) AS identifier,
                   COALESCE(tc.slug, 'tier_not_evaluated') AS category
            FROM games_in_present g
            LEFT JOIN tier_list_games tlg ON tlg.game_id = g.id
            LEFT JOIN tier_categories tc ON tc.id = tlg.category_id
            WHERE g.id NOT IN (SELECT dlc FROM games_dlcs)
        `).all() as { identifier: string; category: string }[];
        const validTiers = new Set([
            'tier_masterpiece', 'tier_excellent', 'tier_good', 'tier_average',
            'tier_poor', 'tier_bad', 'tier_not_evaluated',
        ]);
        const candidates = new Map(candidateRows.map((row) => [row.identifier, row.category]));

        for (const related of Object.values(written)) {
            for (const entry of related) {
                expect(candidates.has(entry.id)).toBe(true);
                expect(validTiers.has(candidates.get(entry.id)!)).toBe(true);
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
