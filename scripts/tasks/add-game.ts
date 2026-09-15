import { platformToInt, genreToInt, identifierKindToDatabaseField } from "./common/utils";

import type { Database } from "better-sqlite3";
import type { GamePayload } from "./common/types";

export async function addGameToDatabase(db: Database, payload: GamePayload) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const gameToInsert = {
        identifier: payload.identifierValue,
        title: payload.title,
        releaseDate: payload.releaseDate,
        duration: payload.duration || "00:00:00",
        platform: platformToInt(payload.platform)
    };

    const genres = (payload.genres || []).map(genreToInt);

    const period = (payload.availableAt) ? {
        availableAt: payload.availableAt,
        endAt: payload.endAt || null
    } : undefined;

    const insertGameStmt = db.prepare(`INSERT INTO games (${keyField}, title, releaseDate, duration, platform) VALUES (@identifier, @title, @releaseDate, @duration, @platform)`);
    const findInsertedId = db.prepare('SELECT MAX(id) from games where title = ?');
    const insertGenresWithGameStmt = db.prepare("INSERT INTO games_genres (game, genre) VALUES (?, ?)");
    const insertAvailabilityStmt = db.prepare("INSERT INTO games_schedules (id, availableAt, endAt) VALUES (?, ?, ?) ");

    const insertOneGame = db.transaction(() => {
        insertGameStmt.run(gameToInsert);
        const gameId = findInsertedId.pluck().get(payload.title);
        for (const genreId of genres) {
            insertGenresWithGameStmt.run(gameId, genreId);
        }
        if (period) {
            insertAvailabilityStmt.run(gameId, period.availableAt, period.endAt);
        }
    });

    return insertOneGame();
}
