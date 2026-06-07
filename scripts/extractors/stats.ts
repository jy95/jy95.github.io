import { writeFile } from "fs/promises";
import { normaliazeDuration, stringifyJSON } from "./common/utils";

import type { Database } from "better-sqlite3";

/**
 * Extracts stats from the database and saves them to a file.
 */
export async function extractAndSaveStats(db: Database, outputPath: string): Promise<void> {
    const genresStats = db.prepare("SELECT * FROM genres_stats").all();
    const platformStats = db.prepare("SELECT * FROM platforms_stats").all();
    const games_total_time: any = db.prepare("SELECT * FROM games_total_time").get();
    const games_total_time_available: any = db.prepare("SELECT * FROM games_available_time").get();
    const games_total_time_unavailable: any = db.prepare("SELECT * FROM games_unavailable_time").get();
    
    // where condition needed to exclude dlc from game resultset
    const total_games = db.prepare("SELECT COUNT(*) FROM games WHERE id NOT IN (SELECT dlc FROM games_dlcs)").pluck().get();
    const total_game_available = db.prepare("SELECT COUNT(*) FROM games_in_present WHERE id NOT IN (SELECT dlc FROM games_dlcs)").pluck().get();
    const total_game_unavailable = db.prepare("SELECT COUNT(*) FROM games_in_future WHERE id NOT IN (SELECT dlc FROM games_dlcs)").pluck().get();

    // Whereas counting dlcs is easy
    const total_dlcs = db.prepare("SELECT COUNT(*) FROM games_dlcs").pluck().get();
    const total_dlcs_available = db.prepare("SELECT COUNT(*) FROM games_in_present WHERE id IN (SELECT dlc FROM games_dlcs)").pluck().get();
    const total_dlcs_unavailable = db.prepare("SELECT COUNT(*) FROM games_in_future WHERE id IN (SELECT dlc FROM games_dlcs)").pluck().get();
    
    const result = {
        "platforms": platformStats,
        "genres": genresStats,
        "general": {
            "channel_start_date": "2014-04-15T17:35:16+00:00",
            "games": {
                "total": total_games,
                "total_available": total_game_available,
                "total_unavailable": total_game_unavailable,
            },
            "dlcs": {
                "total": total_dlcs,
                "total_available": total_dlcs_available,
                "total_unavailable": total_dlcs_unavailable,
            },
            "duration": {
                "total": normaliazeDuration(games_total_time),
                "total_available": normaliazeDuration(games_total_time_available),
                "total_unavailable": normaliazeDuration(games_total_time_unavailable)
            }
        }
    }

    await writeFile(
        outputPath,
        stringifyJSON(result),
        "utf-8"
    ); 
    console.log(`${outputPath} successfully written`);
}