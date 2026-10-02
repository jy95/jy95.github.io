import { expect, it } from 'vitest';
import { emptySelection } from './documentTypes';
import { selectionIds } from './identifiers';

it('deduplicates valid category and legacy identifiers in first-seen order', () => {
    const document = {
        ...emptySelection(),
        games: ['game-a', 'game-a'],
        backlog: ['42', '42'],
        dlcs: ['game-a', 'dlc-a'],
        planning: ['planned-a'],
        legacyIds: ['dlc-a', 'backlog:42', 'unknown', 'unknown'],
    };
    expect(selectionIds(document)).toEqual(['game-a', 'backlog:42', 'dlc-a', 'planned-a', 'unknown']);
});

it('excludes invalid category and legacy identifiers while retaining valid boundary lengths', () => {
    const validId = 'a'.repeat(128);
    const validBacklogId = '1'.repeat(128);
    const invalidIds = ['', 'bad id', '!!!', 'a'.repeat(129)];
    const document = {
        ...emptySelection(),
        games: [...invalidIds, validId],
        backlog: ['', 'abc', '1'.repeat(129), validBacklogId],
        dlcs: invalidIds,
        planning: invalidIds,
        legacyIds: [...invalidIds, 'backlog:abc', 'backlog:', `backlog:${'1'.repeat(129)}`, '_'],
    };
    expect(selectionIds(document)).toEqual([validId, `backlog:${validBacklogId}`, '_']);
});
