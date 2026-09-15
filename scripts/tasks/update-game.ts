import type { Database } from "better-sqlite3";
import type { GamePayload } from "./common/types";

import { platformToInt, genreToInt, identifierKindToDatabaseField, isNonEmptyStringField, applyIfPresent } from "./common/utils";

type UpdatePayload = Partial<GamePayload> & { identifierValue: string; identifierKind: GamePayload['identifierKind'] };

export async function updateGameInDatabase(db: Database, payload: UpdatePayload) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const youtubeIdentifier = payload.identifierValue;
    const genres = (payload.genres || []).map(genreToInt);

    const findGameIdStmt = db.prepare(`SELECT id from games WHERE ${keyField} = ?`);
    const updateTitleStmt = db.prepare("UPDATE games SET title = ? WHERE id = ?");
    const updateReleaseDateStmt = db.prepare("UPDATE games SET releaseDate = ? WHERE id = ?");
    const updatePlatformStmt = db.prepare("UPDATE games SET platform = ? WHERE id = ?");
    const updateDurationStmt = db.prepare("UPDATE games SET duration = ? WHERE id = ?");

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

        applyIfPresent(payload, "title", (title) => updateTitleStmt.run(title, gameId));
        applyIfPresent(payload, "releaseDate", (date) => updateReleaseDateStmt.run(date.trim(), gameId));

        if (payload.platform !== undefined) {
            updatePlatformStmt.run(platformToInt(payload.platform), gameId);
        }

        applyIfPresent(payload, "duration", (duration) => updateDurationStmt.run(duration, gameId));

        if (hasScheduleData && !hasScheduleRow) {
            insertScheduleStmt.run(gameId);
        }

        applyIfPresent(payload, "availableAt", (availableAt) => updateAvailableAtStmt.run(availableAt.trim(), gameId));
        applyIfPresent(payload, "endAt", (endAt) => updateEndAtStmt.run(endAt.trim(), gameId));

        if (genres.length > 0) {
            deleteGenreStmt.run(gameId);
            for (const genre of genres) {
                insertGenresWithGameStmt.run(gameId, genre);
            }
        }
    });

    return updateGame();
}
