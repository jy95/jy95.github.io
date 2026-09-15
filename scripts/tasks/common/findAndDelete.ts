import type { Database } from 'better-sqlite3';
import { identifierKindToDatabaseField } from './utils';
import type { IdentifierKind } from './types';

export type FindAndDeletePayload = { identifierKind: IdentifierKind; identifierValue: string };

type TABLE_NAME = 'games' | 'tests';

const LABELS_ENTRIES: Record<TABLE_NAME, string> = {
    games: 'Game',
    tests: 'Test'
};

/**
 * Shared "resolve numeric id by videoId/playlistId" lookup used by
 * deleteGameFromDatabase and deleteTestFromDatabase. Throws a
 * table-specific message if no row matches the identifier, matching each
 * caller's previous error text.
 */
export function findRowIdByIdentifier(
    db: Database,
    table: TABLE_NAME,
    payload: FindAndDeletePayload
): number | bigint {
    const keyField = identifierKindToDatabaseField(payload.identifierKind);
    const id = db.prepare(`SELECT id FROM ${table} WHERE ${keyField} = ?`)
        .pluck().get(payload.identifierValue) as number | bigint | undefined;

    if (id === undefined) {
        const label = LABELS_ENTRIES[table];
        throw new Error(`${label} not found with ${keyField}=${payload.identifierValue}`);
    }
    return id;
}