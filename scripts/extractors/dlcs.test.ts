import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSaveDLCS } from './dlcs';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSaveDLCS', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('dlcs'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('matches the row count of the dlcs_as_json view', async () => {
        const expectedCount = db.prepare('SELECT COUNT(*) AS n FROM dlcs_as_json').get() as { n: number };

        await extractAndSaveDLCS(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('matches the number of distinct games that own at least one DLC', async () => {
        const expectedCount = db
            .prepare('SELECT COUNT(DISTINCT game) AS n FROM games_dlcs')
            .get() as { n: number };

        await extractAndSaveDLCS(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('every parent entry lists at least one dlc item', async () => {
        await extractAndSaveDLCS(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { dlcs: unknown[] }[];

        for (const entry of written) {
            expect(Array.isArray(entry.dlcs)).toBe(true);
            expect(entry.dlcs.length).toBeGreaterThan(0);
        }
    });
});