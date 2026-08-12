import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { openTestDb, hasRealDb } from './testDbHelper';
import { updateTierLists } from './update-tier-lists';
import type { Database } from 'better-sqlite3';

const TIER_CATEGORY_IDS: Record<string, number> = {
    tier_masterpiece: 1, tier_excellent: 2, tier_good: 3,
    tier_average: 4, tier_poor: 5, tier_bad: 6, tier_not_evaluated: 7,
};

describe.skipIf(!hasRealDb)('updateTierLists', () => {
    let db: Database;
    let cleanup: () => void;

    beforeEach(() => { ({ db, cleanup } = openTestDb()); });
    afterEach(() => { cleanup(); });

    function pickOneGame() {
        const row = db.prepare(`SELECT id, COALESCE(videoId, playlistId) AS identifier FROM games LIMIT 1`).get() as
            { id: number; identifier: string } | undefined;
        if (!row) throw new Error('Fixture db needs at least one games row');
        return row;
    }
    function pickOneBacklogRow() {
        const row = db.prepare(`SELECT id FROM backlog LIMIT 1`).get() as { id: number } | undefined;
        if (!row) throw new Error('Fixture db needs at least one backlog row');
        return row;
    }
    function pickOneTest() {
        const row = db.prepare(`SELECT id, COALESCE(videoId, playlistId) AS identifier FROM tests LIMIT 1`).get() as
            { id: number; identifier: string } | undefined;
        if (!row) throw new Error('Fixture db needs at least one tests row');
        return row;
    }

    it('GAMES: assigns the requested category to an existing game', async () => {
        const game = pickOneGame();
        await updateTierLists(db, { tierList: 'GAMES', category: 'tier_excellent', games_textarea: game.identifier });

        const row = db.prepare('SELECT category_id FROM tier_list_games WHERE game_id = ?').get(game.id) as any;
        expect(row.category_id).toBe(TIER_CATEGORY_IDS.tier_excellent);
    });

    it('GAMES: re-running with a new category updates rather than duplicates the row', async () => {
        const game = pickOneGame();
        await updateTierLists(db, { tierList: 'GAMES', category: 'tier_poor', games_textarea: game.identifier });
        await updateTierLists(db, { tierList: 'GAMES', category: 'tier_masterpiece', games_textarea: game.identifier });

        const rows = db.prepare('SELECT * FROM tier_list_games WHERE game_id = ?').all(game.id);
        expect(rows).toHaveLength(1);
        expect((rows[0] as any).category_id).toBe(TIER_CATEGORY_IDS.tier_masterpiece);
    });

    it('GAMES: throws for an identifier matching no game', async () => {
        await expect(
            updateTierLists(db, { tierList: 'GAMES', category: 'tier_good', games_textarea: 'NOT_A_REAL_ID' })
        ).rejects.toThrow('Game not found: NOT_A_REAL_ID');
    });

    it('BACKLOG: assigns the requested category using the numeric backlog id', async () => {
        const backlogRow = pickOneBacklogRow();
        await updateTierLists(db, { tierList: 'BACKLOG', category: 'tier_bad', games_textarea: String(backlogRow.id) });

        const row = db.prepare('SELECT category_id FROM tier_list_backlog WHERE backlog_id = ?').get(backlogRow.id) as any;
        expect(row.category_id).toBe(TIER_CATEGORY_IDS.tier_bad);
    });

    it('TESTS: assigns the requested category to an existing test', async () => {
        const test = pickOneTest();
        await updateTierLists(db, { tierList: 'TESTS', category: 'tier_average', games_textarea: test.identifier });

        const row = db.prepare('SELECT category_id FROM tier_list_tests WHERE test_id = ?').get(test.id) as any;
        expect(row.category_id).toBe(TIER_CATEGORY_IDS.tier_average);
    });
});