import type { Database, RunResult, Statement } from "better-sqlite3";

/**
 * Columns eligible for makeColumnUpdater must be optional strings on the
 * payload type — this is what lets applyIfPresent's `value` narrow to
 * `string` via a plain typeof check, with no casts anywhere downstream.
 */
type StringColumnKeys<T> = {
    [K in keyof T]-?: NonNullable<T[K]> extends string ? K : never;
}[keyof T] & string;

/**
 * Builds a set of "UPDATE <table> SET <col> = ? WHERE id = ?" prepared
 * statements for a fixed list of string-valued columns.
 */
export function makeColumnUpdater<T extends Record<string, any>>(
    db: Database,
    table: string,
    columns: readonly StringColumnKeys<T>[]
) {
    // Explicitly create the map to prevent Map constructor type inference failures on tuple entries
    const statements = new Map<StringColumnKeys<T>, Statement>();

    for (const col of columns) {
        statements.set(col, db.prepare(`UPDATE ${table} SET ${col} = ? WHERE id = ?`));
    }

    return {
        /**
         * Runs the update for `column` using `transform(value)` if the
         * payload has a non-empty string value for it. No-op otherwise.
         */
        applyIfPresent(
            payload: T,
            column: StringColumnKeys<T>,
            id: number | bigint,
            transform: (value: string) => unknown = (v) => v
        ): RunResult | undefined {
            const value = payload[column];

            if (typeof value === "string" && value.length > 0) {
                const stmt = statements.get(column);
                return stmt?.run(transform(value), id);
            }

            return undefined;
        }
    };
}