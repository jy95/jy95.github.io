import type { Database } from 'better-sqlite3';
import type { DlcPayload } from './common/types';

export async function manageDlcsInDatabase(db: Database, payload: DlcPayload) {

    // Fetch games ID
    const dlcs = payload.dlcs_textarea
        .split("\n")
        .map(s => s.trim())
        .filter(s => s.length > 0);

    // Statements
    const fetchGameByIdStmt = db.prepare('SELECT id FROM games WHERE videoId = @id OR playlistId = @id');
    const deleteGameDLCsStmt = db.prepare('DELETE FROM games_dlcs WHERE game = ?');
    const insertDLCToGameStmt = db.prepare('INSERT INTO games_dlcs (game, dlc, `order`) VALUES (?, ?, ?)');

    // Execution time
    const gameID = fetchGameByIdStmt.pluck().get({ id: payload.gameID }) as number;
    await deleteGameDLCsStmt.run(gameID);

    const updateDLCSItems = db.transaction(() => {

        let idx = 1;
        for (const gameIdentifier of dlcs) {

            // Fetch game id
            const dlcID = fetchGameByIdStmt.pluck().get({ id: gameIdentifier }) as number;

            // Insert the dlc's order in the game
            insertDLCToGameStmt.run(gameID, dlcID, idx);

            // Next iteration
            idx++;
        }

    });

    return updateDLCSItems();
}