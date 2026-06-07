import { platformToInt, identifierKindToDatabaseField } from './common/utils';

import type { Database } from 'better-sqlite3';
import type { TestPayload } from './common/types';

export async function addTestToDatabase(db: Database, payload: TestPayload) {
    // Prepare fields
    const keyField = identifierKindToDatabaseField(payload.identifierKind);

    const today = new Date();
    const formattedToday = today.toISOString().slice(0, 10);

    const testToInsert = {
        identifier: payload.identifierValue,
        title: payload.title,
        releaseDate: payload.releaseDate || formattedToday,
        duration: payload.duration || "00:00:00",
        platform: platformToInt(payload.platform)
    }

    // Statement
    const insertStmt = db.prepare(`INSERT INTO tests (${keyField}, title, releaseDate, duration, platform) VALUES (@identifier, @title, @releaseDate, @duration, @platform)`);
    return insertStmt.run(testToInsert);
}