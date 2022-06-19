import { createSlice, PayloadAction, createAsyncThunk, AsyncThunk } from '@reduxjs/toolkit';
// @ts-ignore
import { BasicGame, EnhancedGame } from "./sharedDefintion.tsx";

type gamesSorters = [
    "name" | "releaseDate" | "duration",
    "ASC" | "DESC"
][];

// To compute new filtering function
type gamesFilters = ({
    value: string,
    key: "selected_platform" | "selected_title"
} | {
    value: string[],
    key: "selected_genres"
})[];
export const filtersFunctions = {
    // To check if platform match search critiria
    "selected_platform": (platform) => (game) => game.platform === platform,
    // To check if title match search criteria (insensitive search)
    "selected_title": (searchTitle) => (game) => game.title.search(new RegExp(searchTitle, 'i')) >= 0,
    // To check if two arrays contains at least one element in common
    "selected_genres": (requestedGenres) => (game) => requestedGenres.some(v => game.genres.indexOf(v) >= 0)
}

// search criterias
const sortByNameASC = (a, b) => new Intl.Collator().compare(a.title, b.title);
const sortByReleaseDateASC = (a, b) => {
    let aa = a["releaseDate"];
    let bb = b["releaseDate"];
    return aa < bb ? -1 : (aa > bb ? 1 : 0);
};
const sortByDurationASC = (a, b) => (a.durationAsInt < b.durationAsInt) ? -1 : (a.durationAsInt > b.durationAsInt ? 1 : 0);

// To compute new sorting function
const sortingFunctions = {
    "name": (order: string) => (order === "ASC") ? sortByNameASC : (a, b) => -sortByNameASC(a, b),
    "releaseDate": (order: string) => (order === "ASC") ? sortByReleaseDateASC : (a, b) => -sortByReleaseDateASC(a, b),
    "duration": (order: string) => (order === "ASC") ? sortByDurationASC : (a, b) => -sortByDurationASC(a, b)
}

// Inspired by https://stackoverflow.com/a/60068169/6149867
function makeMultiCriteriaSort(criteria) {
    return (a, b) => {
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

export const generate_filter_function = (currentFilters : gamesFilters) => (game) => currentFilters.every(filter => filtersFunctions[filter.key](filter.value)(game));

// Interface from the JSON file
export interface GamesState {
    // All available games of the channel
    games: EnhancedGame[],
    // error occurred ?
    error: null | Error,
    // data loading ?
    loading: boolean,
    // scrolling loading ?
    scrollLoading: boolean,
    // total number of items (including filtering criteria)
    totalItems: number,
    // current loaded items (used for infinite scrolling)
    currentItemCount: number,
    // Page size (used for infinite scrolling)
    pageSize: number,
    // Only load once
    initialLoad: boolean,
    // sorting
    sorters: gamesSorters,
    // current filters applied
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

let countMatches = (games, filters) => games
    .reduce(
        // Fastest way to compute that
        (count, game) => count + (filters.every(condition => filtersFunctions[condition.key](condition.value)(game)) & 1),
        // If no criteria, all games match
        (filters.length === 0) ? games.length : 0
    );

// Needed in several sub functions
export const all_games = async () => {
    // Regex for duration
    const DURATION_REGEX = /(\d+):(\d+):(\d+)/; 

    // current date as integer (quicker comparaison)
    const currentDate = new Date();
    const integerDate = [
        currentDate.getFullYear() * 10000,
        (currentDate.getMonth() + 1) * 100,
        currentDate.getDate()
    ].reduce((acc, cur) => acc + cur, 0);

    const gamesData = await import("../data/games.json");

    // Build list of available games
    return (gamesData.games as BasicGame[])
        // hide not yet public games on channel
        .filter(game => !game.hasOwnProperty("availableAt") || game?.availableAt <= integerDate)
        // enhance payload
        .map(game => {
            const parts = game.releaseDate.split("/");
            const id = game.playlistId ?? game.videoId;
            const base_url = (
                (game.playlistId) 
                    ? "https://www.youtube.com/playlist?list=" 
                    :  "https://www.youtube.com/watch?v="
            ) + id ;
            const url_type = (game.playlistId) ? "PLAYLIST" : "VIDEO";
            return Object.assign({}, game, {
                "id": id,
                "imagesFolder": process.env.PUBLIC_URL + gamesData.coversRootPath + id,
                "imagePath": process.env.PUBLIC_URL + gamesData.coversRootPath + id + "/" + (game?.coverFile ?? gamesData.defaultCoverFile),
                "releaseDate": new Date(+parts[2], Number(parts[1]) -1, +parts[0]),
                "url": base_url,
                "url_type": url_type,
                "durationAsInt": parseInt((game.duration || "00:00:00").replace(DURATION_REGEX, "$1$2$3")),
                "hasResponsiveImages": game?.hasResponsiveImages || gamesData.defaultHasResponsiveImages
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
    currentFilters,
    sortStates,
    pageSize = 24
}) => {
    let games = await all_games();

    let filtersFunction = (game) => currentFilters.every(filter => filtersFunctions[filter.key](filter.value)(game));
    let sortFunction = generate_sort_function(sortStates);

    let currentGames = games
        // remove the ones that doesn't match filter criteria
        .filter(filtersFunction)
        // sort them in user preference
        .sort(sortFunction);
    
    return {
        games: currentGames,
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
        sortingOrderChange(state : GamesState, action: PayloadAction<gamesSorters>){
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

// Action creators are generated for each case reducer function
export const {
    sortingGames,
    sortingOrderChange,
    filteringByGenre,
    filterByTitle,
    filterByPlatform
} = gamesSlice.actions;
export default gamesSlice.reducer;