import { extractAndSaveQuery } from "./common/runExtractor";
import type { Database } from "better-sqlite3";

/**
 * Extracts games from the database and saves them to a file.
 */
export const extractAndSavePastGames = (
    db: Database,
    outputPath: string
) =>
    extractAndSaveQuery(
        db,
        outputPath,
        `
        SELECT
            title,
            "videoId",
            "playlistId",
            "availableAt",
            "endAt"
        FROM games_in_past

        UNION ALL

        SELECT
            title,
            "videoId",
            "playlistId",
            "availableAt",
            "endAt"
        FROM dlcs_in_present
        ORDER BY "availableAt" ASC
        `
    );