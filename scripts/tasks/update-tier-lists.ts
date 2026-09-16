import { findIdsInTextArea } from './common/utils';
import { findGameIdByEitherIdentifier, findTestIdByEitherIdentifier } from './common/lookup';

import type { Database } from 'better-sqlite3';
import type { TierListPayload } from './common/types';

const TIER_LIST_CATEGORIES = {
    tier_masterpiece: 1,
    tier_excellent: 2,
    tier_good: 3,
    tier_average: 4,
    tier_poor: 5,
    tier_bad: 6,
    tier_not_evaluated: 7,
} satisfies Record<TierListPayload['category'], number>;

type TierListTarget = {
    table: 'tier_list_games' | 'tier_list_backlog' | 'tier_list_tests';
    itemColumn: 'game_id' | 'backlog_id' | 'test_id';
    resolveId: (identifier: string) => number | undefined;
    notFoundMessage: (identifier: string) => string;
};

export async function updateTierLists(db: Database, payload: TierListPayload) {
    const identifiers = findIdsInTextArea(payload.games_textarea);
    const categoryId = TIER_LIST_CATEGORIES[payload.category];
    const defaultCategoryId = TIER_LIST_CATEGORIES.tier_not_evaluated;
    const findBacklogId = db.prepare('SELECT id FROM backlog WHERE id = ?').pluck();

    const targets: Record<TierListPayload['tierList'], TierListTarget> = {
        GAMES: {
            table: 'tier_list_games',
            itemColumn: 'game_id',
            resolveId: (identifier) => findGameIdByEitherIdentifier(db, identifier),
            notFoundMessage: (identifier) => `Game not found: ${identifier}`,
        },
        BACKLOG: {
            table: 'tier_list_backlog',
            itemColumn: 'backlog_id',
            resolveId: (identifier) => {
                if (!/^\d+$/.test(identifier)) return undefined;

                const id = Number(identifier);
                if (!Number.isSafeInteger(id)) return undefined;

                return findBacklogId.get(id) as number | undefined;
            },
            notFoundMessage: (identifier) => `Backlog game not found: ${identifier}`,
        },
        TESTS: {
            table: 'tier_list_tests',
            itemColumn: 'test_id',
            resolveId: (identifier) => findTestIdByEitherIdentifier(db, identifier),
            notFoundMessage: (identifier) => `Test not found: ${identifier}`,
        },
    };

    const target = targets[payload.tierList];
    const insertTierListItem = db.prepare(
        `INSERT OR IGNORE INTO ${target.table} (${target.itemColumn}, category_id)
         VALUES (@id, @category)`
    );
    const updateTierListItem = db.prepare(
        `UPDATE ${target.table}
         SET category_id = @category
         WHERE ${target.itemColumn} = @id`
    );

    return db.transaction(() => {
        for (const identifier of identifiers) {
            const id = target.resolveId(identifier);

            if (!id) {
                throw new Error(target.notFoundMessage(identifier));
            }

            insertTierListItem.run({ id, category: defaultCategoryId });
            updateTierListItem.run({ id, category: categoryId });
        }
    })();
}
