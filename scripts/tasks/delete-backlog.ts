import type { Database } from 'better-sqlite3';

type DeleteBacklogPayload = {
  title: string;
};

export async function deleteBacklogFromDatabase(db: Database, payload: DeleteBacklogPayload) {
  const deleteBacklogStmt = db.prepare("DELETE FROM backlog WHERE title = ?");
  return deleteBacklogStmt.run(payload.title);
}