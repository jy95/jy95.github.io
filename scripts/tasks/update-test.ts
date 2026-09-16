import { platformToInt, identifierKindToDatabaseField, applyIfPresent } from './common/utils';

import type { Database } from 'better-sqlite3';
import type { TestPayload } from './common/types';

type UpdateTestParams = { identifierValue: string; identifierKind: TestPayload['identifierKind'] } & Partial<TestPayload>;

export async function updateTestInDatabase(db: Database, payload: UpdateTestParams) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const youtubeIdentifier = payload.identifierValue;

    const findGameIdStmt = db.prepare(`SELECT id from tests WHERE ${keyField} = ?`);
    const updateTitleStmt = db.prepare("UPDATE tests SET title = ? WHERE id = ?");
    const updateReleaseDateStmt = db.prepare("UPDATE tests SET releaseDate = ? WHERE id = ?");
    const updatePlatformStmt = db.prepare("UPDATE tests SET platform = ? WHERE id = ?");
    const updateDurationStmt = db.prepare("UPDATE tests SET duration = ? WHERE id = ?");

    const updateGame = db.transaction(() => {
        const gameId = findGameIdStmt.pluck().get(youtubeIdentifier) as number | bigint | undefined;
        if (gameId === undefined) {
            throw new Error(`Test record not found for identifier: ${youtubeIdentifier}`);
        }

        applyIfPresent(payload, "title", (title) => updateTitleStmt.run(title, gameId));
        applyIfPresent(payload, "releaseDate", (date) => updateReleaseDateStmt.run(date.trim(), gameId));

        if (payload.platform !== undefined) {
            updatePlatformStmt.run(platformToInt(payload.platform), gameId);
        }

        applyIfPresent(payload, "duration", (duration) => updateDurationStmt.run(duration, gameId));
    });

    return updateGame();
}
