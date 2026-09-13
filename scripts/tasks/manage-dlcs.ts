import { findIdsInTextArea } from './common/utils';
import { findGameIdByEitherIdentifier } from './common/lookup';
import { replaceOrderedLinks } from './common/orderedLinks';

import type { Database } from 'better-sqlite3';
import type { DlcPayload } from './common/types';

export async function manageDlcsInDatabase(db: Database, payload: DlcPayload) {

    // Fetch games ID
    const dlcs = findIdsInTextArea(payload.dlcs_textarea);

    // Execution time
    const gameID = findGameIdByEitherIdentifier(db, payload.gameID);
    if (!gameID) {
        throw new Error(`Game not found: ${payload.gameID}`);
    }

    return replaceOrderedLinks(db, {
        deleteSql: 'DELETE FROM games_dlcs WHERE game = ?',
        deleteParam: gameID,
        insertSql: 'INSERT INTO games_dlcs (game, dlc, `order`) VALUES (?, ?, ?)',
        identifiers: dlcs,
        resolveId: (id) => findGameIdByEitherIdentifier(db, id),
        notFoundMessage: (id) => `DLC not found: ${id}`,
    });
}