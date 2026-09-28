import { describe, expect, it } from 'vitest';
import { GAME_SORT_OPTIONS } from '@/types/gamesFilters';
import { canonicalizeGenres, normalizeGameFilters, filtersToSearchParams, searchParamsToFilters } from './gamesFilterUtils';

describe('game filter conversion', () => {
    it('canonicalizes without mutating frozen arrays', () => {
        const genres = Object.freeze([10, 2, 10, 1]);
        expect(canonicalizeGenres(genres)).toEqual([1, 2, 10]);
        expect(genres).toEqual([10, 2, 10, 1]);
    });

    it('omits empty and nil fields and defaults to unrestricted API order', () => {
        expect(filtersToSearchParams({ title: '', genres: [], platform: undefined }).toString()).toBe('');
        expect(searchParamsToFilters(new URLSearchParams())).toEqual({});
        // Exercise nil values coming from untyped callers.
        expect(normalizeGameFilters(JSON.parse('{"title":null,"platform":null,"genres":null,"sort":null}'))).toEqual({});
    });

    it.each(GAME_SORT_OPTIONS)('round-trips %s with encoded title and numeric IDs', sort => {
        const filters = { title: ' Pokémon & Zelda + ', platform: 0, genres: [10, 2, 2], sort };
        const params = filtersToSearchParams(filters);
        expect(params.getAll('genres')).toEqual(['2', '10']);
        expect(searchParamsToFilters(new URLSearchParams(params.toString()))).toEqual({ ...filters, genres: [2, 10] });
    });

    it('ignores invalid numeric values, unknown keys and unsupported sorts', () => {
        const params = new URLSearchParams('platform=12abc&genres=2&genres=-1&genres=1.5&genres=&genres=NaN&genres=9007199254740992&genres=02&sort=bogus&page=2');
        expect(searchParamsToFilters(params)).toEqual({ genres: [2] });
        expect(normalizeGameFilters({ platform: Infinity, genres: [NaN, -1, 1.5, 2] })).toEqual({ genres: [2] });
    });

    it('uses the first scalar value and is idempotent', () => {
        const params = new URLSearchParams('title=first&title=second&platform=2&platform=3');
        const filters = searchParamsToFilters(params);
        expect(filters).toEqual({ title: 'first', platform: 2 });
        expect(normalizeGameFilters(normalizeGameFilters(filters))).toEqual(filters);
        expect(params.getAll('title')).toEqual(['first', 'second']);
    });
});
