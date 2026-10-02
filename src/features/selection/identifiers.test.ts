import { isBacklogId, isCardId, isSelectionId, normalizeSelectionIds } from './identifiers';

it('keeps prototype-like names and deduplicates valid selection IDs in order', () => {
    const names = ['constructor', 'toString', '__proto__'];
    expect(normalizeSelectionIds([...names, names[0], 'backlog:42', 'bad.id', 42])).toEqual([...names, 'backlog:42']);
});

it('keeps numeric document IDs distinct from prefixed selection IDs', () => {
    expect(isBacklogId('42')).toBe(true);
    expect(isBacklogId('backlog:42')).toBe(false);
    expect(isCardId('backlog:42')).toBe(false);
    expect(isSelectionId('backlog:42')).toBe(true);
});

it.each(['', 'bad.id', 'a'.repeat(129), 'backlog:' + '1'.repeat(129), 42, null])('skips malformed identifier %s', id => {
    expect(isSelectionId(id)).toBe(false);
});

it('accepts identifiers at the length limit', () => {
    expect(isCardId('a'.repeat(128))).toBe(true);
    expect(isBacklogId('1'.repeat(128))).toBe(true);
});
