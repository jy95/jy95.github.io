import type { Database } from "better-sqlite3";

import type { CompanyRecord } from "./types";

export function loadCompanies(
    db: Database
): CompanyRecord[] {
    const rows = db.prepare(`
        SELECT
            c.id AS id,
            c.name AS name,
            COUNT(
                DISTINCT CASE
                    WHEN gc.role = 'developer'
                    THEN gc.game
                END
            ) AS developerGames,
            COUNT(
                DISTINCT CASE
                    WHEN gc.role = 'publisher'
                    THEN gc.game
                END
            ) AS publisherGames
        FROM companies c
        LEFT JOIN games_companies gc
            ON gc.company = c.id
        GROUP BY c.id, c.name
        ORDER BY c.name COLLATE NOCASE, c.id
    `).all() as CompanyRecord[];

    return rows;
}