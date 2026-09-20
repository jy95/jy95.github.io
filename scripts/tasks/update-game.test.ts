import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'node:crypto';
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
        ({ db, cleanup } = await openTestDb());
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

    it('leaves existing genres untouched when genres is empty', async () => {
        await updateGameInDatabase(db, { identifierKind: 'Video', identifierValue: identifier, genres: [] });
        const genreIds = db.prepare('SELECT genre FROM games_genres WHERE game = ?')
            .all(gameId)
            .map((r: any) => r.genre);
        expect(genreIds).toEqual([1]); // still just Action
    });

    it('removes developer relations when the developer field is explicitly empty', async () => {
        const companyId = db.prepare('INSERT INTO companies (name) VALUES (?)').run('Existing Developer').lastInsertRowid;
        db.prepare('INSERT INTO games_companies (game, company, role) VALUES (?, ?, ?)')
            .run(gameId, companyId, 'developer');

        await updateGameInDatabase(db, {
            identifierKind: 'Video',
            identifierValue: identifier,
            developers_textarea: '',
        });

        const relations = db.prepare('SELECT * FROM games_companies WHERE game = ? AND role = ?')
            .all(gameId, 'developer');
        expect(relations).toHaveLength(0);
    });

    it('leaves developer relations untouched when the developer field is omitted', async () => {
        const companyId = db.prepare('INSERT INTO companies (name) VALUES (?)').run('Existing Developer').lastInsertRowid;
        db.prepare('INSERT INTO games_companies (game, company, role) VALUES (?, ?, ?)')
            .run(gameId, companyId, 'developer');

        await updateGameInDatabase(db, { identifierKind: 'Video', identifierValue: identifier });

        const relations = db.prepare('SELECT * FROM games_companies WHERE game = ? AND role = ?')
            .all(gameId, 'developer');
        expect(relations).toHaveLength(1);
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

    it('rolls back the game update when genre synchronization fails', async () => {
        db.exec(`
            CREATE TEMP TRIGGER fail_game_genre_insert
            BEFORE INSERT ON games_genres
            BEGIN
                SELECT RAISE(ABORT, 'genre synchronization failed');
            END
        `);

        await expect(updateGameInDatabase(db, {
            identifierKind: 'Video',
            identifierValue: identifier,
            title: 'Should Roll Back',
            genres: ['RPG'],
        })).rejects.toThrow('genre synchronization failed');

        const game = db.prepare('SELECT title FROM games WHERE id = ?').get(gameId) as any;
        expect(game.title).toBe('Original Game Title');
        const genreIds = db.prepare('SELECT genre FROM games_genres WHERE game = ?')
            .all(gameId)
            .map((row: any) => row.genre);
        expect(genreIds).toEqual([1]);
    });

    it('replaces developers and publishers when provided', async () => {
        await updateGameInDatabase(db, {
            identifierKind: 'Video',
            identifierValue: identifier,
            developers_textarea: 'Capcom',
            publishers_textarea: 'Capcom',
        });

        await updateGameInDatabase(db, {
            identifierKind: 'Video',
            identifierValue: identifier,
            developers_textarea: 'M-Two\nPlatinumGames',
            publishers_textarea: 'KONAMI',
        });

        const companies = db.prepare(`
            SELECT c.name, gc.role
            FROM games_companies gc
            JOIN companies c ON c.id = gc.company
            WHERE gc.game = ?
            ORDER BY gc.role, c.name
        `).all(gameId) as Array<{ name: string; role: string }>;

        expect(companies).toEqual([
            { name: 'M-Two', role: 'developer' },
            { name: 'PlatinumGames', role: 'developer' },
            { name: 'KONAMI', role: 'publisher' },
        ]);
    });

    it('leaves existing developers untouched when developers is omitted', async () => {
        await updateGameInDatabase(db, {
            identifierKind: 'Video',
            identifierValue: identifier,
            developers_textarea: 'Capcom',
        });

        await updateGameInDatabase(db, {
            identifierKind: 'Video',
            identifierValue: identifier,
            title: 'Updated Title',
        });

        const developers = db.prepare(`
            SELECT c.name
            FROM games_companies gc
            JOIN companies c ON c.id = gc.company
            WHERE gc.game = ?
            AND gc.role = 'developer'
            ORDER BY c.name
        `).all(gameId).map((row: any) => row.name);

        expect(developers).toEqual(['Capcom']);
    });

    it('leaves existing publishers untouched when publishers is omitted', async () => {
        await updateGameInDatabase(db, {
            identifierKind: 'Video',
            identifierValue: identifier,
            publishers_textarea: 'Capcom',
        });

        await updateGameInDatabase(db, {
            identifierKind: 'Video',
            identifierValue: identifier,
            duration: '02:00:00',
        });

        const publishers = db.prepare(`
            SELECT c.name
            FROM games_companies gc
            JOIN companies c ON c.id = gc.company
            WHERE gc.game = ?
            AND gc.role = 'publisher'
        `).all(gameId).map((row: any) => row.name);

        expect(publishers).toEqual(['Capcom']);
    });

    it('leaves existing developers untouched when developers is empty', async () => {
        await updateGameInDatabase(db, {
            identifierKind: 'Video',
            identifierValue: identifier,
            developers_textarea: 'Capcom',
        });

        await updateGameInDatabase(db, {
            identifierKind: 'Video',
            identifierValue: identifier,
            developers_textarea: undefined,
        });

        const developers = db.prepare(`
            SELECT c.name
            FROM games_companies gc
            JOIN companies c ON c.id = gc.company
            WHERE gc.game = ?
            AND gc.role = 'developer'
        `).all(gameId).map((row: any) => row.name);

        expect(developers).toEqual(['Capcom']);
    });
});
