import type { Database } from "better-sqlite3";

function findIdByEitherIdentifier(db: Database, table: string, value: string): number | undefined {
    return db.prepare(`SELECT id FROM ${table} WHERE videoId = @id OR playlistId = @id`)
        .pluck().get({ id: value }) as number | undefined;
}

export function findGameIdByEitherIdentifier(db: Database, value: string): number | undefined {
    return findIdByEitherIdentifier(db, "games", value);
}

export function findTestIdByEitherIdentifier(db: Database, value: string): number | undefined {
    return findIdByEitherIdentifier(db, "tests", value);
}