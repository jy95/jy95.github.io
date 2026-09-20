import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb, openTestDb } from './testDbHelper';
import { addGameToDatabase } from './add-game';

describe.skipIf(!hasRealDb)('addGameToDatabase', () => {

    const ctx = useExtractorHarness('addGameToDatabase');

    it('inserts a row readable back by title and videoId', async () => {
        const title = `Vitest Game ${randomUUID()}`;
        const identifier = `vitest-${randomUUID()}`;
        await addGameToDatabase(ctx.db, {
            title,
            releaseDate: '2021-06-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
        });

        const row = ctx.db.prepare('SELECT * FROM games WHERE videoId = ?').get(identifier) as any;
        expect(row).toBeDefined();
        expect(row.title).toBe(title);
        expect(row.platform).toBe(1);
        expect(row.releaseDate).toBe('2021-06-01');
    });

    it('defaults duration to 00:00:00 when omitted', async () => {
        const title = `Vitest Game No Duration ${randomUUID()}`;
        const identifier = `vitest-noduration-${randomUUID()}`;
        await addGameToDatabase(ctx.db, {
            title,
            releaseDate: '2021-06-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
        });

        const row = ctx.db.prepare('SELECT duration FROM games WHERE videoId = ?').get(identifier) as any;
        expect(row.duration).toBe('00:00:00');
    });

    it('links every provided genre to the newly inserted game', async () => {
        const title = `Vitest Game Genres ${randomUUID()}`;
        const identifier = `vitest-genres-${randomUUID()}`;
        await addGameToDatabase(ctx.db, {
            title,
            releaseDate: '2021-06-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
            genres: ['Action', 'RPG'],
        });

        const gameId = ctx.db.prepare('SELECT id FROM games WHERE videoId = ?').pluck().get(identifier) as number;
        const genreIds = ctx.db.prepare('SELECT genre FROM games_genres WHERE game = ? ORDER BY genre')
            .all(gameId)
            .map((r: any) => r.genre);
        expect(genreIds).toEqual([1, 14]); // Action=1, RPG=14 per GENRES_MAP
    });

    it('does not create a games_schedules row when availableAt is omitted', async () => {
        const title = `Vitest Game No Schedule ${randomUUID()}`;
        const identifier = `vitest-noschedule-${randomUUID()}`;
        await addGameToDatabase(ctx.db, {
            title,
            releaseDate: '2021-06-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
        });

        const gameId = ctx.db.prepare('SELECT id FROM games WHERE videoId = ?').pluck().get(identifier) as number;
        const schedule = ctx.db.prepare('SELECT * FROM games_schedules WHERE id = ?').get(gameId);
        expect(schedule).toBeUndefined();
    });

    it('creates a games_schedules row with availableAt/endAt when availableAt is provided', async () => {
        const title = `Vitest Game Scheduled ${randomUUID()}`;
        const identifier = `vitest-scheduled-${randomUUID()}`;
        await addGameToDatabase(ctx.db, {
            title,
            releaseDate: '2021-06-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
            availableAt: '2026-01-01',
            endAt: '2026-01-31',
        });

        const gameId = ctx.db.prepare('SELECT id FROM games WHERE videoId = ?').pluck().get(identifier) as number;
        const schedule = ctx.db.prepare('SELECT availableAt, endAt FROM games_schedules WHERE id = ?').get(gameId) as any;
        expect(schedule.availableAt).toBe('2026-01-01');
        expect(schedule.endAt).toBe('2026-01-31');
    });

    it('inserts a row keyed by playlistId when identifierKind is Playlist', async () => {
        const title = `Vitest Playlist Game ${randomUUID()}`;
        const identifier = `PLvitest-${randomUUID()}`;
        await addGameToDatabase(ctx.db, {
            title,
            releaseDate: '2021-06-01',
            identifierKind: 'Playlist',
            identifierValue: identifier,
            platform: 'PS3',
        });

        const row = ctx.db.prepare('SELECT * FROM games WHERE playlistId = ?').get(identifier) as any;
        expect(row).toBeDefined();
        expect(row.platform).toBe(6);
    });

    it('rolls back the game insert when schedule synchronization fails', async () => {
        const { db, cleanup } = await openTestDb();
        const identifier = `vitest-rollback-${randomUUID()}`;

        try {
            db.exec(`
                CREATE TEMP TRIGGER fail_game_schedule_insert
                BEFORE INSERT ON games_schedules
                BEGIN
                    SELECT RAISE(ABORT, 'schedule synchronization failed');
                END
            `);

            await expect(addGameToDatabase(db, {
                title: 'Rollback Game',
                releaseDate: '2021-06-01',
                identifierKind: 'Video',
                identifierValue: identifier,
                platform: 'PC',
                availableAt: '2026-01-01',
            })).rejects.toThrow('schedule synchronization failed');

            expect(db.prepare('SELECT id FROM games WHERE videoId = ?').get(identifier)).toBeUndefined();
        } finally {
            cleanup();
        }
    });

    it('links provided developers and publishers to the newly inserted game', async () => {
        const title = `Vitest Game Companies ${randomUUID()}`;
        const identifier = `vitest-companies-${randomUUID()}`;

        await addGameToDatabase(ctx.db, {
            title,
            releaseDate: '2021-06-01',
            identifierKind: 'Video',
            identifierValue: identifier,
            platform: 'PC',
            developers_textarea: 'Capcom\nM-Two',
            publishers_textarea: 'Capcom',
        });

        const gameId = ctx.db
            .prepare('SELECT id FROM games WHERE videoId = ?')
            .pluck()
            .get(identifier) as number;

        const companies = ctx.db.prepare(`
            SELECT c.name, gc.role
            FROM games_companies gc
            JOIN companies c ON c.id = gc.company
            WHERE gc.game = ?
            ORDER BY gc.role, c.name
        `).all(gameId) as Array<{ name: string; role: string }>;

        expect(companies).toEqual([
            { name: 'Capcom', role: 'developer' },
            { name: 'M-Two', role: 'developer' },
            { name: 'Capcom', role: 'publisher' },
        ]);
    });

    it('rolls back the game insert when company synchronization fails', async () => {
        const { db, cleanup } = await openTestDb();
        const identifier = `vitest-company-rollback-${randomUUID()}`;

        try {
            db.exec(`
            CREATE TEMP TRIGGER fail_game_company_insert
            BEFORE INSERT ON games_companies
            BEGIN
                SELECT RAISE(ABORT, 'company synchronization failed');
            END
        `);

            await expect(addGameToDatabase(db, {
                title: 'Company Rollback Game',
                releaseDate: '2021-06-01',
                identifierKind: 'Video',
                identifierValue: identifier,
                platform: 'PC',
                developers_textarea: 'Capcom',
            })).rejects.toThrow('company synchronization failed');

            expect(
                db.prepare('SELECT id FROM games WHERE videoId = ?').get(identifier)
            ).toBeUndefined();
        } finally {
            cleanup();
        }
    });

});
