import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { openTestDb, hasRealDb } from './testDbHelper';
import { addSerieToDatabase } from './add-serie';
import { manageSerieInDatabase } from './manage-serie';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('manageSerieInDatabase', () => {
    let db: Database;
    let cleanup: () => void;

    beforeEach(() => { ({ db, cleanup } = openTestDb()); });
    afterEach(() => { cleanup(); });

    function pickTwoGames() {
        const rows = db.prepare(
            `SELECT id, COALESCE(videoId, playlistId) AS identifier FROM games LIMIT 2`
        ).all() as { id: number; identifier: string }[];
        if (rows.length < 2) throw new Error('Fixture db needs at least two games rows');
        return rows;
    }

    it('throws for a serie title that does not exist', async () => {
        await expect(
            manageSerieInDatabase(db, { title: `Nonexistent Serie ${randomUUID()}`, games_textarea: '' })
        ).rejects.toThrow('Series not found');
    });

    it('links the listed games to the serie in order, starting at 1', async () => {
        const title = `Vitest Manage Serie ${randomUUID()}`;
        await addSerieToDatabase(db, { title });
        const serieId = db.prepare('SELECT id FROM series WHERE name = ?').pluck().get(title) as number;

        const [gameA, gameB] = pickTwoGames();
        await manageSerieInDatabase(db, {
            title,
            games_textarea: `${gameA.identifier}\n${gameB.identifier}`,
        });

        const linkA = db.prepare('SELECT `order` FROM series_games WHERE serie = ? AND game = ?')
            .get(serieId, gameA.id) as any;
        const linkB = db.prepare('SELECT `order` FROM series_games WHERE serie = ? AND game = ?')
            .get(serieId, gameB.id) as any;

        expect(linkA.order).toBe(1);
        expect(linkB.order).toBe(2);
    });

    it('replaces previously linked games rather than appending to them', async () => {
        const title = `Vitest Replace Serie ${randomUUID()}`;
        await addSerieToDatabase(db, { title });
        const serieId = db.prepare('SELECT id FROM series WHERE name = ?').pluck().get(title) as number;

        const [gameA, gameB] = pickTwoGames();
        await manageSerieInDatabase(db, { title, games_textarea: gameA.identifier });
        await manageSerieInDatabase(db, { title, games_textarea: gameB.identifier });

        const remaining = db.prepare('SELECT game FROM series_games WHERE serie = ?').all(serieId) as { game: number }[];
        expect(remaining).toHaveLength(1);
        expect(remaining[0].game).toBe(gameB.id);
    });

    it('throws and inserts nothing for an unknown game identifier', async () => {
        const title = `Vitest Unknown Game Serie ${randomUUID()}`;
        await addSerieToDatabase(db, { title });
        const serieId = db.prepare('SELECT id FROM series WHERE name = ?').pluck().get(title) as number;
        const [originalGame, replacementGame] = pickTwoGames();
        await manageSerieInDatabase(db, { title, games_textarea: originalGame.identifier });

        await expect(
            manageSerieInDatabase(db, {
                title,
                games_textarea: `${replacementGame.identifier}\nDOES_NOT_EXIST_XYZ`,
            })
        ).rejects.toThrow('Game not found: DOES_NOT_EXIST_XYZ');

        const remaining = db.prepare(
            'SELECT game, `order` FROM series_games WHERE serie = ?'
        ).all(serieId);
        expect(remaining).toEqual([{ game: originalGame.id, order: 1 }]);
    });
});
