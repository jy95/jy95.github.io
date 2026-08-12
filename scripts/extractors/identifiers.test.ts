import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSaveRandomList } from './identifiers';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSaveRandomList', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('identifiers'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('matches the row count of games_in_present exactly', async () => {
        const expectedCount = db.prepare('SELECT COUNT(*) AS n FROM games_in_present').get() as { n: number };

        await extractAndSaveRandomList(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written).toHaveLength(expectedCount.n);
    });

    it('every entry carries exactly one of videoId or playlistId (this feeds /api/random\'s type detection)', async () => {
        await extractAndSaveRandomList(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { videoId?: string; playlistId?: string }[];

        for (const entry of written) {
            const hasVideo = 'videoId' in entry && Boolean(entry.videoId);
            const hasPlaylist = 'playlistId' in entry && Boolean(entry.playlistId);
            // XOR: exactly one should be truthy — /api/random's fallback
            // `entry.playlistId ?? entry.videoId` silently breaks otherwise.
            expect(hasVideo !== hasPlaylist).toBe(true);
        }
    });

    it('contains no duplicate identifiers', async () => {
        await extractAndSaveRandomList(db, outPath);
        const written = JSON.parse(await readFile(outPath, 'utf-8')) as { videoId?: string; playlistId?: string }[];

        const ids = written.map((e) => e.videoId ?? e.playlistId);
        expect(new Set(ids).size).toBe(ids.length);
    });
});