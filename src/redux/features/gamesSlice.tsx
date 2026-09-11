import { createSlice, createSelector } from '@reduxjs/toolkit';

// Types
import type { RootState } from "../Store"
import type { PayloadAction } from "@reduxjs/toolkit";

// To compute new filtering function
//type gamesFilterKeys = "selected_platform" | "selected_title" | "selected_genres";
export type gamesFilters = ({
    value: string,
    key: "selected_title"
} | {
    value: number[],
    key: "selected_genres"
} | {
    value: number,
    key: "selected_platform"
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
                "selected_genres",
                action.payload.length > 0
                    ? {
                        key: "selected_genres",
                        value: action.payload
                    }
                    : undefined
            );
        },
        filterByTitle(state : GamesState, action: PayloadAction<string>) {
            state.activeFilters = replaceFilter(
                state.activeFilters,
                "selected_title",
                action.payload.length !== 0
                    ? {
                        key: "selected_title",
                        value: action.payload
                    }
                    : undefined
            );
        },
        filterByPlatform(state: GamesState, action: PayloadAction<number | undefined>) {
            state.activeFilters = replaceFilter(
                state.activeFilters,
                "selected_platform",
                action.payload !== undefined
                    ? {
                        key: "selected_platform",
                        value: action.payload
                    }
                    : undefined
            );
        },
    }
});

// memoized selector functions
const selectActiveFilters = (state : RootState) => state.games.activeFilters;

// Selected genres
export const selectSelectedGenres = createSelector(
    [
        selectActiveFilters,
    ],
    (filters) => {
        const entry = filters.find(s => s.key === "selected_genres");
        if (!entry) {
            return [];
        } else {
            return entry.value as number[]
        }
    }
);

// Selected platform
export const selectSelectedPlatform = createSelector(
    [
        selectActiveFilters,
    ],
    (filters) => {
        const entry = filters.find(s => s.key === "selected_platform");
        if (!entry) {
            return undefined;
        } else {
            return entry.value as number
        }
    }
);

// Selected title
export const selectSelectedTitle = createSelector(
    [
        selectActiveFilters,
    ],
    (filters) => {
        const entry = filters.find(s => s.key === "selected_title");
        if (!entry) {
            return "";
        } else {
            return entry.value as string
        }
    }
)

// Action creators are generated for each case reducer function
export const { filteringByGenre, filterByTitle, filterByPlatform } = gamesSlice.actions;
export default gamesSlice.reducer;
