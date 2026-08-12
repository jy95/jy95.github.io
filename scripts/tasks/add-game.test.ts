import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { openTestDb, hasRealDb } from './testDbHelper';
import { addGameToDatabase } from './add-game';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('addGameToDatabase', () => {
    let db: Database;
    let cleanup: () => void;

    beforeEach(() => { ({ db, cleanup } = openTestDb()); });
    afterEach(() => { cleanup(); });

    it('inserts a row readable back by title and videoId', async () => {
        const title = `Vitest Game ${randomUUID()}`;
        const identifier = `vitest-${randomUUID()}`;
        await addGameToDatabase(db, {
            title,
            releaseDate: '2021-06-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
        });

        const row = db.prepare('SELECT * FROM games WHERE videoId = ?').get(identifier) as any;
        expect(row).toBeDefined();
        expect(row.title).toBe(title);
        expect(row.platform).toBe(1);
        expect(row.releaseDate).toBe('2021-06-01');
    });

    it('defaults duration to 00:00:00 when omitted', async () => {
        const title = `Vitest Game No Duration ${randomUUID()}`;
        const identifier = `vitest-noduration-${randomUUID()}`;
        await addGameToDatabase(db, {
            title,
            releaseDate: '2021-06-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
        });

        const row = db.prepare('SELECT duration FROM games WHERE videoId = ?').get(identifier) as any;
        expect(row.duration).toBe('00:00:00');
    });

    it('links every provided genre to the newly inserted game', async () => {
        const title = `Vitest Game Genres ${randomUUID()}`;
        const identifier = `vitest-genres-${randomUUID()}`;
        await addGameToDatabase(db, {
            title,
            releaseDate: '2021-06-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
            genres: ['Action', 'RPG'],
        });

        const gameId = db.prepare('SELECT id FROM games WHERE videoId = ?').pluck().get(identifier) as number;
        const genreIds = db.prepare('SELECT genre FROM games_genres WHERE game = ? ORDER BY genre')
            .all(gameId)
            .map((r: any) => r.genre);
        expect(genreIds).toEqual([1, 14]); // Action=1, RPG=14 per GENRES_MAP
    });

    it('does not create a games_schedules row when availableAt is omitted', async () => {
        const title = `Vitest Game No Schedule ${randomUUID()}`;
        const identifier = `vitest-noschedule-${randomUUID()}`;
        await addGameToDatabase(db, {
            title,
            releaseDate: '2021-06-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
        });

        const gameId = db.prepare('SELECT id FROM games WHERE videoId = ?').pluck().get(identifier) as number;
        const schedule = db.prepare('SELECT * FROM games_schedules WHERE id = ?').get(gameId);
        expect(schedule).toBeUndefined();
    });

    it('creates a games_schedules row with availableAt/endAt when availableAt is provided', async () => {
        const title = `Vitest Game Scheduled ${randomUUID()}`;
        const identifier = `vitest-scheduled-${randomUUID()}`;
        await addGameToDatabase(db, {
            title,
            releaseDate: '2021-06-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
            availableAt: '2026-01-01',
            endAt: '2026-01-31',
        });

        const gameId = db.prepare('SELECT id FROM games WHERE videoId = ?').pluck().get(identifier) as number;
        const schedule = db.prepare('SELECT availableAt, endAt FROM games_schedules WHERE id = ?').get(gameId) as any;
        expect(schedule.availableAt).toBe('2026-01-01');
        expect(schedule.endAt).toBe('2026-01-31');
    });

    it('inserts a row keyed by playlistId when identifierKind is Playlist', async () => {
        const title = `Vitest Playlist Game ${randomUUID()}`;
        const identifier = `PLvitest-${randomUUID()}`;
        await addGameToDatabase(db, {
            title,
            releaseDate: '2021-06-01',
            identifierKind: 'Playlist',
            identifierValue: identifier,
            platform: 'PS3',
        });

        const row = db.prepare('SELECT * FROM games WHERE playlistId = ?').get(identifier) as any;
        expect(row).toBeDefined();
        expect(row.platform).toBe(6);
    });
});