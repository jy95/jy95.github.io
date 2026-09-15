import { genreToInt, identifierKindToDatabaseField } from "./common/utils";
import { buildBaseInsertRow, insertBaseRow } from "./common/insertWithDuration";

import type { Database } from "better-sqlite3";
import type { GamePayload } from "./common/types";

export async function addGameToDatabase(db: Database, payload: GamePayload) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    // Games always carry an explicit releaseDate (required on GamePayload),
    // so the "fallback" is just the value itself — there's no "today"
    // default the way there is for tests.
    const gameToInsert = buildBaseInsertRow(payload, payload.releaseDate);

    const genres = (payload.genres || []).map(genreToInt);

    const period = (payload.availableAt) ? {
        availableAt: payload.availableAt,
        endAt: payload.endAt || null
    } : undefined;

    const findInsertedId = db.prepare('SELECT MAX(id) from games where title = ?');
    const insertGenresWithGameStmt = db.prepare("INSERT INTO games_genres (game, genre) VALUES (?, ?)");
    const insertAvailabilityStmt = db.prepare("INSERT INTO games_schedules (id, availableAt, endAt) VALUES (?, ?, ?) ");

    const insertOneGame = db.transaction(() => {
        insertBaseRow(db, 'games', keyField, gameToInsert);
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