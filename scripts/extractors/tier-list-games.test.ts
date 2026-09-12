import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from '../tasks/testDbHelper';
import { extractAndSaveTierListGames } from './tier-list-games';

describe.skipIf(!hasRealDb)('extractAndSaveTierListGames', () => {

    const ctx = useExtractorHarness('extractAndSaveTierListGames');

    it('the total number of games across all categories equals games_in_present minus dlcs', async () => {
        const expectedCount = ctx.db
            .prepare(
                `SELECT COUNT(*) AS n FROM games_in_present WHERE id NOT IN (SELECT dlc FROM games_dlcs)`
            )
            .get() as { n: number };

        await extractAndSaveTierListGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, unknown[]>;
        const total = Object.values(written).reduce((sum, list) => sum + list.length, 0);

        expect(total).toBe(expectedCount.n);
    });

    it('creates every tier category key, even when empty', async () => {
        const categorySlugs = (ctx.db.prepare('SELECT slug FROM tier_categories').all() as { slug: string }[]).map(
            (c) => c.slug
        );

        await extractAndSaveTierListGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, unknown[]>;

        for (const slug of categorySlugs) {
            expect(written).toHaveProperty(slug);
        }
    });

    it('every entry has the card shape expected by /tier/games (url, url_type, imagePath under /covers)', async () => {
        await extractAndSaveTierListGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<
            string,
            { url: string; url_type: string; imagePath: string }[]
        >;

        for (const list of Object.values(written)) {
            for (const entry of list) {
                expect(entry.url).toMatch(/^https:\/\/www\.youtube\.com\//);
                expect(['PLAYLIST', 'VIDEO']).toContain(entry.url_type);
                expect(entry.imagePath.startsWith('/covers/')).toBe(true);
            }
        }
    });

    it('places every entry under exactly one category', async () => {
        await extractAndSaveTierListGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, { id: string }[]>;

        const seenIds = new Set<string>();
        for (const list of Object.values(written)) {
            for (const entry of list) {
                expect(seenIds.has(entry.id)).toBe(false);
                seenIds.add(entry.id);
            }
        }
    });

    it('excludes rows registered as a DLC of another game', async () => {
        await extractAndSaveTierListGames(ctx.db, ctx.outPath);
        const written = JSON.parse(await readFile(ctx.outPath, 'utf-8')) as Record<string, { id: string }[]>;

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

        for (const list of Object.values(written)) {
            for (const entry of list) {
                expect(dlcIdentifiers.has(entry.id)).toBe(false);
            }
        }
    });
});