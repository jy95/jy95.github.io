import type { Database } from "better-sqlite3";
import type { GamePayload } from "./common/types";

import { syncGenres, syncSchedule, syncCompanies } from "./common/gameDbOperations";
import { platformToInt, identifierKindToDatabaseField } from "./common/utils";

type UpdatePayload = Partial<GamePayload> & { identifierValue: string; identifierKind: GamePayload['identifierKind'] };

const valueOrNull = <T>(val: T | undefined): T | null => val ?? null;

export async function updateGameInDatabase(db: Database, payload: UpdatePayload) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);

    const findGameIdStmt = db.prepare(`SELECT id FROM games WHERE ${keyField} = ?`);
    const updateGameStmt = db.prepare(`
    UPDATE games SET
      title = COALESCE(@title, title),
      releaseDate = COALESCE(@releaseDate, releaseDate),
      duration = COALESCE(@duration, duration),
      platform = COALESCE(@platform, platform)
    WHERE id = @id
  `);

    const updateTx = db.transaction(() => {
        const gameId = findGameIdStmt.pluck().get(payload.identifierValue) as number | bigint | undefined;
        if (gameId === undefined) {
            throw new Error(`Game record not found for identifier: ${payload.identifierValue}`);
        }

        updateGameStmt.run({
            id: gameId,
            title: valueOrNull(payload.title),
            releaseDate: valueOrNull(payload.releaseDate?.trim()),
            duration: valueOrNull(payload.duration),
            platform: payload.platform !== undefined ? platformToInt(payload.platform) : null,
        });

        syncGenres(db, gameId, payload.genres);
        syncSchedule(db, gameId, payload.availableAt, payload.endAt);
        syncCompanies(db, gameId, "developer", payload.developers);
        syncCompanies(db, gameId, "publisher", payload.publishers);

        return gameId;
    });

    return updateTx();
}
