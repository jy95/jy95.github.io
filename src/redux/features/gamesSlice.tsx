import { createSlice, createSelector } from '@reduxjs/toolkit';

// Types
import type { RootState } from "../Store"
import type { PayloadAction } from "@reduxjs/toolkit";

// To compute new filtering function
export type gamesFilters = ({
    value: string,
    key: "title"
} | {
    value: number[],
    key: "genres"
} | {
    value: number,
    key: "platform"
})[];

export interface GamesState {
    /** @description  current filters applied */
    activeFilters: gamesFilters
}


/**

* Replaces or removes a filter identified by its key.
*
* When an entry is provided, any existing filter with the same key is removed
* and the new entry is appended. When `entry` is `undefined`, the existing
* filter is simply removed.
*
* The generic key and `Extract` type ensure that the provided entry has the
* value type associated with the specified filter key.
*
* @template K - The key of the filter to replace.
* @param filters - The current collection of active game filters.
* @param key - The key of the filter to replace or remove.
* @param entry - The replacement filter, or `undefined` to remove the filter.
* @returns A new collection of active filters with the specified filter replaced or removed.
*/
function replaceFilter<K extends gamesFilters[number]["key"]>(
    filters: gamesFilters,
    key: K,
    entry: Extract<gamesFilters[number], { key: K }> | undefined
): gamesFilters {
    const kept = filters.filter(f => f.key !== key) as gamesFilters;
    return entry ? [...kept, entry] : kept;
}

const initialState: GamesState = {
    activeFilters: []
};

const gamesSlice = createSlice({
    name: 'games',
    initialState,
// Redux Toolkit allows us to write "mutating" logic in reducers. It
// doesn't actually mutate the state because it uses the Immer library
    reducers: {
        filteringByGenre(state: GamesState, action: PayloadAction<number[]>) {
            state.activeFilters = replaceFilter(
                state.activeFilters,
                "genres",
                action.payload.length > 0
                    ? {
                        key: "genres",
                        value: action.payload
                    }
                    : undefined
            );
        },
        filterByTitle(state : GamesState, action: PayloadAction<string>) {
            state.activeFilters = replaceFilter(
                state.activeFilters,
                "title",
                action.payload.length !== 0
                    ? {
                        key: "title",
                        value: action.payload
                    }
                    : undefined
            );
        },
        filterByPlatform(state: GamesState, action: PayloadAction<number | undefined>) {
            state.activeFilters = replaceFilter(
                state.activeFilters,
                "platform",
                action.payload !== undefined
                    ? {
                        key: "platform",
                        value: action.payload
                    }
                    : undefined
            );
        },
    }
});

// memoized selector functions
const selectActiveFilters = (state : RootState) => state.games.activeFilters;

function makeFilterSelector<K extends gamesFilters[number]["key"], Default>(
    key: K,
    defaultValue: Default
) {
    return createSelector([selectActiveFilters], (filters) => {
        const entry = filters.find((f) => f.key === key);
        return entry ? (entry.value as Extract<gamesFilters[number], { key: K }>["value"]) : defaultValue;
    });
}

// Selected genres
export const selectSelectedGenres = makeFilterSelector("genres", [] as number[]);

// Selected platform
export const selectSelectedPlatform = makeFilterSelector("platform", undefined);

// Selected title
export const selectSelectedTitle = makeFilterSelector("title", "");

// Action creators are generated for each case reducer function
export const { filteringByGenre, filterByTitle, filterByPlatform } = gamesSlice.actions;
export default gamesSlice.reducer;
