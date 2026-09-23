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

    it("exposes a valid availability_status", () => {
        const rows = ctx.db
            .prepare(`
            SELECT DISTINCT availability_status
            FROM games_full
        `)
            .all() as { availability_status: string }[];

        const allowed = new Set([
            "unscheduled",
            "present",
            "future",
            "past",
        ]);

        for (const row of rows) {
            expect(allowed.has(row.availability_status)).toBe(true);
        }
    });

    it("matches the games_in_present view row count", async () => {
        const expectedCount = ctx.db
            .prepare(`
            SELECT COUNT(*) AS n
            FROM games_in_present
        `)
            .get() as { n: number };

        await extractAndSaveGames(ctx.db, ctx.outPath);
        const written = JSON.parse(
            await readFile(ctx.outPath, "utf-8")
        );

        expect(written).toHaveLength(expectedCount.n);
    });

    it("games_in_present excludes only future games", () => {
        const invalid = ctx.db
            .prepare(`
            SELECT COUNT(*) AS n
            FROM games_in_present gip
            INNER JOIN games_full gf
                ON gf.id = gip.id
            WHERE gf.availability_status = 'future'
        `)
            .get() as { n: number };

        expect(invalid.n).toBe(0);
    });

    it("matches the games_full rows that are not future", () => {
        const expected = ctx.db
            .prepare(`
            SELECT COUNT(*) AS n
            FROM games_full
            WHERE availability_status != 'future'
        `)
            .get() as { n: number };

        const actual = ctx.db
            .prepare(`
            SELECT COUNT(*) AS n
            FROM games_in_present
        `)
            .get() as { n: number };

        expect(actual.n).toBe(expected.n);
    });

    it("games_in_future contains present and future games", () => {
        const expected = ctx.db
            .prepare(`
            SELECT COUNT(*) AS n
            FROM games_full
            WHERE availability_status IN ('present', 'future')
        `)
            .get() as { n: number };

        const actual = ctx.db
            .prepare(`
            SELECT COUNT(*) AS n
            FROM games_in_future
        `)
            .get() as { n: number };

        expect(actual.n).toBe(expected.n);
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