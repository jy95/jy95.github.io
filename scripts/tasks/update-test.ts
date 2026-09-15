import { identifierKindToDatabaseField, platformToInt } from './common/utils';
import { makeColumnUpdater } from './common/columnUpdater';

import type { Database } from 'better-sqlite3';
import type { TestPayload } from './common/types';

type UpdateTestParams = { identifierValue: string; identifierKind: TestPayload['identifierKind'] } & Partial<TestPayload>;

const UPDATABLE_COLUMNS = ['title', 'releaseDate', 'duration'] as const;

export async function updateTestInDatabase(db: Database, payload: UpdateTestParams) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const youtubeIdentifier = payload.identifierValue;

    const findGameIdStmt = db.prepare(`SELECT id from tests WHERE ${keyField} = ?`);
    const updater = makeColumnUpdater<UpdateTestParams>(db, 'tests', UPDATABLE_COLUMNS);
    const updatePlatformStmt = db.prepare("UPDATE tests SET platform = ? WHERE id = ?");

    const updateGame = db.transaction(() => {
        const gameId = findGameIdStmt.pluck().get(youtubeIdentifier) as number | bigint | undefined;
        if (gameId === undefined) {
            throw new Error(`Test record not found for identifier: ${youtubeIdentifier}`);
        }

        updater.applyIfPresent(payload, 'title', gameId);
        updater.applyIfPresent(payload, 'releaseDate', gameId, (v) => v.trim());
        updater.applyIfPresent(payload, 'duration', gameId);

        if (payload.platform !== undefined) {
            updatePlatformStmt.run(platformToInt(payload.platform), gameId);
        }
    });

    return updateGame();
}