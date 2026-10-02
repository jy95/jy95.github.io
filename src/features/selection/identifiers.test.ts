import { normalizeSelectionIds } from './identifiers';

it('preserves arbitrary strings and deduplicates in first-occurrence order', () => {
    const ids = ['constructor', 'toString', '__proto__', '', 'bad.id!?', '日本語 🎮', 'a'.repeat(129), 'backlog:42', '42'];
    expect(normalizeSelectionIds([...ids, ids[0], 42, null, undefined, {}, true])).toEqual(ids);
});

it.each([null, undefined, 42, 'text', {}, true])('ignores non-array input %s', value => {
    expect(normalizeSelectionIds(value)).toEqual([]);
});
