import { isBacklogId, isSelectionId, normalizeSelectionIds } from './identifiers';

it('keeps prototype-like names and deduplicates valid selection IDs in order', () => {
    const names = ['constructor', 'toString', '__proto__'];
    expect(normalizeSelectionIds([...names, names[0], 'backlog:42', 'bad.id', 42])).toEqual(names);
});

it('accepts raw numeric IDs and ignores obsolete prefixed IDs', () => {
    expect(isBacklogId('42')).toBe(true);
    expect(isBacklogId('backlog:42')).toBe(false);
    expect(isSelectionId('backlog:42')).toBe(false);
    expect(isSelectionId('42')).toBe(true);
});

it.each(['', 'bad.id', 'a'.repeat(129), 'backlog:' + '1'.repeat(129), 42, null])('skips malformed identifier %s', id => {
    expect(isSelectionId(id)).toBe(false);
});

it('accepts identifiers at the length limit', () => {
    expect(isSelectionId('a'.repeat(128))).toBe(true);
    expect(isBacklogId('1'.repeat(128))).toBe(true);
});
