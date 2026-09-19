import type { Database } from "better-sqlite3";
import { genreToInt } from "../common/utils";

import type { GameGenre, CompanyRole } from "../common/types";

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


function normalizeCompanyNames(names?: string[]): string[] {
    if (!names?.length) {
        return [];
    }

    return [...new Set(
        names
            .map(name => name.trim())
            .filter(Boolean)
    )];
}

export function syncCompanies(
    db: Database,
    gameId: number | bigint,
    role: CompanyRole,
    companyNames?: string[]
) {
    if (!companyNames?.length) {
        return;
    }

    const names = normalizeCompanyNames(companyNames);

    const insertCompanyStmt = db.prepare(`
        INSERT INTO companies (name)
        VALUES (?)
        ON CONFLICT(name) DO NOTHING
    `);

    const findCompanyStmt = db.prepare(`
        SELECT id
        FROM companies
        WHERE name = ?
    `);

    const deleteRelationsStmt = db.prepare(`
        DELETE FROM games_companies
        WHERE game = ?
          AND role = ?
    `);

    const insertRelationStmt = db.prepare(`
        INSERT INTO games_companies (game, company, role)
        VALUES (?, ?, ?)
    `);

    deleteRelationsStmt.run(gameId, role);

    for (const name of names) {
        insertCompanyStmt.run(name);

        const companyId = findCompanyStmt.pluck().get(name);

        if (companyId === undefined) {
            throw new Error(`Company not found after insert: ${name}`);
        }

        insertRelationStmt.run(gameId, companyId, role);
    }
}