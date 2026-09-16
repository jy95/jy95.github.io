import { platformToInt, identifierKindToDatabaseField } from "./common/utils";
import { syncGenres, syncSchedule } from "./common/gameDbOperations";

import type { Database } from "better-sqlite3";
import type { GamePayload } from "./common/types";

export async function addGameToDatabase(db: Database, payload: GamePayload) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const insertGameStmt = db.prepare(`
        INSERT INTO games (${keyField}, title, releaseDate, duration, platform)
        VALUES (@identifier, @title, @releaseDate, @duration, @platform)
    `);

    const saveTx = db.transaction(async () => {
        const info = insertGameStmt.run({
            identifier: payload.identifierValue,
            title: payload.title,
            releaseDate: payload.releaseDate?.trim(),
            duration: payload.duration || "00:00:00",
            platform: platformToInt(payload.platform),
        });

        const gameId = info.lastInsertRowid;

        await syncGenres(db, gameId, payload.genres);
        await syncSchedule(db, gameId, payload.availableAt, payload.endAt);

        return gameId;
    });

    return saveTx();
}
