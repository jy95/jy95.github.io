import { mergeSelections } from './documentMerge';
import { toggleSelectionIdentifier } from './documentOperations';
import { emptySelection } from './documentTypes';
import { resolveSelectionCatalogue } from './resolveCatalogue';
import type { SelectionEntry } from './catalogue';

it('merges in first-occurrence order without changing inputs', () => {
    const first = { ...emptySelection(), games: ['constructor', 'a'] };
    const second = { ...emptySelection(), games: ['a', '__proto__'], backlog: ['42'] };
    expect(mergeSelections(first, second)).toEqual({ ...emptySelection(), games: ['constructor', 'a', '__proto__'], backlog: ['42'] });
    expect(first.games).toEqual(['constructor', 'a']);
    expect(second.games).toEqual(['a', '__proto__']);
});

it('toggles only the requested category without changing the input', () => {
    const input = { ...emptySelection(), games: ['a'], dlcs: ['a', 'b'] };
    expect(toggleSelectionIdentifier(input, 'a', 'games')).toEqual({ ...emptySelection(), dlcs: ['a', 'b'] });
    expect(input.games).toEqual(['a']);
});

it('keeps the first raw-ID collision and matches only its category', () => {
    const published: SelectionEntry = { selectionId: '42', category: 'games', source: 'published',
        game: { id: '42', title: 'Published', imagePath: '/cover.webp', url_type: 'VIDEO', url: 'https://youtube.com' } };
    const backlog: SelectionEntry = { selectionId: '42', category: 'backlog', source: 'backlog',
        game: { id: '42', title: 'Waiting', imagePath: '/waiting.webp' } };
    const catalogue = [published, backlog];
    expect(resolveSelectionCatalogue(catalogue, { ...emptySelection(), backlog: ['42'] })).toMatchObject({ entries: [], unavailable: 1 });
    expect(resolveSelectionCatalogue(catalogue, { ...emptySelection(), games: ['42'] }).entries).toEqual([published]);
});
