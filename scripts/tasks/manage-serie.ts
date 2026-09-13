import { findIdsInTextArea } from './common/utils';
import { findGameIdByEitherIdentifier } from './common/lookup';
import { replaceOrderedLinks } from './common/orderedLinks';

import type { Database } from 'better-sqlite3';
import type { SeriePayload } from './common/types';

export async function manageSerieInDatabase(db: Database, payload: SeriePayload) {

    // Fetch games ID
    const games = findIdsInTextArea(payload.games_textarea);

    // Statements
    const findSerieIdStmt = db.prepare('SELECT id FROM series WHERE name = ?');

    // Execution time
    const serieId = findSerieIdStmt.pluck().get(payload.title) as number;
    if (!serieId) throw new Error(`Series not found: ${payload.title}`);

    return replaceOrderedLinks(db, {
        deleteSql: 'DELETE FROM series_games WHERE serie = ?',
        deleteParam: serieId,
        insertSql: 'INSERT INTO series_games (serie, game, `order`) VALUES (?, ?, ?)',
        identifiers: games,
        resolveId: (id) => findGameIdByEitherIdentifier(db, id),
        notFoundMessage: (id) => `Game not found: ${id}`,
    });
}