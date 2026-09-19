import { platformToInt, identifierKindToDatabaseField } from "./common/utils";
import { syncGenres, syncSchedule, syncCompanies } from "./common/gameDbOperations";

import type { Database } from "better-sqlite3";
import type { GamePayload } from "./common/types";

export async function addGameToDatabase(db: Database, payload: GamePayload) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const insertGameStmt = db.prepare(`
        INSERT INTO games (${keyField}, title, releaseDate, duration, platform)
        VALUES (@identifier, @title, @releaseDate, @duration, @platform)
    `);

    const saveTx = db.transaction(() => {
        const info = insertGameStmt.run({
            identifier: payload.identifierValue,
            title: payload.title,
            releaseDate: payload.releaseDate?.trim(),
            duration: payload.duration || "00:00:00",
            platform: platformToInt(payload.platform),
        });

        const gameId = info.lastInsertRowid;

        syncGenres(db, gameId, payload.genres);
        syncCompanies(db, gameId, "developer", payload.developers_textarea);
        syncCompanies(db, gameId, "publisher", payload.publishers_textarea);
        syncSchedule(db, gameId, payload.availableAt, payload.endAt);

        return gameId;
    });

    return saveTx();
}
