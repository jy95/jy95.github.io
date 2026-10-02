import { classifySelection, normalizeSelectionDocument, resolveSelectionInput } from './documentClassification';
import { SELECTION_CATEGORIES, emptySelection } from './documentTypes';
import { selectionIds } from './identifiers';
import { deserializeSelection, serializeSelection } from './sharingJson';
import { parseStoredSelection } from './storageFormat';

it('normalizes usable fields identically at document input boundaries', () => {
    const input = { version: 99, games: ['constructor', 'a', 'bad.id', 42, 'a'], dlcs: null,
        planning: ['p', 'backlog:42'], backlog: ['42', 'backlog:42', 42, '42'],
        legacyIds: ['unknown', '__proto__', 'backlog:7', 'bad.id', 'unknown'], extra: true };
    const expected = { ...emptySelection(), games: ['constructor', 'a', 'bad.id'], planning: ['p', 'backlog:42'], backlog: ['42', 'backlog:42'],
        legacyIds: ['unknown', '__proto__', 'backlog:7', 'bad.id'] };
    const json = JSON.stringify(input);
    expect(normalizeSelectionDocument(input)).toEqual(expected);
    expect(parseStoredSelection(json)).toEqual(expected);
    expect(deserializeSelection(new TextEncoder().encode(json))).toEqual(expected);
    expect(selectionIds(expected)).toEqual(['constructor', 'a', 'bad.id', '42', 'backlog:42', 'p', 'unknown', '__proto__', 'backlog:7']);
    expect(resolveSelectionInput(input, { a: 'dlcs', unknown: 'games' })).toEqual({
        ...expected, games: ['constructor', 'a', 'bad.id', 'unknown'], legacyIds: ['__proto__', 'backlog:7'],
    });
});

it.each([null, undefined, 42, 'text', [], true])('returns an empty document for unusable input %s', value => {
    expect(normalizeSelectionDocument(value)).toEqual(emptySelection());
});

it.each(['{', 'null', '42'])('silently normalizes unusable JSON %s', json => {
    expect(parseStoredSelection(json)).toEqual(emptySelection());
    expect(deserializeSelection(new TextEncoder().encode(json))).toEqual(emptySelection());
});

it('preserves prototype-like identifiers and legacy storage arrays', () => {
    const names = ['constructor', 'toString', '__proto__'];
    expect(classifySelection(names).legacyIds).toEqual(names);
    expect(parseStoredSelection(JSON.stringify([...names, 'bad.id', 'backlog:42', names[0]]))).toEqual([...names, 'bad.id', 'backlog:42']);
});

it.each(SELECTION_CATEGORIES)('preserves arbitrary IDs at storage and sharing boundaries in %s', category => {
    const ids = ['', 'bad.id!?', '日本語 🎮', 'a'.repeat(256), 'backlog:42', 'constructor', '__proto__'];
    const input = { ...emptySelection(), [category]: [...ids, ids[0], 42, null], legacyIds: [...ids, ids[1], false] };
    const expected = { ...emptySelection(), [category]: ids, legacyIds: ids };
    expect(normalizeSelectionDocument(input)).toEqual(expected);
    expect(parseStoredSelection(JSON.stringify(input))).toEqual(expected);
    expect(deserializeSelection(new TextEncoder().encode(JSON.stringify(input)))).toEqual(expected);
    expect(deserializeSelection(serializeSelection(expected))).toEqual(expected);
});

it('preserves absent versus empty legacy fields during normalization', () => {
    expect(normalizeSelectionDocument({ legacyIds: null })).not.toHaveProperty('legacyIds');
    expect(normalizeSelectionDocument({ legacyIds: [42] }).legacyIds).toEqual([]);
});
