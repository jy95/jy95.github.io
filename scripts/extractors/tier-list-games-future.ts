import { genericExtractAndSaveTierListGames } from "./common/games-tier-list-extractor";
import type { Database } from "better-sqlite3";

export async function extractAndSaveTierListGamesFuture(db: Database, outputPath: string): Promise<void> {
    return genericExtractAndSaveTierListGames(db, outputPath, "games_in_future");
}