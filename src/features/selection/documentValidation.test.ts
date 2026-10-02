import { normalizeSelectionIds } from './identifiers';
import { classifySelection, emptySelection, validateSelection } from './schema';

it('classifies legacy identifiers from catalogue information and retains unknown IDs', () => {
    expect(classifySelection(['game-a', 'dlc-a', 'planned-a', 'backlog:42', 'missing'], { 'game-a': 'games', 'dlc-a': 'dlcs', 'planned-a': 'planning' })).toEqual({ version: 2, games: ['game-a'], backlog: ['42'], dlcs: ['dlc-a'], planning: ['planned-a'], legacyIds: ['missing'] });
});
it('validates categories, versions and identifiers and deduplicates', () => {
    expect(validateSelection({ ...emptySelection(), dlcs: ['dlc-a', 'dlc-a'] }).dlcs).toEqual(['dlc-a']);
    expect(() => validateSelection({ ...emptySelection(), version: 3 })).toThrow('unsupported');
    expect(() => validateSelection({ ...emptySelection(), backlog: ['backlog:42'] })).toThrow('invalid');
    expect(() => validateSelection({ version: 2 })).toThrow('invalid');
});
it('retains identifiers that match object prototype property names', () => {
    expect(classifySelection(['constructor', 'toString', '__proto__']).legacyIds).toEqual(['constructor', 'toString', '__proto__']);
});

it('keeps strict category validation separate from permissive normalization', () => {
    const names = ['constructor', 'toString', '__proto__'];
    expect(normalizeSelectionIds([...names, names[0], 'backlog:42', 'bad.id', 42, 'a'.repeat(129)])).toEqual([...names, 'backlog:42']);
    expect(validateSelection({ ...emptySelection(), games: [...names, names[0]] }).games).toEqual(names);
    expect(validateSelection({ ...emptySelection(), legacyIds: [...names, 'backlog:42', 'backlog:42'] }).legacyIds).toEqual([...names, 'backlog:42']);
    for (const category of ['games', 'dlcs', 'planning'] as const) {
        expect(validateSelection({ ...emptySelection(), [category]: ['a'.repeat(128)] })[category]).toEqual(['a'.repeat(128)]);
        for (const id of ['', 'a'.repeat(129), 'backlog:42', 'bad.id', 42]) {
            expect(() => validateSelection({ ...emptySelection(), [category]: [id] })).toThrow('invalid');
        }
    }
    expect(validateSelection({ ...emptySelection(), backlog: ['1'.repeat(128)] }).backlog).toEqual(['1'.repeat(128)]);
    for (const id of ['', '1'.repeat(129), 'backlog:42', 'constructor', 42]) {
        expect(() => validateSelection({ ...emptySelection(), backlog: [id] })).toThrow('invalid');
    }
    expect(() => validateSelection({ ...emptySelection(), legacyIds: ['backlog:' + '1'.repeat(129)] })).toThrow('invalid');
});
