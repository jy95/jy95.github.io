import { identifierKindToDatabaseField } from './common/utils';
import { buildBaseInsertRow, insertBaseRow } from './common/insertWithDuration';

import type { Database } from 'better-sqlite3';
import type { TestPayload } from './common/types';

export async function addTestToDatabase(db: Database, payload: TestPayload) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const today = new Date().toISOString().slice(0, 10);

    const testToInsert = buildBaseInsertRow(payload, today);

    return insertBaseRow(db, 'tests', keyField, testToInsert);
}