import { platformToInt, identifierKindToDatabaseField } from './common/utils';

import type { Database } from 'better-sqlite3';
import type { TestPayload } from './common/types';

type UpdateTestParams = { identifierValue: string; identifierKind: TestPayload['identifierKind'] } & Partial<TestPayload>;

export async function updateTestInDatabase(db: Database, payload: UpdateTestParams) {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const youtubeIdentifier = payload.identifierValue;

    // Statments
    const findGameIdStmt = db.prepare(`SELECT id from tests WHERE ${keyField} = ?`);
    const updateTitleStmt = db.prepare("UPDATE tests SET title = ? WHERE id = ?");
    const updateReleaseDateStmt = db.prepare("UPDATE tests SET releaseDate = ? WHERE id = ?");
    const updatePlatformStmt = db.prepare("UPDATE tests SET platform = ? WHERE id = ?");
    const updateDurationStmt = db.prepare("UPDATE tests SET duration = ? WHERE id = ?");

    /**
     * Check if the given key is a valid key in the payload object and its value is not an empty string.
     * 
     * @param {keyof typeof payload} key - The key to check in the payload.
     * @returns {boolean} - Returns `true` if the value of the key in the payload is defined and non-empty, otherwise `false`.
     */
    const notEmptyString = (key: keyof UpdateTestParams) => payload[key] !== undefined && (payload[key] as string).length > 0;

    // has attributes
    const hasTitle = notEmptyString("title");
    const hasReleaseDate = notEmptyString("releaseDate");
    const hasDuration = notEmptyString("duration");

    // Execution time
    const updateGame = db.transaction(() => {
        // Find game id
        const gameId = findGameIdStmt.pluck().get(youtubeIdentifier);

        // Update title
        if (hasTitle) {
            updateTitleStmt.run(payload.title, gameId);
        }

        // Update release date
        if (hasReleaseDate) {
            updateReleaseDateStmt.run(payload.releaseDate!.trim(), gameId);
        }

        // Update platform
        if (payload.platform !== undefined) {
            const platform = platformToInt(payload.platform);
            updatePlatformStmt.run(platform, gameId);
        }

        // Update duration
        if (hasDuration) {
            updateDurationStmt.run(payload.duration, gameId);
        }

    });

    return updateGame();
}