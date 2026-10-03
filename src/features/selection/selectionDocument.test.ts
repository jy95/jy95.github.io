import { describe, expect, it } from 'vitest';
import {
    SELECTION_CATEGORIES, documentOf, emptySelection, hasNewIds, isEmpty,
    mergeSelections, resolveSelection, toggleId, toSelectionDocument,
} from './selectionDocument';
import type { SelectionEntry } from './catalogue';

const entry = (category: string, id: string) => ({
    source: category === 'backlog' ? 'backlog' : 'published', category, selectionId: id,
    game: { id, title: id, imagePath: '/x.webp', url: 'https://youtube.com', url_type: 'VIDEO' },
}) as SelectionEntry;

describe('model', () => {
    it('derives the empty document from the category list', () => {
        expect(Object.keys(emptySelection())).toEqual([...SELECTION_CATEGORIES]);
    });

    it('normalizes garbage, unknown fields, non-strings and duplicates', () => {
        expect(toSelectionDocument({ games: ['b', 'a', 'b', 1, null], extra: ['x'], version: 9 }))
            .toEqual({ ...emptySelection(), games: ['b', 'a'] });
        for (const value of [null, undefined, 42, 'text', ['a'], true]) {
            expect(toSelectionDocument(value)).toEqual(emptySelection());
        }
    });

    it('keeps arbitrary identifier strings, including prototype names', () => {
        const ids = ['', '__proto__', 'constructor', '日本語 🎮', 'a:b'];
        expect(toSelectionDocument({ dlcs: ids }).dlcs).toEqual(ids);
    });

    it('toggles one category without mutating the input', () => {
        const input = { ...emptySelection(), games: ['a'], dlcs: ['a'] };
        expect(toggleId(input, 'games', 'a')).toEqual({ ...emptySelection(), dlcs: ['a'] });
        expect(toggleId(input, 'games', 'b').games).toEqual(['a', 'b']);
        expect(input.games).toEqual(['a']);
    });

    it('merges in first-occurrence order without duplicates or mutation', () => {
        const a = { ...emptySelection(), games: ['x', 'y'] };
        const b = { ...emptySelection(), games: ['y', 'z'], backlog: ['1'] };
        expect(mergeSelections(a, b)).toEqual({ ...emptySelection(), games: ['x', 'y', 'z'], backlog: ['1'] });
        expect(a.games).toEqual(['x', 'y']);
    });

    it('detects whether an import would change the personal selection', () => {
        const personal = { ...emptySelection(), games: ['a'] };
        expect(hasNewIds({ ...emptySelection(), games: ['a'] }, personal)).toBe(false);
        expect(hasNewIds({ ...emptySelection(), planning: ['a'] }, personal)).toBe(true);
        expect(isEmpty(emptySelection())).toBe(true);
    });
});

describe('resolution', () => {
    const catalogue = [entry('games', 'a'), entry('backlog', '42')];

    it('resolves per category and counts missing identifiers', () => {
        const document = { ...emptySelection(), games: ['a', 'gone'], backlog: ['42'], planning: ['a'] };
        const { entries, missing } = resolveSelection(catalogue, document);
        expect(entries.map(e => e.selectionId)).toEqual(['a', '42']);
        expect(missing).toBe(2); // 'gone', plus 'a' requested under planning
    });

    it('returns nothing for a null document and round-trips through documentOf', () => {
        expect(resolveSelection(catalogue, null)).toEqual({ entries: [], missing: 0 });
        expect(documentOf(catalogue)).toEqual({ ...emptySelection(), games: ['a'], backlog: ['42'] });
    });
});