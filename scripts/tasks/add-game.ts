import type { Database } from "better-sqlite3";
import type { GamePayload } from "./common/types";

import { platformToInt, genreToInt, identifierKindToDatabaseField } from "./common/utils";

export async function addGameToDatabase(db: Database, payload: GamePayload) {
    // Prepare fields

    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const gameToInsert = {
        identifier: payload.identifierValue,
        title: payload.title,
        releaseDate: payload.releaseDate,
        duration: payload.duration || "00:00:00",
        platform: platformToInt(payload.platform)
    }

    const genres = (payload.genres || []).map(genreToInt);

    const period = (payload.availableAt) ? {
        availableAt: payload.availableAt,
        endAt: payload.endAt || null
    } : undefined;

    // Statements
    const insertGameStmt = db.prepare(`INSERT INTO games (${keyField}, title, releaseDate, duration, platform) VALUES (@identifier, @title, @releaseDate, @duration, @platform)`);
    const findInsertedId = db.prepare('SELECT MAX(id) from games where title = ?');
    const insertGenresWithGameStmt = db.prepare("INSERT INTO games_genres (game, genre) VALUES (?, ?)");
    const insertAvailabilityStmt = db.prepare("INSERT INTO games_schedules (id, availableAt, endAt) VALUES (?, ?, ?) ")

    // Execution time
    const insertOneGame = db.transaction(() => {
        // Insert basic information about game
        insertGameStmt.run(gameToInsert);
        // retrieve it id in database
        const gameId = findInsertedId.pluck().get(payload.title);
        // insert genre(s)
        for (const genreId of genres) {
            insertGenresWithGameStmt.run(gameId, genreId);
        }
        // If period isn't null, we have an extra row to add in database
        if (period) {
            insertAvailabilityStmt.run(gameId, period.availableAt, period.endAt);
        }
    });

    return insertOneGame();
}