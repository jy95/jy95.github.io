import { findIdsInTextArea } from './common/utils';

import type { Database } from 'better-sqlite3';
import type { TierListPayload } from './common/types';

const TIER_LIST_CATEGORIES = {
    "tier_masterpiece": 1,
    "tier_excellent": 2,
    "tier_good": 3,
    "tier_average": 4,
    "tier_poor": 5,
    "tier_bad": 6,
    "tier_not_evaluated": 7,
} satisfies Record<TierListPayload['category'], number>;

export async function updateTierLists(db: Database, payload: TierListPayload) {
    // Destructure payload
    const { tierList, category, games_textarea } = payload;
    
    console.log(`[DEBUG] Starting updateTierLists for target: ${tierList}, category: ${category}`);

    // Parameters
    const gameIDs = findIdsInTextArea(games_textarea);
    const categoryId = TIER_LIST_CATEGORIES[category];
    const defaultCategoryId = TIER_LIST_CATEGORIES['tier_not_evaluated'];

    console.log(`[DEBUG] Found ${gameIDs.length} raw IDs in textarea:`, gameIDs);
    console.log(`[DEBUG] Category ID mapped to: ${categoryId} (Default: ${defaultCategoryId})`);

    // Statements
    const fetchGameByIdStmt = db.prepare('SELECT id FROM games WHERE videoId = @id OR playlistId = @id');

    const insertGameToTierListStmt = db.prepare('INSERT OR IGNORE INTO tier_list_games (game_id, category_id) VALUES (@id, @category)');
    const insertBacklogGameToTierListStmt = db.prepare('INSERT OR IGNORE INTO tier_list_backlog (backlog_id, category_id) VALUES (@id, @category)');
    
    const updateGameCategoryStmt = db.prepare('UPDATE tier_list_games SET category_id = @category WHERE game_id = @id');
    const updateBacklogGameCategoryStmt = db.prepare('UPDATE tier_list_backlog SET category_id = @category WHERE backlog_id = @id');

    // Update games tier list
    const updateGamesTierList = db.transaction(() => {
        console.log(`[DEBUG] [Transaction GAMES] Starting processing of ${gameIDs.length} items...`);
        for (const gameIdentifier of gameIDs) {
            // Fetch game ID
            const gameId = fetchGameByIdStmt.pluck().get({ id: gameIdentifier }) as number;

            if (!gameId) {
                console.error(`[DEBUG] [Transaction GAMES] Error: Game NOT found in DB for identifier: ${gameIdentifier}`);
                throw new Error(`Game not found: ${gameIdentifier}`);
            }

            console.log(`[DEBUG] [Transaction GAMES] Processing gameIdentifier: "${gameIdentifier}" -> DB internal ID: ${gameId}`);

            // Insert or update game category
            const insertResult = insertGameToTierListStmt.run({ id: gameId, category: defaultCategoryId });
            console.log(`[DEBUG] [Transaction GAMES] Insert (Ignore if exists) status - Changes: ${insertResult.changes}`);

            const updateResult = updateGameCategoryStmt.run({ id: gameId, category: categoryId });
            console.log(`[DEBUG] [Transaction GAMES] Update to category ${categoryId} status - Changes: ${updateResult.changes}`);
        }
        console.log(`[DEBUG] [Transaction GAMES] Transaction completed successfully.`);
    });

    // Update backlog tier list
    const updateBacklogTierList = db.transaction(() => {
        console.log(`[DEBUG] [Transaction BACKLOG] Starting processing of ${gameIDs.length} items...`);
        for (const gameIdentifier of gameIDs) {
            // Fetch game ID
            const backlogId = parseInt(gameIdentifier);

            if (!backlogId) {
                console.error(`[DEBUG] [Transaction BACKLOG] Error: Failed to parse identifier into valid ID: ${gameIdentifier}`);
                throw new Error(`Backlog game not found: ${gameIdentifier}`);
            }

            console.log(`[DEBUG] [Transaction BACKLOG] Processing parsed backlogId: ${backlogId}`);

            // Insert or update backlog game category
            const insertResult = insertBacklogGameToTierListStmt.run({ id: backlogId, category: defaultCategoryId });
            console.log(`[DEBUG] [Transaction BACKLOG] Insert (Ignore if exists) status - Changes: ${insertResult.changes}`);

            const updateResult = updateBacklogGameCategoryStmt.run({ id: backlogId, category: categoryId });
            console.log(`[DEBUG] [Transaction BACKLOG] Update to category ${categoryId} status - Changes: ${updateResult.changes}`);
        }
        console.log(`[DEBUG] [Transaction BACKLOG] Transaction completed successfully.`);
    });

    // Execution time
    switch (tierList) {
        case "GAMES":
            console.log(`[DEBUG] Executing updateGamesTierList...`);
            return updateGamesTierList();
        case "BACKLOG":
            console.log(`[DEBUG] Executing updateBacklogTierList...`);
            return updateBacklogTierList();
        default:
            console.log(`[DEBUG] Warning: Unknown tierList type provided: ${tierList}`);
    }
}
