import type { Database } from "better-sqlite3";
import type { GamePayload } from "./common/types";

import { platformToInt, genreToInt, identifierKindToDatabaseField } from "./common/utils";

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

    /**
     * Check if the given key is a valid key in the payload object and its value is not an empty string.
     * 
     * @param {keyof typeof payload} key - The key to check in the payload.
     * @returns {boolean} - Returns `true` if the value of the key in the payload is defined and non-empty, otherwise `false`.
     */
    const notEmptyString = (key: keyof UpdatePayload) => payload[key] !== undefined && (payload[key] as string).length > 0;

    // has attributes
    const hasTitle = notEmptyString("title");
    const hasReleaseDate = notEmptyString("releaseDate");
    const hasDuration = notEmptyString("duration");
    const hasAvailableAt = notEmptyString("availableAt");
    const hasEndAt = notEmptyString("endAt");
    const hasScheduleData = hasAvailableAt || hasEndAt;

    // Execution time
    const updateGame = db.transaction(() => {
        // Find game id
        const gameId = findGameIdStmt.pluck().get(youtubeIdentifier);
        // has schedule ?
        const hasScheduleRow = hasScheduleStmt.pluck().get(gameId) !== undefined;

        // Update title
        if (hasTitle) {
            updateTitleStmt.run(payload.title, gameId);
        }

        // Update release date
        if (hasReleaseDate) {
            updateReleaseDateStmt.run(payload.releaseDate!.trim(), gameId);
        }

        // Update platform
        if (payload.platform !== undefined) {
            const platform = platformToInt(payload.platform);
            updatePlatformStmt.run(platform, gameId);
        }

        // Update duration
        if (hasDuration) {
            updateDurationStmt.run(payload.duration, gameId);
        }

        // Create a row of game schedules, if not existing already
        if (hasScheduleData && !hasScheduleRow) {
            insertScheduleStmt.run(gameId);
        }

        // Update available at
        if (hasAvailableAt) {
            updateAvailableAtStmt.run(payload.availableAt!.trim(), gameId);
        }

        // Update end at
        if (hasEndAt) {
            updateEndAtStmt.run(payload.endAt!.trim(), gameId);
        }

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