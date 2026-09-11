import type { Database } from "better-sqlite3";
import type { GamePayload } from "./common/types";

import { platformToInt, genreToInt, identifierKindToDatabaseField, isNonEmptyStringField, applyIfPresent } from "./common/utils";

type UpdatePayload = Partial<GamePayload> & { identifierValue: string; identifierKind: GamePayload['identifierKind'] };

export async function updateGameInDatabase(db: Database, payload: UpdatePayload) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const youtubeIdentifier = payload.identifierValue;
    const genres = (payload.genres || []).map(genreToInt);

    // Statments
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

    // has attributes
    const hasAvailableAt = isNonEmptyStringField(payload, "availableAt");
    const hasEndAt = isNonEmptyStringField(payload, "endAt");
    const hasScheduleData = hasAvailableAt || hasEndAt;

    // Execution time
    const updateGame = db.transaction(() => {
        // Find game id
        const gameId = findGameIdStmt.pluck().get(youtubeIdentifier);
        if (gameId === undefined) {
            throw new Error(`Game record not found for identifier: ${youtubeIdentifier}`);
        }

        // has schedule ?
        const hasScheduleRow = hasScheduleStmt.pluck().get(gameId) !== undefined;

        // Update title
        applyIfPresent(payload, "title", (title) => updateTitleStmt.run(title, gameId));

        // Update release date
        applyIfPresent(payload, "releaseDate", (date) => updateReleaseDateStmt.run(date.trim(), gameId));

        // Update platform
        if (payload.platform !== undefined) {
            const platform = platformToInt(payload.platform);
            updatePlatformStmt.run(platform, gameId);
        }

        // Update duration
        applyIfPresent(payload, "duration", (duration) => updateDurationStmt.run(duration, gameId));

        // Create a row of game schedules, if not existing already
        if (hasScheduleData && !hasScheduleRow) {
            insertScheduleStmt.run(gameId);
        }

        // Update available at
        applyIfPresent(payload, "availableAt", (availableAt) => updateAvailableAtStmt.run(availableAt.trim(), gameId));

        // Update end at
        applyIfPresent(payload, "endAt", (endAt) => updateEndAtStmt.run(endAt.trim(), gameId));

        // update genres
        if (genres.length > 0) {
            // Delete existing genres
            deleteGenreStmt.run(gameId);

            // Insert each new genre
            for (const genre of genres) {
                insertGenresWithGameStmt.run(gameId, genre);
            }
        }
    });

    return updateGame();
}