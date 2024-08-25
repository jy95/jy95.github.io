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
    activeFilters: gamesFilters,
    /** @description current page loaded */
    page: number
}

const initialState: GamesState = {
    activeFilters: [],
    page: 1
};

const gamesSlice = createSlice({
    name: 'games',
    initialState,
// Redux Toolkit allows us to write "mutating" logic in reducers. It
// doesn't actually mutate the state because it uses the Immer library
    reducers: {
        filteringByGenre(state : GamesState, action: PayloadAction<number[]>) {
            // If empty, remove filter - if not, add it
            let newFilters = state.activeFilters.filter(s => s.key !== "selected_genres") as gamesFilters;
            if (action.payload.length !== 0) {
                newFilters.push({
                    key: "selected_genres",
                    value: action.payload
                });
            }
            state.activeFilters = newFilters;
            state.page = 1;
        },
        filterByTitle(state : GamesState, action: PayloadAction<string>) {
            // If empty, remove filter - if not, add it
            let newFilters = state.activeFilters.filter(s => s.key !== "selected_title") as gamesFilters;
            if (action.payload.length !== 0) {
                newFilters.push({
                    key: "selected_title",
                    value: action.payload
                });
            }
            state.activeFilters = newFilters;
            state.page = 1;
        },
        filterByPlatform(state : GamesState, action: PayloadAction<number | undefined>) {
            // If empty, remove filter - if not, add it
            let newFilters = state.activeFilters.filter(s => s.key !== "selected_platform") as gamesFilters;
            if (action.payload !== undefined) {
                newFilters.push({
                    key: "selected_platform",
                    value: action.payload
                });
            }
            state.activeFilters = newFilters;
            state.page = 1;
        },
        nextPage(state: GamesState) {
            state.page = state.page + 1;
        },
        resetPage(state: GamesState) {
            state.page = 1;
        }
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
        let entry = filters.find(s => s.key === "selected_genres");
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
        let entry = filters.find(s => s.key === "selected_platform");
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
        let entry = filters.find(s => s.key === "selected_title");
        if (!entry) {
            return "";
        } else {
            return entry.value as string
        }
    }
)

// Action creators are generated for each case reducer function
export const { filteringByGenre, filterByTitle, filterByPlatform, nextPage, resetPage } = gamesSlice.actions;
export default gamesSlice.reducer;
