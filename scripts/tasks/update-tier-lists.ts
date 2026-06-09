import { findIdsInTextArea } from './common/utils';

import type { Database } from 'better-sqlite3';
import type { TierListPayload } from './common/types';

const TIER_LIST_CATEGORIES = {
    "tier_masterpiece": 1,
    "tier_excellent": 2,
    "tier_average": 3,
    "tier_trash": 4,
    "tier_not_evaluated": 5,
} satisfies Record<TierListPayload['category'], number>;

export async function updateTierLists(db: Database, payload: TierListPayload) {
    // Destructure payload
    const { tierList, category, games_textarea } = payload;

    // Parameters
    const gameIDs = findIdsInTextArea(games_textarea);
    const categoryId = TIER_LIST_CATEGORIES[category];
    const defaultCategoryId = TIER_LIST_CATEGORIES['tier_not_evaluated'];

    // Statments
    const fetchGameByIdStmt = db.prepare('SELECT id FROM games WHERE videoId = @id OR playlistId = @id');

    const insertGameToTierListStmt = db.prepare('INSERT OR IGNORE INTO tier_list_games (game_id, category_id) VALUES (@id, @category)');
    const insertBacklogGameToTierListStmt = db.prepare('INSERT OR IGNORE INTO backlog_tier_list_games (backlog_id, category_id) VALUES (@id, @category)');
    
    const updateGameCategoryStmt = db.prepare('UPDATE tier_list_games SET category_id = @category WHERE game_id = @id');
    const updateBacklogGameCategoryStmt = db.prepare('UPDATE backlog_tier_list_games SET category_id = @category WHERE backlog_id = @id');

    // Update games tier list
    const updateGamesTierList = db.transaction(() => {
        for (const gameIdentifier of gameIDs) {
            // Fetch game ID
            const gameId = fetchGameByIdStmt.pluck().get({ id: gameIdentifier }) as number;

            if (!gameId) {
                throw new Error(`Game not found: ${gameIdentifier}`);
            }

            // Insert or update game category
            insertGameToTierListStmt.run({ id: gameId, category: defaultCategoryId });
            updateGameCategoryStmt.run({ id: gameId, category: categoryId });
        }
    });

    // Update backlog tier list
    const updateBacklogTierList = db.transaction(() => {
        for (const gameIdentifier of gameIDs) {
            // Fetch game ID
            const backlogId = parseInt(gameIdentifier);

            if (!backlogId) {
                throw new Error(`Backlog game not found: ${gameIdentifier}`);
            }

            // Insert or update backlog game category
            insertBacklogGameToTierListStmt.run({ id: backlogId, category: defaultCategoryId });
            updateBacklogGameCategoryStmt.run({ id: backlogId, category: categoryId });
        }
    });

    // Execution time
    switch (tierList) {
        case "GAMES":
            return updateGamesTierList();
        case "BACKLOG":
            return updateBacklogTierList();
    }

}