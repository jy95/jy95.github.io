import { describe, expect, it } from 'vitest';
import { compareGames, SORT_OPTIONS } from './gameSorting';
import type { TieredCardGame } from './gameSorting';

const game = (id: string, title: string, duration?: string, tierCategory?: string): TieredCardGame => ({
    id, title, duration, tierCategory, url: '', url_type: 'VIDEO', imagePath: '',
});
describe('catalog game sorting', () => {
    it.each(SORT_OPTIONS)('breaks identical values by ascending title and id for %s', sort => {
        expect([game('b', 'Same'), game('a', 'Same')].sort((a, b) => compareGames(a, b, sort)).map(item => item.id)).toEqual(['a', 'b']);
    });
    it('ranks missing duration as zero and unknown tiers last', () => {
        expect(compareGames(game('a', 'A'), game('b', 'B', '01:00:00'), 'durationAsc')).toBeLessThan(0);
        expect(compareGames(game('a', 'A', undefined, 'unknown'), game('b', 'B', undefined, 'tier_good'), 'tierAsc')).toBeGreaterThan(0);
    });
});
