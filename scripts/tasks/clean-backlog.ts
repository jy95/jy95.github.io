import type { Database } from 'better-sqlite3';

export async function cleanBacklog(db: Database) {
  const deleteBacklogStmt = db.prepare("DELETE FROM backlog WHERE title IN (SELECT title FROM games)");
  return deleteBacklogStmt.run();
}