import type { Database } from "better-sqlite3";
import { genreToInt } from "../common/utils";

import type { GameGenre } from "../common/types";

/** Synchronizes genres for a given game ID */
export function syncGenres(db: Database, gameId: number | bigint, genres?: GameGenre[]) {
  if (!genres?.length) return;
  const genreIds = genres.map(genreToInt);

  db.prepare("DELETE FROM games_genres WHERE game = ?").run(gameId);
  const insertGenre = db.prepare("INSERT INTO games_genres (game, genre) VALUES (?, ?)");
  
  for (const genreId of genreIds) {
    insertGenre.run(gameId, genreId);
  }
}

/** Synchronizes schedule data for a given game ID */
export function syncSchedule(
  db: Database, 
  gameId: number | bigint, 
  availableAt?: string | null, 
  endAt?: string | null
) {
  if ([availableAt, endAt].every(s => s === undefined)) return;

  const valueOrNull = (value?: string | null) => value?.trim() ?? null;
  const schedule = {
    id: gameId,
    availableAt: valueOrNull(availableAt),
    endAt: valueOrNull(endAt),
  };
  const updateResult = db.prepare(`
    UPDATE games_schedules SET
      availableAt = COALESCE(@availableAt, availableAt),
      endAt = COALESCE(@endAt, endAt)
    WHERE id = @id
  `).run(schedule);

  if (updateResult.changes === 0) {
    db.prepare(`
      INSERT INTO games_schedules (id, availableAt, endAt)
      VALUES (@id, @availableAt, @endAt)
    `).run(schedule);
  }
}
