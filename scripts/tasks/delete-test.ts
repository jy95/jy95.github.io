import { identifierKindToDatabaseField } from './common/utils';

import type { Database } from 'better-sqlite3';
import type { IdentifierKind } from './common/types';

type DeleteTestParams = { identifierKind: IdentifierKind; identifierValue: string };

export async function deleteTestFromDatabase(db: Database, payload: DeleteTestParams) {
  const keyField = identifierKindToDatabaseField(payload.identifierKind);
  const youtubeIdentifier = payload.identifierValue;

  const findGameIdStmt = db.prepare(`SELECT id from tests WHERE ${keyField} = ?`);
  const deleteTestStmt = db.prepare("DELETE FROM tests WHERE id = ?");

  const gameId = findGameIdStmt.pluck().get(youtubeIdentifier) as number;
  return deleteTestStmt.run(gameId);
}