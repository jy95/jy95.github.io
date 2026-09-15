import type { Database } from "better-sqlite3";
import type { GamePayload } from "./common/types";

import { platformToInt, genreToInt, identifierKindToDatabaseField, isNonEmptyStringField } from "./common/utils";
import { makeColumnUpdater } from "./common/columnUpdater";

type UpdatePayload = Partial<GamePayload> & { identifierValue: string; identifierKind: GamePayload['identifierKind'] };

const UPDATABLE_COLUMNS = ['title', 'releaseDate', 'duration'] as const;

export async function updateGameInDatabase(db: Database, payload: UpdatePayload) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const youtubeIdentifier = payload.identifierValue;
    const genres = (payload.genres || []).map(genreToInt);

    const findGameIdStmt = db.prepare(`SELECT id from games WHERE ${keyField} = ?`);
    const updater = makeColumnUpdater<UpdatePayload>(db, 'games', UPDATABLE_COLUMNS);
    const updatePlatformStmt = db.prepare("UPDATE games SET platform = ? WHERE id = ?");

    const hasScheduleStmt = db.prepare("SELECT 1 FROM games_schedules WHERE id = ?");
    const insertScheduleStmt = db.prepare("INSERT INTO games_schedules (id) VALUES (?) ");
    const updateAvailableAtStmt = db.prepare("UPDATE games_schedules SET availableAt = ? WHERE id = ?");
    const updateEndAtStmt = db.prepare("UPDATE games_schedules SET endAt = ? WHERE id = ?");
    const deleteGenreStmt = db.prepare("DELETE FROM games_genres WHERE game = ?");
    const insertGenresWithGameStmt = db.prepare("INSERT INTO games_genres (game, genre) VALUES (?, ?)");

    const hasAvailableAt = isNonEmptyStringField(payload, "availableAt");
    const hasEndAt = isNonEmptyStringField(payload, "endAt");
    const hasScheduleData = hasAvailableAt || hasEndAt;

    const updateGame = db.transaction(() => {
        const gameId = findGameIdStmt.pluck().get(youtubeIdentifier) as number | bigint | undefined;
        if (gameId === undefined) {
            throw new Error(`Game record not found for identifier: ${youtubeIdentifier}`);
        }

        const hasScheduleRow = hasScheduleStmt.pluck().get(gameId) !== undefined;

        updater.applyIfPresent(payload, "title", gameId);
        updater.applyIfPresent(payload, "releaseDate", gameId, (v) => v.trim());
        updater.applyIfPresent(payload, "duration", gameId);

        if (payload.platform !== undefined) {
            updatePlatformStmt.run(platformToInt(payload.platform), gameId);
        }

        if (hasScheduleData && !hasScheduleRow) {
            insertScheduleStmt.run(gameId);
        }

        if (hasAvailableAt) {
            updateAvailableAtStmt.run(payload.availableAt.trim(), gameId);
        }
        if (hasEndAt) {
            updateEndAtStmt.run(payload.endAt.trim(), gameId);
        }

        if (genres.length > 0) {
            deleteGenreStmt.run(gameId);
            for (const genre of genres) {
                insertGenresWithGameStmt.run(gameId, genre);
            }
        }
    });

    return updateGame();
}