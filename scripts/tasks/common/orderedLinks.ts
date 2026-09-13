import type { Database } from "better-sqlite3";

export function replaceOrderedLinks(
    db: Database,
    opts: {
        deleteSql: string;
        deleteParam: number;
        insertSql: string;
        identifiers: string[];
        resolveId: (identifier: string) => number | undefined;
        notFoundMessage: (identifier: string) => string;
    }
) {
    db.prepare(opts.deleteSql).run(opts.deleteParam);

    return db.transaction(() => {
        let order = 1;
        for (const identifier of opts.identifiers) {
            const id = opts.resolveId(identifier);
            if (!id) throw new Error(opts.notFoundMessage(identifier));
            db.prepare(opts.insertSql).run(opts.deleteParam, id, order);
            order++;
        }
    })();
}