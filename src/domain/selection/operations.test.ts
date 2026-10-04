import { emptySelection, mergeSelections, removeId, toggleId, hasNewIds, isEmpty } from './operations';
import { isSelectionDocument } from './validation';

it('adds through merge, deduplicates per category and leaves inputs unchanged', () => {
    const personal = { ...emptySelection(), games: ['same', 'saved'] };
    const incoming = { ...emptySelection(), games: ['same', 'new', 'new'], backlog: ['same', 'missing'] };
    const before = structuredClone([personal, incoming]);
    expect(mergeSelections(personal, incoming)).toEqual({ ...emptySelection(), games: ['same', 'saved', 'new'], backlog: ['same', 'missing'] });
    expect([personal, incoming]).toEqual(before);
    expect(hasNewIds(incoming, personal)).toBe(true);
    expect(isEmpty(emptySelection())).toBe(true);
});

it('toggles and removes independently, with idempotent removal and immutable input', () => {
    const original = { ...emptySelection(), games: ['same'], backlog: ['same'] };
    const before = structuredClone(original);
    expect(toggleId(original, 'games', 'same')).toEqual({ ...original, games: [] });
    const added = toggleId(original, 'games', 'new');
    expect(added.games).toEqual(['same', 'new']);
    expect(removeId(removeId(added, 'games', 'new'), 'games', 'new')).toEqual(original);
    expect(original).toEqual(before);
});

it.each([null, [], {}, { games: [] }, { ...emptySelection(), games: [1] }, { ...emptySelection(), extra: [] }, { ...emptySelection(), dlcs: 'bad' }])('rejects invalid document %j', value => {
    expect(isSelectionDocument(value)).toBe(false);
});
it('accepts a complete document containing missing identifiers', () => {
    expect(isSelectionDocument({ ...emptySelection(), games: ['missing'] })).toBe(true);
});
