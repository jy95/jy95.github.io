import { describe, it, expect } from 'vitest';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { randomUUID } from 'node:crypto';
import { hasRealDb } from './testDbHelper';
import { addSerieToDatabase } from './add-serie';
import { manageSerieInDatabase } from './manage-serie';

describe.skipIf(!hasRealDb)('manageSerieInDatabase', () => {
    const ctx = useExtractorHarness('manageSerieInDatabase');

    function pickTwoGames() {
        const rows = ctx.db.prepare(
            `SELECT id, COALESCE(videoId, playlistId) AS identifier FROM games LIMIT 2`
        ).all() as { id: number; identifier: string }[];
        if (rows.length < 2) throw new Error('Fixture db needs at least two games rows');
        return rows;
    }

    it('throws for a serie title that does not exist', async () => {
        await expect(
            manageSerieInDatabase(ctx.db, { title: `Nonexistent Serie ${randomUUID()}`, games_textarea: '' })
        ).rejects.toThrow('Series not found');
    });

    it('links the listed games to the serie in order, starting at 1', async () => {
        const title = `Vitest Manage Serie ${randomUUID()}`;
        await addSerieToDatabase(ctx.db, { title });
        const serieId = ctx.db.prepare('SELECT id FROM series WHERE name = ?').pluck().get(title) as number;

        const [gameA, gameB] = pickTwoGames();
        await manageSerieInDatabase(ctx.db, {
            title,
            games_textarea: `${gameA.identifier}\n${gameB.identifier}`,
        });

        const linkA = ctx.db.prepare('SELECT `order` FROM series_games WHERE serie = ? AND game = ?')
            .get(serieId, gameA.id) as any;
        const linkB = ctx.db.prepare('SELECT `order` FROM series_games WHERE serie = ? AND game = ?')
            .get(serieId, gameB.id) as any;

        expect(linkA.order).toBe(1);
        expect(linkB.order).toBe(2);
    });

    it('replaces previously linked games rather than appending to them', async () => {
        const title = `Vitest Replace Serie ${randomUUID()}`;
        await addSerieToDatabase(ctx.db, { title });
        const serieId = ctx.db.prepare('SELECT id FROM series WHERE name = ?').pluck().get(title) as number;

        const [gameA, gameB] = pickTwoGames();
        await manageSerieInDatabase(ctx.db, { title, games_textarea: gameA.identifier });
        await manageSerieInDatabase(ctx.db, { title, games_textarea: gameB.identifier });

        const remaining = ctx.db.prepare('SELECT game FROM series_games WHERE serie = ?').all(serieId) as { game: number }[];
        expect(remaining).toHaveLength(1);
        expect(remaining[0].game).toBe(gameB.id);
    });

    it('throws and inserts nothing for an unknown game identifier', async () => {
        const title = `Vitest Unknown Game Serie ${randomUUID()}`;
        await addSerieToDatabase(ctx.db, { title });
        const serieId = ctx.db.prepare('SELECT id FROM series WHERE name = ?').pluck().get(title) as number;
        const [originalGame, replacementGame] = pickTwoGames();
        await manageSerieInDatabase(ctx.db, { title, games_textarea: originalGame.identifier });

        await expect(
            manageSerieInDatabase(ctx.db, {
                title,
                games_textarea: `${replacementGame.identifier}\nDOES_NOT_EXIST_XYZ`,
            })
        ).rejects.toThrow('Game not found: DOES_NOT_EXIST_XYZ');

        const remaining = ctx.db.prepare('SELECT COUNT(*) AS n FROM series_games WHERE serie = ?').get(serieId) as { n: number };
        expect(remaining.n).toBe(0);
    });
});
