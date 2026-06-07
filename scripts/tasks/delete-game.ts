import { identifierKindToDatabaseField } from './common/utils';

import type { Database } from 'better-sqlite3';
import type { IdentifierKind } from './common/types';

type DeleteGamePayload = {
    identifierKind: IdentifierKind;
    identifierValue: string;
};

export async function deleteGameFromDatabase(db: Database, payload: DeleteGamePayload) {
    // Fields
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const youtubeIdentifier = payload.identifierValue;

    // Statments
    const findGameIdStmt = db.prepare(`SELECT id from games WHERE ${keyField} = ?`);
    const deleteGameStmt = db.prepare("DELETE FROM games WHERE id = ?");

    // Find game id
    const gameId = findGameIdStmt.pluck().get(youtubeIdentifier) as number;
    if (gameId === undefined) {
        throw new Error(`Game not found with ${keyField}=${youtubeIdentifier}`);
    }
    // Delete game and everything related, thanks to the CASCADE DELETE
    return deleteGameStmt.run(gameId);
}