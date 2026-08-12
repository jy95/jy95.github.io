import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSaveTests } from './tests';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSaveTests', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('tests'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('matches the row count of the tests table exactly', async () => {
        const expectedCount = db.prepare('SELECT COUNT(*) AS n FROM tests').get() as { n: number };

        await extractAndSaveTests(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('only selects title/videoId/playlistId/platform, not extra columns like id', async () => {
        await extractAndSaveTests(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as Record<string, unknown>[];

        for (const entry of written) {
            expect(entry).not.toHaveProperty('id');
        }
    });

    it('every entry carries either a videoId or a playlistId', async () => {
        await extractAndSaveTests(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { videoId?: string; playlistId?: string }[];

        for (const entry of written) {
            expect(Boolean(entry.videoId) || Boolean(entry.playlistId)).toBe(true);
        }
    });
});