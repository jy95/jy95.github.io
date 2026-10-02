import { classifySelection, normalizeSelectionDocument, resolveSelectionInput } from './documentClassification';
import { emptySelection } from './documentTypes';
import { selectionIds } from './identifiers';
import { deserializeSelection } from './sharingJson';
import { parseStoredSelection } from './storageFormat';

it('normalizes usable fields identically at document input boundaries', () => {
    const input = { version: 99, games: ['constructor', 'a', 'bad.id', 42, 'a'], dlcs: null,
        planning: ['p', 'backlog:42'], backlog: ['42', 'backlog:42', 42, '42'],
        legacyIds: ['unknown', '__proto__', 'backlog:7', 'bad.id', 'unknown'], extra: true };
    const expected = { ...emptySelection(), games: ['constructor', 'a'], planning: ['p'], backlog: ['42'],
        legacyIds: ['unknown', '__proto__'] };
    const json = JSON.stringify(input);
    expect(normalizeSelectionDocument(input)).toEqual(expected);
    expect(parseStoredSelection(json)).toEqual(expected);
    expect(deserializeSelection(new TextEncoder().encode(json))).toEqual(expected);
    expect(selectionIds(expected)).toEqual(['constructor', 'a', '42', 'p', 'unknown', '__proto__']);
    expect(resolveSelectionInput(input, { a: 'dlcs', unknown: 'games' })).toEqual({
        ...expected, games: ['constructor', 'a', 'unknown'], backlog: ['42'], legacyIds: ['__proto__'],
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
    expect(parseStoredSelection(JSON.stringify([...names, 'bad.id', 'backlog:42', names[0]]))).toEqual(names);
});
