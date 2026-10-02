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
