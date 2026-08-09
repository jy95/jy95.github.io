import { rm } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { identifierKindToDatabaseField } from './common/utils';

import type { Database } from 'better-sqlite3';
import type { IdentifierKind } from './common/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COVERS_PATH = join(__dirname, '../../public/covers');

type DeleteGamePayload = {
    identifierKind: IdentifierKind;
    identifierValue: string;
};

export async function deleteGameFromDatabase(db: Database, payload: DeleteGamePayload) {
    // Fields
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const youtubeIdentifier = payload.identifierValue;

    // Statements
    const findGameIdStmt = db.prepare(`SELECT id from games WHERE ${keyField} = ?`);
    const deleteGameStmt = db.prepare("DELETE FROM games WHERE id = ?");

    // Find game id
    const gameId = findGameIdStmt.pluck().get(youtubeIdentifier) as number | undefined;
    if (gameId === undefined) {
        throw new Error(`Game not found with ${keyField}=${youtubeIdentifier}`);
    }

    // 1. Delete game from database
    const result = deleteGameStmt.run(gameId);

    // 2. Delete cover folder from filesystem
    const folderPath = join(COVERS_PATH, payload.identifierValue);
    await rm(folderPath, { recursive: true, force: true });

    return result;
}
