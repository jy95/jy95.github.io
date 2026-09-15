import { platformToInt } from "./utils";
import { NO_DURATION_SENTINEL } from "@/domain/games/duration";
import type { Database } from "better-sqlite3";
import type { Platform } from "./types";

const DEFAULT_DURATION = NO_DURATION_SENTINEL;

export interface BaseInsertPayload {
    title: string;
    identifierValue: string;
    platform: Platform;
    duration?: string;
    releaseDate?: string;
}

/**
 * The row shape shared by `games` and `tests`: both tables are inserted
 * via `(identifierColumn, title, releaseDate, duration, platform)`, with
 * the identifier always bound as `@identifier` regardless of which real
 * column (`videoId`/`playlistId`) it targets — so the row type itself
 * never needs to know the column name.
 */
export interface BaseInsertRow {
    identifier: string;
    title: string;
    releaseDate: string;
    duration: string;
    platform: number;
}

export function buildBaseInsertRow(
    payload: BaseInsertPayload,
    releaseDateFallback: string
): BaseInsertRow {
    return {
        identifier: payload.identifierValue,
        title: payload.title,
        releaseDate: payload.releaseDate || releaseDateFallback,
        duration: payload.duration || DEFAULT_DURATION,
        platform: platformToInt(payload.platform)
    };
}

export function insertBaseRow(
    db: Database,
    table: "games" | "tests",
    identifierColumn: string,
    row: BaseInsertRow
) {
    const stmt = db.prepare(
        `INSERT INTO ${table} (${identifierColumn}, title, releaseDate, duration, platform) VALUES (@identifier, @title, @releaseDate, @duration, @platform)`
    );
    return stmt.run(row);
}