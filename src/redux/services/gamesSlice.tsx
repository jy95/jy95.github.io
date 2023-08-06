import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction, AsyncThunk } from "@reduxjs/toolkit";
import type { BasicGame, EnhancedGame, BasicVideo, BasicPlaylist, Genre } from "./sharedDefintion";
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
export const filtersFunctions = {
    /** @description To check if platform match search critiria */
    "selected_platform": (platform : string) => (game : EnhancedGame) => game.platform === platform,
    /** @description To check if title match search criteria (insensitive search) */
    "selected_title": (searchTitle : string) => (game : EnhancedGame) => game.title.search(new RegExp(searchTitle, 'i')) >= 0,
    /** @description To check if two arrays contains at least one element in common */
    "selected_genres": (requestedGenres : Genre[]) => (game : EnhancedGame) => requestedGenres.some(v => game.genres.indexOf(v) >= 0)
}

// search criterias
const sortByNameASC = (a : EnhancedGame, b : EnhancedGame) => new Intl.Collator().compare(a.title, b.title);
const sortByReleaseDateASC = (a : EnhancedGame, b : EnhancedGame) => {
    let aa = a["releaseDate"];
    let bb = b["releaseDate"];
    return aa < bb ? -1 : (aa > bb ? 1 : 0);
};
const sortByDurationASC = (a : EnhancedGame, b : EnhancedGame) => (a.durationAsInt < b.durationAsInt) ? -1 : (a.durationAsInt > b.durationAsInt ? 1 : 0);

// To compute new sorting function
const sortingFunctions = {
    "name": (order: string) => (order === "ASC") ? sortByNameASC : (a : EnhancedGame, b : EnhancedGame) => -sortByNameASC(a, b),
    "releaseDate": (order: string) => (order === "ASC") ? sortByReleaseDateASC : (a : EnhancedGame, b : EnhancedGame) => -sortByReleaseDateASC(a, b),
    "duration": (order: string) => (order === "ASC") ? sortByDurationASC : (a : EnhancedGame, b : EnhancedGame) => -sortByDurationASC(a, b)
}

// Inspired by https://stackoverflow.com/a/60068169/6149867
type sortingCriteriaType = ((a : EnhancedGame, b: EnhancedGame) => number)[];
function makeMultiCriteriaSort(criteria : sortingCriteriaType) {
    return (a : EnhancedGame, b : EnhancedGame) => {
        for(let i = 0; i < criteria.length; i++) {
            const comparatorResult = criteria[i](a, b);
            if (comparatorResult !== 0) {
                return comparatorResult;
            }
        }
        return 0;
    }
}

export const generate_sort_function = (sortStates: gamesSorters) => makeMultiCriteriaSort(
    sortStates.map( ([key, order]) => sortingFunctions[key](order))
);

export const generate_filter_function = (currentFilters : gamesFilters) => (game : EnhancedGame) => currentFilters.every(filter => filtersFunctions[filter.key](filter.value as any)(game));

// Interface from the JSON file
export interface GamesState {
    /** @description  All available games of the channel */
    games: EnhancedGame[],
    /** @description  error occurred ? */
    error: null | Error,
    /** @description  data loading ? */
    loading: boolean,
    /** @description  scrolling loading ? */
    scrollLoading: boolean,
    /** @description  total number of items (including filtering criteria) */
    totalItems: number,
    /** @description  current loaded items (used for infinite scrolling) */
    currentItemCount: number,
    /** @description  Page size (used for infinite scrolling) */
    pageSize: number,
    /** @description  Is first load (Only load once) */
    initialLoad: boolean,
    /** @description  sorting */
    sorters: gamesSorters,
    /** @description  current filters applied */
    activeFilters: gamesFilters
}

const initialState: GamesState = {
    games: [],
    error: null,
    loading: false,
    scrollLoading: false,
    totalItems: 0,
    currentItemCount: 0,
    pageSize: 24,
    initialLoad: true,
    sorters: [
        ["name", "ASC"],
        ["releaseDate", "ASC"],
        ["duration", "ASC"]
    ],
    activeFilters: []
};


// For fetching games
export const fetchGames = createAsyncThunk('games/fetchGames', async () => {
    // TODO Somewhere in the future, use provided parameters for some API
    let games = await all_games();
    
    return {
        games,
        totalItems: games.length,
    }
}, {
    condition: (_params, { getState } ) => {
        const {
            games
        } = getState() as {
            [key: string]: any,
            games: GamesState
        };

        // only enabled at first load
        return games.initialLoad;
    }
});

export const scrollingFetching = createAsyncThunk('games/scrollingFetching', async (params) => {
    const pageSize = ((params as any)?.pageSize as number | undefined );
    return {
        pageSize
    };
}, {
    condition: (_params, { getState } ) => {
        const {
            scrollLoading,
            initialLoad
        } = getState() as {
            [key: string]: any,
            scrollLoading: boolean,
            initialLoad: boolean
        };
        // if first load or still loading, ignore request
        if (initialLoad || scrollLoading) {
            return false;
        } else {
            return true;
        }
    }
});

const gamesSlice = createSlice({
    name: 'games',
    initialState,
// Redux Toolkit allows us to write "mutating" logic in reducers. It
// doesn't actually mutate the state because it uses the Immer library
    reducers: {
        sortingGames(state : GamesState, action: PayloadAction<gamesSorters>) {
            state.sorters = action.payload;
        },
        filteringByGenre(state : GamesState, action: PayloadAction<string[]>) {
            // If empty, remove filter - if not, add it
            let newFilters = state.activeFilters.filter(s => s.key !== "selected_genres");
            if (action.payload.length !== 0) {
                newFilters.push({
                    key: "selected_genres",
                    value: action.payload
                });
            }

            let currentTotalItems = countMatches(state.games, newFilters);
            state.totalItems = currentTotalItems;
            state.activeFilters = newFilters;
            state.currentItemCount = (currentTotalItems < state.pageSize) ? currentTotalItems : state.pageSize;
        },
        filterByTitle(state : GamesState, action: PayloadAction<string>) {
            // If empty, remove filter - if not, add it
            let newFilters = state.activeFilters.filter(s => s.key !== "selected_title");
            if (action.payload.length !== 0) {
                newFilters.push({
                    key: "selected_title",
                    value: action.payload
                });
            }

            let currentTotalItems = countMatches(state.games, newFilters);
            state.totalItems = currentTotalItems;
            state.activeFilters = newFilters;
            state.currentItemCount = (currentTotalItems < state.pageSize) ? currentTotalItems : state.pageSize;
        },
        filterByPlatform(state : GamesState, action: PayloadAction<string>) {
            // If empty, remove filter - if not, add it
            let newFilters = state.activeFilters.filter(s => s.key !== "selected_platform");
            if (action.payload.length !== 0) {
                newFilters.push({
                    key: "selected_platform",
                    value: action.payload
                });
            }

            let currentTotalItems = countMatches(state.games, newFilters);
            state.totalItems = currentTotalItems;
            state.activeFilters = newFilters;
            state.currentItemCount = (currentTotalItems < state.pageSize) ? currentTotalItems : state.pageSize;
        }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchGames.pending, (state : GamesState, _) => {
                state.loading = true;
            })       
            .addCase(fetchGames.fulfilled, (state : GamesState, { payload }) => {
                state.loading = false;
                state.initialLoad = false;
                state.games = (payload as any).games as [];
                state.totalItems = (payload as any).totalItems as number;
                state.currentItemCount = (payload as any).pageSize as number;
                state.pageSize = (payload as any).pageSize as number;
                state.error = null;
            })
            .addCase(fetchGames.rejected, (state : GamesState, { payload }) => {
                state.loading = false;
                state.games = [];
                state.totalItems = 0;
                state.currentItemCount = 0;
                state.error = payload as Error;
            })
            .addCase(scrollingFetching.pending, (state : GamesState, _) => {
                state.scrollLoading = true;
            })
            .addCase(scrollingFetching.fulfilled, (state : GamesState, { payload }) => {
                state.scrollLoading = false;
                if (payload.pageSize && (state.pageSize !== payload.pageSize)) {
                    state.pageSize = payload.pageSize;
                }
                state.currentItemCount += state.pageSize;
            })
            .addCase(scrollingFetching.rejected, (state : GamesState, { payload }) => {
                state.scrollLoading = false;
                state.error = payload as Error;
            });
    }
})

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
export const {
    sortingGames,
    filteringByGenre,
    filterByTitle,
    filterByPlatform
} = gamesSlice.actions;
export default gamesSlice.reducer;