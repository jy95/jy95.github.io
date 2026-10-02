import { normalizeSelectionDocument } from './documentClassification';
import { SELECTION_CATEGORIES, emptySelection } from './documentTypes';
import { deserializeSelection, serializeSelection } from './sharingJson';
import { parseStoredSelection } from './storageFormat';

it('loads old documents while ignoring metadata and unknown fields at every boundary', () => {
    const input = { version: 2, legacyIds: ['unknown'], games: ['constructor', 'a', 42, 'a'], extra: true };
    const expected = { ...emptySelection(), games: ['constructor', 'a'] };
    const json = JSON.stringify(input);
    expect(normalizeSelectionDocument(input)).toEqual(expected);
    expect(parseStoredSelection(json)).toEqual(expected);
    expect(deserializeSelection(new TextEncoder().encode(json))).toEqual(expected);
    expect(new TextDecoder().decode(serializeSelection({ ...expected, ...{ version: 2, legacyIds: ['unknown'] } }))).toBe(JSON.stringify(expected));
});

it.each([null, undefined, 42, 'text', ['a'], true])('returns an empty document for non-object input %s', value => {
    expect(normalizeSelectionDocument(value)).toEqual(emptySelection());
    expect(parseStoredSelection(JSON.stringify(value) ?? null)).toEqual(emptySelection());
});

it.each(SELECTION_CATEGORIES)('preserves strings and ordered deduplication in %s', category => {
    const ids = ['', 'bad.id!?', '日本語 🎮', 'constructor', '__proto__'];
    const expected = { ...emptySelection(), [category]: ids };
    expect(normalizeSelectionDocument({ [category]: [...ids, ids[0], null, 42] })).toEqual(expected);
    expect(deserializeSelection(serializeSelection(expected))).toEqual(expected);
});
