import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSaveGames } from './games';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSaveGames', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('games'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('excludes rows whose id is registered as a DLC of another game', async () => {
        await extractAndSaveGames(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { id: number }[];

        const dlcIds = new Set(
            (db.prepare('SELECT dlc FROM games_dlcs').all() as { dlc: number }[]).map((r) => r.dlc)
        );

        for (const game of written) {
            expect(dlcIds.has(game.id)).toBe(false);
        }
    });

    it('matches the count of games_in_present minus known dlc rows', async () => {
        const expectedCount = db
            .prepare('SELECT COUNT(*) AS n FROM games_in_present WHERE id NOT IN (SELECT dlc FROM games_dlcs)')
            .get() as { n: number };

        await extractAndSaveGames(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('every written game has a title and a platform', async () => {
        await extractAndSaveGames(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { title: string; platform: number }[];

        for (const game of written) {
            expect(typeof game.title).toBe('string');
            expect(game.title.length).toBeGreaterThan(0);
            expect(typeof game.platform).toBe('number');
        }
    });
});