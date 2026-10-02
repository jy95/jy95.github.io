import { describe, expect, it } from 'vitest';
import { classifySelection, resolveSelectionInput } from './documentClassification';
import { mergeSelections, removeSelectionIdentifier } from './documentMerge';
import { toggleSelectionIdentifier } from './documentOperations';
import { emptySelection } from './documentTypes';
import { selectionIds } from './identifiers';
import { resolveSelectionCatalogue } from './resolveCatalogue';
import type { SelectionEntry } from './catalogue';

const categories = { a: 'games', b: 'dlcs', '42': 'backlog' } as const;

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
        expect(selectionIds(merged)).toEqual(['a', 'z', '42', 'unknown', 'other']);
        expect(first.games).toEqual(['a']);
        expect(second.games).toEqual(['a', 'z']);
    });
    it('removes all occurrences across categories and legacy IDs without changing input', () => {
        const input = { ...emptySelection(), games: ['a'], dlcs: ['a', 'b'], backlog: ['42'], legacyIds: ['a'] };
        const removed = removeSelectionIdentifier(input, 'a');
        expect(selectionIds(removed)).toEqual(['42', 'b']);
        expect(input.games).toEqual(['a']);
        expect(removeSelectionIdentifier(removed, '42').backlog).toEqual([]);
    });
    it('toggles validated identifiers and preserves document identity for invalid input', () => {
        const initial = emptySelection();
        for (const id of ['!!!', '', 'a'.repeat(129), `backlog:${'1'.repeat(129)}`]) {
            expect(toggleSelectionIdentifier(initial, id, categories)).toBe(initial);
        }
        const added = toggleSelectionIdentifier(initial, 'b', categories);
        expect(added.dlcs).toEqual(['b']);
        expect(selectionIds(toggleSelectionIdentifier(added, 'b', categories))).toEqual([]);
        expect(resolveSelectionInput(['b', 'b', '42'], categories)).toEqual({ ...emptySelection(), backlog: ['42'], dlcs: ['b'] });
    });
});

it('resolves available catalogue entries only when the shared category is authoritative or legacy', () => {
    const catalogue: SelectionEntry[] = [{ selectionId: 'a', category: 'games', source: 'published', game: { id: 'a', title: 'Alpha', imagePath: '/a.webp', url_type: 'VIDEO', url: 'https://youtube.com' } }];
    expect(resolveSelectionCatalogue(catalogue, ['a', 'missing'])).toMatchObject({ entries: catalogue, unavailable: 1, selectedIds: ['a'] });
    expect(resolveSelectionCatalogue(catalogue, ['a'], { ...emptySelection(), planning: ['a'] })).toMatchObject({ entries: [], unavailable: 1 });
    expect(resolveSelectionCatalogue(catalogue, ['a'], { ...emptySelection(), legacyIds: ['a'] }).entries).toEqual(catalogue);
});

it('does not reclassify legacy identifiers already assigned an explicit category', () => {
    const input = { ...emptySelection(), planning: ['a'], legacyIds: ['a', 'b', 'unknown'] };
    expect(resolveSelectionInput(input, categories)).toEqual({ ...emptySelection(), planning: ['a'], dlcs: ['b'], legacyIds: ['unknown'] });
    expect(input.legacyIds).toEqual(['a', 'b', 'unknown']);
});

it('preserves the distinction between absent and empty legacy identifiers', () => {
    const absent = emptySelection();
    const empty = { ...emptySelection(), legacyIds: [] };
    expect(mergeSelections(absent, empty)).not.toHaveProperty('legacyIds');
    expect(mergeSelections(empty, absent).legacyIds).toEqual([]);
    expect(removeSelectionIdentifier(absent, 'missing')).not.toHaveProperty('legacyIds');
    expect(removeSelectionIdentifier(empty, 'missing').legacyIds).toEqual([]);
    expect(removeSelectionIdentifier({ ...emptySelection(), legacyIds: ['a'] }, 'a').legacyIds).toEqual([]);
});

it('normalizes merged legacy identifiers in first-occurrence order', () => {
    const first = { ...emptySelection(), legacyIds: ['b', 'bad.id', 'a', 'b'] };
    const second = { ...emptySelection(), legacyIds: ['a', '42', 'c'] };
    expect(mergeSelections(first, second).legacyIds).toEqual(['b', 'a', '42', 'c']);
    expect(first.legacyIds).toEqual(['b', 'bad.id', 'a', 'b']);
    expect(second.legacyIds).toEqual(['a', '42', 'c']);
});


it('keeps the first raw-ID collision and respects explicit categories over legacy IDs', () => {
    const published: SelectionEntry = { selectionId: '42', category: 'games', source: 'published',
        game: { id: '42', title: 'Published', imagePath: '/cover.webp', url_type: 'VIDEO', url: 'https://youtube.com' } };
    const backlog: SelectionEntry = { selectionId: '42', category: 'backlog', source: 'backlog',
        game: { id: '42', title: 'Waiting', imagePath: '/waiting.webp' } };
    const catalogue = [published, backlog];
    expect(resolveSelectionCatalogue(catalogue, ['42']).entries).toEqual([published]);
    expect(resolveSelectionCatalogue(catalogue, ['42'], { ...emptySelection(), backlog: ['42'], legacyIds: ['42'] }))
        .toMatchObject({ entries: [], unavailable: 1 });
    expect(resolveSelectionCatalogue(catalogue, ['42'], { ...emptySelection(), games: ['42'] }).entries).toEqual([published]);
});
