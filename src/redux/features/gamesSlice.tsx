import { createSlice, createSelector } from '@reduxjs/toolkit';

// Types
import type { RootState } from "../Store"
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Platform } from "@/redux/sharedDefintion";
import type { Genre as GenreValue } from "@/redux/sharedDefintion";

export type gamesSorters = [
    "name" | "releaseDate" | "duration",
    "ASC" | "DESC"
][];

// To compute new filtering function
//type gamesFilterKeys = "selected_platform" | "selected_title" | "selected_genres";
export type gamesFilters = ({
    value: string,
    key: "selected_platform" | "selected_title"
} | {
    value: string[],
    key: "selected_genres"
})[];

export interface GamesState {
    /** @description  sorting */
    sorters: gamesSorters,
    /** @description  current filters applied */
    activeFilters: gamesFilters
}

const initialState: GamesState = {
    sorters: [
        ["name", "ASC"],
        ["releaseDate", "ASC"],
        ["duration", "ASC"]
    ],
    activeFilters: []
};

const gamesSlice = createSlice({
    name: 'games',
    initialState,
// Redux Toolkit allows us to write "mutating" logic in reducers. It
// doesn't actually mutate the state because it uses the Immer library
    reducers: {
        filteringByGenre(state : GamesState, action: PayloadAction<GenreValue[]>) {
            // If empty, remove filter - if not, add it
            let newFilters = state.activeFilters.filter(s => s.key !== "selected_genres") as gamesFilters;
            if (action.payload.length !== 0) {
                newFilters.push({
                    key: "selected_genres",
                    value: action.payload
                });
            }
            state.activeFilters = newFilters;
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
        },
        filterByPlatform(state : GamesState, action: PayloadAction<Platform | "">) {
            // If empty, remove filter - if not, add it
            let newFilters = state.activeFilters.filter(s => s.key !== "selected_platform") as gamesFilters;
            if (action.payload.length !== 0) {
                newFilters.push({
                    key: "selected_platform",
                    value: action.payload
                });
            }
            state.activeFilters = newFilters;
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
            return entry.value as string[]
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
            return "";
        } else {
            return entry.value as string
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
export const { filteringByGenre, filterByTitle, filterByPlatform } = gamesSlice.actions;
export default gamesSlice.reducer;
