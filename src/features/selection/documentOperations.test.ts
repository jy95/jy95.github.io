import { describe, expect, it } from 'vitest';
import { classifySelection, mergeSelections, removeSelectionIdentifier, resolveSelectionInput, toggleSelectionIdentifier } from './documentOperations';
import { emptySelection } from './documentTypes';
import { selectionIds } from './identifiers';
import { resolveSelectionCatalogue } from './resolveCatalogue';
import type { SelectionEntry } from './catalogue';

const categories = { a: 'games', b: 'dlcs' } as const;

describe('document operations', () => {
    it('resolves legacy identifiers without overriding explicit categories', () => {
        const input = { ...emptySelection(), planning: ['a'], legacyIds: ['b', 'unknown', 'constructor'] };
        expect(resolveSelectionInput(input, categories)).toEqual({ ...emptySelection(), planning: ['a'], dlcs: ['b'], legacyIds: ['unknown', 'constructor'] });
        expect(input.legacyIds).toEqual(['b', 'unknown', 'constructor']);
        expect(classifySelection(['toString', '__proto__'], categories).legacyIds).toEqual(['toString', '__proto__']);
    });
    it('merges per category in order, deduplicates, and retains unresolved identifiers', () => {
        const first = { ...emptySelection(), games: ['a'], legacyIds: ['unknown'] };
        const second = { ...emptySelection(), games: ['a', 'z'], backlog: ['42'], legacyIds: ['unknown', 'other'] };
        const merged = mergeSelections(first, second);
        expect(selectionIds(merged)).toEqual(['a', 'z', 'backlog:42', 'unknown', 'other']);
        expect(first.games).toEqual(['a']);
        expect(second.games).toEqual(['a', 'z']);
    });
    it('removes all occurrences across categories and legacy IDs without changing input', () => {
        const input = { ...emptySelection(), games: ['a'], dlcs: ['a', 'b'], backlog: ['42'], legacyIds: ['a'] };
        const removed = removeSelectionIdentifier(input, 'a');
        expect(selectionIds(removed)).toEqual(['backlog:42', 'b']);
        expect(input.games).toEqual(['a']);
        expect(removeSelectionIdentifier(removed, 'backlog:42').backlog).toEqual([]);
    });
    it('toggles validated identifiers and preserves document identity for invalid input', () => {
        const initial = emptySelection();
        expect(toggleSelectionIdentifier(initial, '!!!', categories)).toBe(initial);
        const added = toggleSelectionIdentifier(initial, 'b', categories);
        expect(added.dlcs).toEqual(['b']);
        expect(selectionIds(toggleSelectionIdentifier(added, 'b', categories))).toEqual([]);
        expect(resolveSelectionInput(['b', 'b', 'backlog:42'], categories)).toEqual({ ...emptySelection(), backlog: ['42'], dlcs: ['b'] });
    });
});

it('resolves available catalogue entries only when the shared category is authoritative or legacy', () => {
    const catalogue: SelectionEntry[] = [{ selectionId: 'a', category: 'games', source: 'published', game: { id: 'a', title: 'Alpha', imagePath: '/a.webp', url_type: 'VIDEO', url: 'https://youtube.com' } }];
    expect(resolveSelectionCatalogue(catalogue, ['a', 'missing'])).toMatchObject({ entries: catalogue, unavailable: 1, selectedIds: ['a'] });
    expect(resolveSelectionCatalogue(catalogue, ['a', 'a'])).toEqual({ entries: catalogue, unavailable: 0, selectedIds: ['a'] });
    expect(resolveSelectionCatalogue(catalogue, ['missing', 'a', 'missing', 'a', 'other'])).toEqual({ entries: catalogue, unavailable: 2, selectedIds: ['a'] });
    expect(resolveSelectionCatalogue(catalogue, ['a'], { ...emptySelection(), planning: ['a'] })).toMatchObject({ entries: [], unavailable: 1 });
    expect(resolveSelectionCatalogue(catalogue, ['a', 'a', 'missing', 'missing'], { ...emptySelection(), planning: ['a'] })).toEqual({ entries: [], unavailable: 2, selectedIds: [] });
    expect(resolveSelectionCatalogue(catalogue, ['a'], { ...emptySelection(), legacyIds: ['a'] }).entries).toEqual(catalogue);
});

it('does not reclassify legacy identifiers already assigned an explicit category', () => {
    const input = { ...emptySelection(), planning: ['a'], legacyIds: ['a', 'b', 'unknown'] };
    expect(resolveSelectionInput(input, categories)).toEqual({ ...emptySelection(), planning: ['a'], dlcs: ['b'], legacyIds: ['unknown'] });
    expect(input.legacyIds).toEqual(['a', 'b', 'unknown']);
});
