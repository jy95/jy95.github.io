import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSavePastGames } from './past-games';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSavePastGames', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('past-games'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('matches the row count of the games_in_past view exactly', async () => {
        const expectedCount = db.prepare('SELECT COUNT(*) AS n FROM games_in_past').get() as { n: number };

        await extractAndSavePastGames(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('every entry carries either a videoId or a playlistId', async () => {
        await extractAndSavePastGames(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { videoId?: string; playlistId?: string }[];

        for (const entry of written) {
            expect(Boolean(entry.videoId) || Boolean(entry.playlistId)).toBe(true);
        }
    });

    it('entries have an availableAt date field', async () => {
        await extractAndSavePastGames(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { availableAt: unknown }[];

        for (const entry of written) {
            expect(entry.availableAt).toBeDefined();
        }
    });
});