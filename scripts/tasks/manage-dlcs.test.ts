import { describe, it, expect } from 'vitest';
import { useExtractorHarness } from '../extractors/common/extractorTestHarness';
import { hasRealDb } from './testDbHelper';
import { manageDlcsInDatabase } from './manage-dlcs';

describe.skipIf(!hasRealDb)('manageDlcsInDatabase', () => {
    const ctx = useExtractorHarness('manageDlcsInDatabase');

    function pickTwoGames() {
        const rows = ctx.db.prepare(
            `SELECT id, COALESCE(videoId, playlistId) AS identifier FROM games LIMIT 2`
        ).all() as { id: number; identifier: string }[];
        if (rows.length < 2) throw new Error('Fixture db needs at least two games rows');
        return rows;
    }

    it('links the listed dlc to the target game with order 1', async () => {
        const [game, dlc] = pickTwoGames();
        await manageDlcsInDatabase(ctx.db, { gameID: game.identifier, dlcs_textarea: dlc.identifier });

        const link = ctx.db.prepare('SELECT * FROM games_dlcs WHERE game = ? AND dlc = ?').get(game.id, dlc.id) as any;
        expect(link).toBeDefined();
        expect(link.order).toBe(1);
    });

    it('replaces previously linked dlcs rather than appending to them', async () => {
        const [game, dlc] = pickTwoGames();
        await manageDlcsInDatabase(ctx.db, { gameID: game.identifier, dlcs_textarea: dlc.identifier });
        await manageDlcsInDatabase(ctx.db, { gameID: game.identifier, dlcs_textarea: '' });

        const remaining = ctx.db.prepare('SELECT * FROM games_dlcs WHERE game = ?').all(game.id);
        expect(remaining).toHaveLength(0);
    });

    it('throws and inserts nothing for an unknown dlc identifier', async () => {
        const [game] = pickTwoGames();
        const before = ctx.db.prepare('SELECT COUNT(*) AS n FROM games_dlcs').get() as { n: number };

        await expect(
            manageDlcsInDatabase(ctx.db, { gameID: game.identifier, dlcs_textarea: 'DOES_NOT_EXIST_XYZ' })
        ).rejects.toThrow('DLC not found: DOES_NOT_EXIST_XYZ');

        const after = ctx.db.prepare('SELECT COUNT(*) AS n FROM games_dlcs').get() as { n: number };
        expect(after.n).toBe(before.n);
    });
});