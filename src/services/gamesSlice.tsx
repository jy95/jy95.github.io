import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction, AsyncThunk } from "@reduxjs/toolkit";
import type { BasicGame, EnhancedGame, BasicVideo, BasicPlaylist, Genre } from "./sharedDefintion";

type gamesSorters = [
    "name" | "releaseDate" | "duration",
    "ASC" | "DESC"
][];

// To compute new filtering function
type gamesFilterKeys = "selected_platform" | "selected_title" | "selected_genres";
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

let countMatches = (games : EnhancedGame[], filters : gamesFilters) => games
    .reduce(
        // Fastest way to compute that
        (count, game) => count + (filters.every(condition => filtersFunctions[condition.key](condition.value as any)(game)) ? 1 : 0),
        // If no criteria, all games match
        (filters.length === 0) ? games.length : 0
    );

// for responsive pictures
const SIZES_WITDH = [
    {
        name: "small",
        srcSet: "150w",
        sizes: "(min-width: 1200px) 150px"
    },
    {
        name: "medium",
        srcSet: "200w",
        sizes: "(min-width: 900px) 200px"
    },
    {
        name: "big",
        srcSet: "250w",
        sizes: "250px"
    }
]

// Needed in several sub functions
export const all_games = async () => {
    // current date as integer (quicker comparaison)
    const currentDate = new Date();
    const integerDate = (currentDate.getFullYear() * 10000) + 
        ( (currentDate.getMonth() + 1) * 100 ) + 
        currentDate.getDate();

    const gamesData = await import("../data/games.json");

    // Build list of available games
    return (gamesData.games as BasicGame[])
        // hide not yet public games on channel
        .filter(game => (game?.availableAt === undefined) || game?.availableAt <= integerDate)
        // enhance payload
        .map(game => {
            const id = (game as BasicPlaylist).playlistId ?? (game as BasicVideo).videoId;
            const base_url = (
                ("playlistId" in game) 
                    ? "https://www.youtube.com/playlist?list=" 
                    :  "https://www.youtube.com/watch?v="
            ) + id ;
            const base_path = `${process.env.PUBLIC_URL}${gamesData.coversRootPath}${id}`;
            return Object.assign({}, game, {
                id,
                imagePath: `${base_path}/${ game?.coverFile ?? gamesData.defaultCoverFile }`,
                srcSet: (game?.hasResponsiveImages || gamesData.defaultHasResponsiveImages) 
                    ? SIZES_WITDH
                        .map( ({name, srcSet}) =>`${base_path}/cover@${name}.webp ${srcSet}`)
                        .join(",")
                    : undefined,
                sizes: (game?.hasResponsiveImages || gamesData.defaultHasResponsiveImages) 
                    ? SIZES_WITDH
                        .map( ({sizes}) =>`${sizes}`)
                        .join(",") 
                    : undefined,
                releaseDate: game.releaseDate
                    .split("/")
                    .reduce( (acc : number, curr : string, idx : number) => acc + (parseInt(curr) * Math.pow(100, idx)), 0),
                url: base_url,
                url_type: ("playlistId" in game) ? "PLAYLIST" : "VIDEO",
                durationAsInt: (game.duration)
                    ? Number(game.duration.replaceAll(":", ""))
                    : 0
            });
        }) as EnhancedGame[];
}

// For fetching games
export const fetchGames : AsyncThunk<{
    games: EnhancedGame[];
    totalItems: number;
    pageSize: number;
}, {
    currentFilters: gamesFilters;
    sortStates: gamesSorters;
    pageSize? : number
}, {}> = createAsyncThunk('games/fetchGames', async ({
    //currentFilters,
    //sortStates,
    pageSize = 24
}) => {
    // TODO Somewhere in the future, use provided parameters for some API
    let games = await all_games();
    
    return {
        games,
        totalItems: games.length,
        pageSize
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
const selectActiveFilters = (state : { games : GamesState }) => state.games.activeFilters;
const selectActiveFiltersParams = (_state : { games : GamesState }, params : { filterKey : gamesFilterKeys, defaultValue : any }) => params;
export const selectFilterByName = createSelector(
    [
        selectActiveFilters,
        selectActiveFiltersParams
    ],
    (filters : gamesFilters, params : { filterKey : gamesFilterKeys, defaultValue : any }) => {
        return filters.find(s => s.key === params.filterKey)?.value || params.defaultValue
    }
)

const selectActiveSorters = (state : { games : GamesState }) => state.games.sorters;
export const selectCurrentGames = createSelector(
    [
        (state : { games : GamesState }) => state.games.games,
        selectActiveFilters,
        selectActiveSorters,
        (state : { games : GamesState }) => state.games.currentItemCount
    ],
    (games, activeFilters, activeSorters, currentItemCount) => {

        const currentSortFunction = generate_sort_function(activeSorters);
        const filtersFunction = generate_filter_function(activeFilters);

        return games
            // remove the ones that doesn't match filter criteria
            .filter(filtersFunction)
            // sort them in user preference
            .sort(currentSortFunction)
            .slice(0, currentItemCount);
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