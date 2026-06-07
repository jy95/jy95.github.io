import type { Database } from 'better-sqlite3';
import type { SeriePayload } from './common/types';

export async function addSerieToDatabase(db: Database, payload: SeriePayload) {
  const insertStmt = db.prepare("INSERT INTO series (name) VALUES (@name)");
  return insertStmt.run({ name: payload.title });
}