import type { Database } from 'better-sqlite3';
import type { SeriePayload } from './common/types';

export async function manageSerieInDatabase(db: Database, payload: SeriePayload) {

    // Fetch games ID
    const games = (payload.games_textarea || "")
        .split("\n")
        .map(s => s.trim())
        .filter(s => s.length > 0);

    // Statements
    const findSerieIdStmt = db.prepare('SELECT id FROM series WHERE name = ?');
    const deleteSeriesGamesStmt = db.prepare('DELETE FROM series_games WHERE serie = ?');
    const fetchGameByIdStmt = db.prepare('SELECT id FROM games WHERE videoId = @id OR playlistId = @id');
    const insertGameToSerieStmt = db.prepare('INSERT INTO series_games (serie, game, `order`) VALUES (?, ?, ?)');

    // Execution time
    const serieId = findSerieIdStmt.pluck().get(payload.title) as number;
    if (!serieId) {
        throw new Error(`Series not found: ${payload.title}`);
    }
    await deleteSeriesGamesStmt.run(serieId);

    const updateSerieItems = db.transaction(() => {
        let idx = 1;
        for (const gameIdentifier of games) {
            const gameId = fetchGameByIdStmt.pluck().get({ id: gameIdentifier }) as number;
            if (!gameId) {
                throw new Error(`Game not found: ${gameIdentifier}`);
            }
            insertGameToSerieStmt.run(serieId, gameId, idx);
            idx++;
        }
    });

    return updateSerieItems();
}