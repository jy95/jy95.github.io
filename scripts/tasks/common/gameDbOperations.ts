import type { Database } from "better-sqlite3";
import type { GamePayload } from "../common/types";
import { genreToInt } from "../common/utils";

import type { GameGenre } from "../common/types";

/** Synchronizes genres for a given game ID */
export async function syncGenres(db: Database, gameId: number | bigint, genres?: GameGenre[]) {
  if (!genres) return;
  const genreIds = genres.map(genreToInt);

  db.prepare("DELETE FROM games_genres WHERE game = ?").run(gameId);
  const insertGenre = db.prepare("INSERT INTO games_genres (game, genre) VALUES (?, ?)");
  
  for (const genreId of genreIds) {
    insertGenre.run(gameId, genreId);
  }
}

/** Synchronizes schedule data for a given game ID */
export async function syncSchedule(
  db: Database, 
  gameId: number | bigint, 
  availableAt?: string | null, 
  endAt?: string | null
) {
  if ([availableAt, endAt].every(s => s === undefined)) return;

  const upsertSchedule = db.prepare(`
    INSERT INTO games_schedules (id, availableAt, endAt)
    VALUES (@id, @availableAt, @endAt)
    ON CONFLICT(id) DO UPDATE SET
      availableAt = COALESCE(excluded.availableAt, games_schedules.availableAt),
      endAt = COALESCE(excluded.endAt, games_schedules.endAt)
  `);

  const valueOrNull = (value?: string | null) => value?.trim() ?? null;

  upsertSchedule.run({
    id: gameId,
    availableAt: valueOrNull(availableAt),
    endAt: valueOrNull(endAt),
  });
}