import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSaveStats } from './stats';
import type { Database } from 'better-sqlite3';

type StatsOutput = {
    platforms: unknown[];
    genres: unknown[];
    general: {
        channel_start_date: string;
        games: { total: number; total_available: number; total_unavailable: number };
        dlcs: { total: number; total_available: number; total_unavailable: number };
        duration: {
            total: { hours: number; minutes: number; seconds: number };
            total_available: { hours: number; minutes: number; seconds: number };
            total_unavailable: { hours: number; minutes: number; seconds: number };
        };
    };
};

describe.skipIf(!hasRealDb)('extractAndSaveStats', () => {
    let db: Database;
    let cleanupDb: () => void;
    let outPath: string;
    let cleanupFile: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: outPath, cleanup: cleanupFile } = tempOutputPath('stats'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupFile();
    });

    it('produces the top-level shape (platforms, genres, general)', async () => {
        await extractAndSaveStats(db, outPath);
        const written: StatsOutput = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written).toHaveProperty('platforms');
        expect(written).toHaveProperty('genres');
        expect(written).toHaveProperty('general');
    });

    it('games total equals available + unavailable, matching independently-run counts', async () => {
        const total = db
            .prepare('SELECT COUNT(*) AS n FROM games WHERE id NOT IN (SELECT dlc FROM games_dlcs)')
            .get() as { n: number };
        const available = db
            .prepare('SELECT COUNT(*) AS n FROM games_in_present WHERE id NOT IN (SELECT dlc FROM games_dlcs)')
            .get() as { n: number };
        const unavailable = db
            .prepare('SELECT COUNT(*) AS n FROM games_in_future WHERE id NOT IN (SELECT dlc FROM games_dlcs)')
            .get() as { n: number };

        await extractAndSaveStats(db, outPath);
        const written: StatsOutput = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written.general.games.total).toBe(total.n);
        expect(written.general.games.total_available).toBe(available.n);
        expect(written.general.games.total_unavailable).toBe(unavailable.n);
    });

    it('dlcs total equals available + unavailable, matching independently-run counts', async () => {
        const total = db.prepare('SELECT COUNT(*) AS n FROM games_dlcs').get() as { n: number };
        const available = db
            .prepare('SELECT COUNT(*) AS n FROM games_in_present WHERE id IN (SELECT dlc FROM games_dlcs)')
            .get() as { n: number };
        const unavailable = db
            .prepare('SELECT COUNT(*) AS n FROM games_in_future WHERE id IN (SELECT dlc FROM games_dlcs)')
            .get() as { n: number };

        await extractAndSaveStats(db, outPath);
        const written: StatsOutput = JSON.parse(await readFile(outPath, 'utf-8'));

        expect(written.general.dlcs.total).toBe(total.n);
        expect(written.general.dlcs.total_available).toBe(available.n);
        expect(written.general.dlcs.total_unavailable).toBe(unavailable.n);
    });

    it('normalizes duration fields into valid hours/minutes/seconds ranges', async () => {
        await extractAndSaveStats(db, outPath);
        const written: StatsOutput = JSON.parse(await readFile(outPath, 'utf-8'));

        for (const bucket of [
            written.general.duration.total,
            written.general.duration.total_available,
            written.general.duration.total_unavailable,
        ]) {
            expect(bucket.minutes).toBeGreaterThanOrEqual(0);
            expect(bucket.minutes).toBeLessThan(60);
            expect(bucket.seconds).toBeGreaterThanOrEqual(0);
            expect(bucket.seconds).toBeLessThan(60);
        }
    });

    it('hardcodes the same channel_start_date used across the app', async () => {
        await extractAndSaveStats(db, outPath);
        const written: StatsOutput = JSON.parse(await readFile(outPath, 'utf-8'));
        expect(written.general.channel_start_date).toBe('2014-04-15T17:35:16+00:00');
    });

    it('every platform stats entry has total = total_available + total_unavailable', async () => {
        await extractAndSaveStats(db, outPath);
        const written: StatsOutput = JSON.parse(await readFile(outPath, 'utf-8'));

        for (const entry of written.platforms as { total: number; total_available: number; total_unavailable: number }[]) {
            expect(entry.total_available + entry.total_unavailable).toBe(entry.total);
        }
    });

    it('every genre stats entry has total = total_available + total_unavailable', async () => {
        await extractAndSaveStats(db, outPath);
        const written: StatsOutput = JSON.parse(await readFile(outPath, 'utf-8'));

        for (const entry of written.genres as { total: number; total_available: number; total_unavailable: number }[]) {
            expect(entry.total_available + entry.total_unavailable).toBe(entry.total);
        }
    });
});