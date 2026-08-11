import { describe, it, expect } from 'vitest';
import gamesReducer, {
    filteringByGenre,
    filterByTitle,
    filterByPlatform,
    selectSelectedGenres,
    selectSelectedPlatform,
    selectSelectedTitle,
} from './gamesSlice';
import type { GamesState, gamesFilters } from './gamesSlice';
import type { RootState } from '../Store';

/**
 * The selectors under test only read `state.games.activeFilters`, so a
 * partial RootState is sufficient — cast is scoped to this helper only.
 */
function makeState(activeFilters: gamesFilters): RootState {
    return { games: { activeFilters } } as RootState;
}

describe('gamesSlice reducer', () => {
    it('has the correct initial state', () => {
        const initial: GamesState = gamesReducer(undefined, { type: '@@INIT' });
        expect(initial).toEqual({ activeFilters: [] });
    });

    describe('filteringByGenre', () => {
        it('adds a genre filter when genres are selected', () => {
            const state = gamesReducer(undefined, filteringByGenre([1, 2, 3]));
            expect(state.activeFilters).toEqual([{ key: 'selected_genres', value: [1, 2, 3] }]);
        });

        it('removes the genre filter when given an empty array', () => {
            const withFilter = gamesReducer(undefined, filteringByGenre([1, 2]));
            const cleared = gamesReducer(withFilter, filteringByGenre([]));
            expect(cleared.activeFilters).toEqual([]);
        });

        it('replaces a previous genre filter rather than appending to it', () => {
            let state = gamesReducer(undefined, filteringByGenre([1]));
            state = gamesReducer(state, filteringByGenre([5, 6]));
            expect(state.activeFilters).toEqual([{ key: 'selected_genres', value: [5, 6] }]);
        });

        it('does not clobber other active filters', () => {
            let state = gamesReducer(undefined, filterByTitle('mario'));
            state = gamesReducer(state, filteringByGenre([1]));
            expect(state.activeFilters).toEqual([
                { key: 'selected_title', value: 'mario' },
                { key: 'selected_genres', value: [1] },
            ]);
        });
    });

    describe('filterByTitle', () => {
        it('sets a title filter', () => {
            const state = gamesReducer(undefined, filterByTitle('zelda'));
            expect(state.activeFilters).toEqual([{ key: 'selected_title', value: 'zelda' }]);
        });

        it('clears the title filter on an empty string', () => {
            const withFilter = gamesReducer(undefined, filterByTitle('zelda'));
            const cleared = gamesReducer(withFilter, filterByTitle(''));
            expect(cleared.activeFilters).toEqual([]);
        });
    });

    describe('filterByPlatform', () => {
        it('sets a platform filter', () => {
            const state = gamesReducer(undefined, filterByPlatform(6));
            expect(state.activeFilters).toEqual([{ key: 'selected_platform', value: 6 }]);
        });

        it('clears the platform filter when given undefined', () => {
            const withFilter = gamesReducer(undefined, filterByPlatform(6));
            const cleared = gamesReducer(withFilter, filterByPlatform(undefined));
            expect(cleared.activeFilters).toEqual([]);
        });
    });
});

describe('gamesSlice selectors', () => {
    it('selectSelectedGenres returns [] when no genre filter is active', () => {
        expect(selectSelectedGenres(makeState([]))).toEqual([]);
    });

    it('selectSelectedGenres returns the active genre filter value', () => {
        const state = makeState([{ key: 'selected_genres', value: [2, 3] }]);
        expect(selectSelectedGenres(state)).toEqual([2, 3]);
    });

    it('selectSelectedPlatform returns undefined when no platform filter is active', () => {
        expect(selectSelectedPlatform(makeState([]))).toBeUndefined();
    });

    it('selectSelectedPlatform returns the active platform filter value', () => {
        const state = makeState([{ key: 'selected_platform', value: 4 }]);
        expect(selectSelectedPlatform(state)).toBe(4);
    });

    it('selectSelectedTitle returns "" when no title filter is active', () => {
        expect(selectSelectedTitle(makeState([]))).toBe('');
    });

    it('selectSelectedTitle returns the active title filter value', () => {
        const state = makeState([{ key: 'selected_title', value: 'kirby' }]);
        expect(selectSelectedTitle(state)).toBe('kirby');
    });
});