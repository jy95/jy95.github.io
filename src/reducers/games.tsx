import {
    FETCHING_FAILED,
    FETCHING_OK,
    FETCHING_REQUESTED,
    SORTING_GAMES,
    SORTING_ORDER_CHANGED,
    FILTERING_BY_GENRE,
    FILTERING_BY_TITLE,
    FILTERING_BY_PLATFORM,
    FETCHING_SCROLLING
} 
// @ts-ignore
from "../actions/games.tsx"

// search criterias
const sortByNameASC = (a, b) => new Intl.Collator().compare(a.title, b.title);
const sortByReleaseDateASC = (a, b) => {
    let aa = a["releaseDate"];
    let bb = b["releaseDate"];
    return aa < bb ? -1 : (aa > bb ? 1 : 0);
};
const sortByDurationASC = (a, b) => (a.durationAsInt < b.durationAsInt) ? -1 : (a.durationAsInt > b.durationAsInt ? 1 : 0);

// To check if platform match search critiria
const matches_platform_search = (platform) => (game) => game.platform === platform;

// To check if title match search criteria (insensitive search)
const matches_title_search = (searchTitle) => (game) => game.title.search(new RegExp(searchTitle, 'i')) >= 0;

// To check if two arrays contains at least one element in common
const at_least_one_in_common = (requestedGenres) => (game) => requestedGenres.some(v => game.genres.indexOf(v) >= 0);

const initialState = {
    // All available games of the channel
    games: [],
    // Currently displayed games (shadow copy of "games")
    currentGames: [],
    // error occurred ?
    error: null,
    // data loading ?
    loading: false,
    // total number of items (including filtering criteria)
    totalItems: 0,
    // Page size (used for infinite scrolling)
    pageSize: 24,
    // Only load once
    initialLoad: true,
    sorters: {
        currentSortFunction: sortByNameASC,
        state: {
            "name": "ASC",
            "releaseDate": "ASC",
            "duration": "ASC"
        },
        keys: ["name", "releaseDate", "duration"],
        functions: {
            "name": {
                "ASC": sortByNameASC,
                "DESC": (a, b) => -sortByNameASC(a, b)
            },
            "releaseDate": {
                "ASC": sortByReleaseDateASC,
                "DESC": (a, b) => -sortByReleaseDateASC(a, b)
            },
            "duration": {
                "ASC": sortByDurationASC,
                "DESC": (a, b) => -sortByDurationASC(a, b)
            }
        }
    },
    filters: {
        // Each one is also a key for translation
        genres: [
            "Action",
            "Adventure",
            "Arcade",
            "Board Games",
            "Card",
            "Casual",
            "Educational",
            "Family",
            "Fighting",
            "Indie",
            "MMORPG",
            "Platformer",
            "Puzzle",
            "RPG",
            "Racing",
            "Shooter",
            "Simulation",
            "Sports",
            "Strategy",
            "Misc"
        ],
        platforms: [
            "GBA",
            "PC",
            "PS1",
            "PS2",
            "PS3",
            "PSP"
        ],
        // current filters applied
        activeFilters: []
    }
};

export default function games(state = initialState, action) {

    let newFilters = state.filters.activeFilters;
    let pageSize = state.pageSize;
    let games = state.games;    
    let currentSortFunction = state.sorters.currentSortFunction;
    // computes new version of "games" (for currentGames)
    let newVersion = ({filters = newFilters, sortFunction = currentSortFunction}) => games
        .filter(game => filters.every(condition => condition.filterFunction(game)))
        .sort(sortFunction)

    switch (action.type) {
        case FETCHING_REQUESTED:
            return {
              ...state,
              loading: true
            };
        case FETCHING_OK:
            return {
                ...state,
                loading: false,
                initialLoad: false,
                games: action.games,
                //currentGames: action.games.slice(0, action.pageSize),
                totalItems: action.totalItems,
                pageSize: action.pageSize,
                error: null
            };
        case FETCHING_FAILED:
            return {
                ...state,
                loading: false,
                games: [],
                currentGames: [],
                totalItems: 0,
                error: action.error
            };
        case FETCHING_SCROLLING:
            // compute new currentGames
            let after_fetching = newVersion({});
            return {
                ...state,
                pageSize: action.pageSize,
                currentGames: after_fetching.slice(0, state.currentGames.length + action.pageSize),
            }
        case SORTING_GAMES:
            // compute new currentGames
            let after_sorting = newVersion({sortFunction: action.sortFunction});
            return {
                ...state,
                currentGames: after_sorting.slice(0, pageSize),
                sorters: {
                    ...state.sorters,
                    currentSortFunction: action.sortFunction,
                    state: {
                        ...action.newSortersState
                    }
                }
            };
        case SORTING_ORDER_CHANGED:
            // compute new currentGames
            let after_sorting_2 = newVersion({sortFunction: action.sortFunction});
            return {
                ...state,
                currentGames: after_sorting_2.slice(0, pageSize),
                sorters: {
                    ...state.sorters,
                    currentSortFunction: action.sortFunction,
                    keys: action.keys
                }
            }
        case FILTERING_BY_GENRE:
            // If empty, remove filter - if not, add it
            newFilters = newFilters.filter(s => s.key !== "selected_genres")
            if (action.genres.length !== 0) {
                newFilters.push({
                    key: "selected_genres",
                    value: action.genres,
                    filterFunction: at_least_one_in_common(action.genres)
                })
            }
            // compute new currentGames
            let after_genre_filtering = newVersion({filters: newFilters});

            return {
                ...state,
                totalItems: after_genre_filtering.length,
                currentGames: after_genre_filtering.slice(0, pageSize),
                filters: {
                    ...state.filters,
                    activeFilters: newFilters
                }
            }
        case FILTERING_BY_TITLE:    
            // If empty, remove filter - if not, add it
            if (action.title.length === 0) {
                newFilters = newFilters.filter(s => s.key !== "selected_title")
            } else {
                newFilters.push({
                    key: "selected_title",
                    value: action.title,
                    filterFunction: matches_title_search(action.title)
                })
            }

            // compute new currentGames
            let after_title_filtering = newVersion({filters: newFilters});            

            return {
                ...state,
                totalItems: after_title_filtering.length,
                currentGames: after_title_filtering.slice(0, pageSize),
                filters: {
                    ...state.filters,
                    activeFilters: newFilters
                }
            }
        case FILTERING_BY_PLATFORM:
            // Always clean up in platform filtering
            newFilters = newFilters.filter(s => s.key !== "selected_platform")
            if (action.platform.length !== 0) {
                newFilters.push({
                    key: "selected_platform",
                    value: action.platform,
                    filterFunction: matches_platform_search(action.platform)
                })
            }

            // compute new currentGames
            let after_platform_filtering = newVersion({filters: newFilters}); 

            return {
                ...state,
                totalItems: after_platform_filtering.length,
                currentGames: after_platform_filtering.slice(0, pageSize),
                filters: {
                    ...state.filters,
                    activeFilters: newFilters
                }
            }
        default:
            return state
    }

}