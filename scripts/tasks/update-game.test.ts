import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { openTestDb, hasRealDb } from './testDbHelper';
import { addGameToDatabase } from './add-game';
import { updateGameInDatabase } from './update-game';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('updateGameInDatabase', () => {
    let db: Database;
    let cleanup: () => void;
    let identifier: string;
    let gameId: number;

    beforeEach(async () => {
        ({ db, cleanup } = openTestDb());
        identifier = `vitest-updategame-${randomUUID()}`;
        await addGameToDatabase(db, {
            title: 'Original Game Title',
            releaseDate: '2020-01-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
            duration: '01:00:00',
            genres: ['Action'],
        });
        gameId = db.prepare('SELECT id FROM games WHERE videoId = ?').pluck().get(identifier) as number;
    });
    afterEach(() => { cleanup(); });

    it('throws for an identifier matching no game', async () => {
        await expect(
            updateGameInDatabase(db, { identifierKind: 'Video', identifierValue: 'DOES_NOT_EXIST_XYZ' })
        ).rejects.toThrow('Game record not found');
    });

    it('updates the title when provided', async () => {
        await updateGameInDatabase(db, { identifierKind: 'Video', identifierValue: identifier, title: 'Updated Game Title' });
        const row = db.prepare('SELECT title FROM games WHERE id = ?').get(gameId) as any;
        expect(row.title).toBe('Updated Game Title');
    });

    it('leaves the title untouched when omitted', async () => {
        await updateGameInDatabase(db, { identifierKind: 'Video', identifierValue: identifier, duration: '02:00:00' });
        const row = db.prepare('SELECT title FROM games WHERE id = ?').get(gameId) as any;
        expect(row.title).toBe('Original Game Title');
    });

    it('updates the platform when provided', async () => {
        await updateGameInDatabase(db, { identifierKind: 'Video', identifierValue: identifier, platform: 'PS3' });
        const row = db.prepare('SELECT platform FROM games WHERE id = ?').get(gameId) as any;
        expect(row.platform).toBe(6);
    });

    it('replaces genres rather than appending when new genres are provided', async () => {
        await updateGameInDatabase(db, { identifierKind: 'Video', identifierValue: identifier, genres: ['RPG', 'Strategy'] });
        const genreIds = db.prepare('SELECT genre FROM games_genres WHERE game = ? ORDER BY genre')
            .all(gameId)
            .map((r: any) => r.genre);
        expect(genreIds).toEqual([14, 19]); // RPG=14, Strategy=19
    });

    it('leaves existing genres untouched when genres is omitted', async () => {
        await updateGameInDatabase(db, { identifierKind: 'Video', identifierValue: identifier, title: 'No Genre Change' });
        const genreIds = db.prepare('SELECT genre FROM games_genres WHERE game = ?')
            .all(gameId)
            .map((r: any) => r.genre);
        expect(genreIds).toEqual([1]); // still just Action
    });

    it('creates a games_schedules row on first availableAt update if none existed', async () => {
        await updateGameInDatabase(db, { identifierKind: 'Video', identifierValue: identifier, availableAt: '2026-03-01' });
        const schedule = db.prepare('SELECT availableAt FROM games_schedules WHERE id = ?').get(gameId) as any;
        expect(schedule.availableAt).toBe('2026-03-01');
    });

    it('updates endAt on an existing schedule row without duplicating it', async () => {
        await updateGameInDatabase(db, { identifierKind: 'Video', identifierValue: identifier, availableAt: '2026-03-01' });
        await updateGameInDatabase(db, { identifierKind: 'Video', identifierValue: identifier, endAt: '2026-03-15' });

        const rows = db.prepare('SELECT * FROM games_schedules WHERE id = ?').all(gameId);
        expect(rows).toHaveLength(1);
        const schedule = rows[0] as any;
        expect(schedule.availableAt).toBe('2026-03-01');
        expect(schedule.endAt).toBe('2026-03-15');
    });
});