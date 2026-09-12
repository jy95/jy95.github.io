import { findIdsInTextArea } from './common/utils';
import { findGameIdByEitherIdentifier } from './common/lookup';

import type { Database } from 'better-sqlite3';
import type { DlcPayload } from './common/types';

export async function manageDlcsInDatabase(db: Database, payload: DlcPayload) {

    // Fetch games ID
    const dlcs = findIdsInTextArea(payload.dlcs_textarea);

    // Statements
    const deleteGameDLCsStmt = db.prepare('DELETE FROM games_dlcs WHERE game = ?');
    const insertDLCToGameStmt = db.prepare('INSERT INTO games_dlcs (game, dlc, `order`) VALUES (?, ?, ?)');

    // Execution time
    const gameID = findGameIdByEitherIdentifier(db, payload.gameID);
    if (!gameID) {
        throw new Error(`Game not found: ${payload.gameID}`);
    }
    await deleteGameDLCsStmt.run(gameID);

    const updateDLCSItems = db.transaction(() => {

        let idx = 1;
        for (const gameIdentifier of dlcs) {

            // Fetch game id
            const dlcID = findGameIdByEitherIdentifier(db, gameIdentifier);
            if (!dlcID) {
                throw new Error(`DLC not found: ${gameIdentifier}`);
            }

            // Insert the dlc's order in the game
            insertDLCToGameStmt.run(gameID, dlcID, idx);

            // Next iteration
            idx++;
        }

    });

    return updateDLCSItems();
}