import { afterEach, describe, expect, it, vi } from 'vitest';
import { GAME_SORT_OPTIONS } from '@/types/gamesFilters';
import { MIN_RELEASE_YEAR, getMaxReleaseYear, getReleaseYearRange, releaseYear, canonicalizeGenres, normalizeGameFilters, filtersToSearchParams, searchParamsToFilters } from './gamesFilterUtils';

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


describe('release period normalization', () => {
    afterEach(() => vi.useRealTimers());

    it('uses the earliest catalogue release without shipping the catalogue to the client', async () => {
        const games = (await import('@/app/api/games/games.json')).default;
        const years = games.map(game => releaseYear(game.releaseDate)).filter(year => year !== undefined);
        expect(MIN_RELEASE_YEAR).toBe(Math.min(...years));
    });

    it.each([2026, 2027, 2028])('uses calendar year %s even when catalogue releases end earlier', async year => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(year, 5, 1));
        const games = (await import('@/app/api/games/games.json')).default;
        expect(Math.max(...games.map(game => releaseYear(game.releaseDate) ?? 0))).toBeLessThan(year);
        expect(getMaxReleaseYear()).toBe(year);
        expect(getReleaseYearRange({})).toEqual([MIN_RELEASE_YEAR, year]);
        expect(filtersToSearchParams({ releaseDateFrom: MIN_RELEASE_YEAR, releaseDateTo: year }).toString()).toBe('');
    });

    it('round-trips a period alongside all existing filters', () => {
        const filters = { title: 'Zelda', platform: 6, genres: [1, 2], sort: 'title_asc' as const, releaseDateFrom: 2000, releaseDateTo: 2005 };
        const params = filtersToSearchParams(filters);
        expect(params.get('releaseDateFrom')).toBe('2000');
        expect(params.get('releaseDateTo')).toBe('2005');
        expect(searchParamsToFilters(params)).toEqual(filters);
    });

    it('supports single bounds, clamps out-of-range years, orders reversed bounds and ignores malformed years', () => {
        expect(searchParamsToFilters(new URLSearchParams('releaseDateFrom=2000'))).toEqual({ releaseDateFrom: 2000 });
        expect(searchParamsToFilters(new URLSearchParams('releaseDateTo=2005'))).toEqual({ releaseDateTo: 2005 });
        expect(searchParamsToFilters(new URLSearchParams('releaseDateFrom=2005&releaseDateTo=2000'))).toEqual({ releaseDateFrom: 2000, releaseDateTo: 2005 });
        expect(searchParamsToFilters(new URLSearchParams('releaseDateFrom=1900&releaseDateTo=9999'))).toEqual({});
        expect(searchParamsToFilters(new URLSearchParams('releaseDateFrom=2000oops&releaseDateTo=2005.5'))).toEqual({});
    });
});
