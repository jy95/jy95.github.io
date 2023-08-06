import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { RootState } from "../Store"

type gamesSorters = [
    "name" | "releaseDate" | "duration",
    "ASC" | "DESC"
][];

// To compute new filtering function
//type gamesFilterKeys = "selected_platform" | "selected_title" | "selected_genres";
type gamesFilters = ({
    value: string,
    key: "selected_platform" | "selected_title"
} | {
    value: string[],
    key: "selected_genres"
})[];

export interface GamesState {
    /** @description  scrolling loading ? */
    scrollLoading: boolean,
    /** @description  total number of items (including filtering criteria) */
    totalItems: number,
    /** @description  current loaded items (used for infinite scrolling) */
    currentItemCount: number,
    /** @description  Is first load (Only load once) */
    initialLoad: boolean,
    /** @description  sorting */
    sorters: gamesSorters,
    /** @description  current filters applied */
    activeFilters: gamesFilters
}

const initialState: GamesState = {
    scrollLoading: false,
    totalItems: 0,
    currentItemCount: 0,
    initialLoad: true,
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
    reducers: {},
    extraReducers(_builder) {}
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

// Can load more in scrolling
export const selectCanLoadMore = createSelector(
    [
        (state : RootState) => state.games.currentItemCount,
        (state : RootState) => state.games.totalItems
    ],
    (currentItemCount, totalItems) => {
        return currentItemCount <= totalItems;
    }
);

// Action creators are generated for each case reducer function
export const {} = gamesSlice.actions;
export default gamesSlice.reducer;