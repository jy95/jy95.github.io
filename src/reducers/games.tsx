import {
    FETCHING_FAILED,
    FETCHING_OK,
    FETCHING_REQUESTED,
    SORTING_GAMES,
    SORTING_ORDER_CHANGED,
    FILTERING_BY_GENRE,
    FILTERING_BY_TITLE,
    FILTERING_BY_PLATFORM,
    SCROLLING_FETCHING,
    SCROLLING_OK,
    filtersFunctions
} 
// @ts-ignore
from "../actions/games.tsx"

const initialState = {
    // All available games of the channel
    games: [],
    // error occurred ?
    error: null,
    // data loading ?
    loading: false,
    // scrolling loading ?
    scrollLoading: false,
    // total number of items (including filtering criteria)
    totalItems: 0,
    // current loaded items (used for infinite scrolling)
    currentItemCount: 0,
    // Page size (used for infinite scrolling)
    pageSize: 24,
    // Only load once
    initialLoad: true,
    // sorting 
    sorters: [
        ["name", "ASC"],
        ["releaseDate", "ASC"],
        ["duration", "ASC"]
    ],
    // current filters applied
    activeFilters: []
};

export default function games(state = initialState, action) {

    let newFilters = state.activeFilters;
    let pageSize = state.pageSize;
    let games = state.games;
    let currentItemCount = state.currentItemCount;
    let countMatches = (games, filters) => games
        .reduce(
            //  Fastest way to compute that
            (count, game) => count + (filters.every(condition => filtersFunctions[condition.key](condition.value)(game)) & 1),
            0
        );

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
                totalItems: action.totalItems,
                currentItemCount: action.pageSize,
                pageSize: action.pageSize,
                error: null
            };
        case FETCHING_FAILED:
            return {
                ...state,
                loading: false,
                games: [],
                totalItems: 0,
                currentItemCount: 0,
                error: action.error
            };
        case SCROLLING_FETCHING:
            return {
                ...state,
                scrollLoading: true,
                pageSize: action.pageSize
            }
        case SCROLLING_OK:
            return {
                ...state,
                scrollLoading: false,
                currentItemCount: currentItemCount + pageSize
            }
        case SORTING_GAMES:
            return {
                ...state,
                currentItemCount: 0,
                sorters: action.newSortersState
            };
        case SORTING_ORDER_CHANGED:
            return {
                ...state,
                currentItemCount: 0,
                sorters: action.newSortersState
            }
        case FILTERING_BY_GENRE:
            // If empty, remove filter - if not, add it
            newFilters = newFilters.filter(s => s.key !== "selected_genres")
            if (action.genres.length !== 0) {
                newFilters.push({
                    key: "selected_genres",
                    value: action.genres
                })
            }

            return {
                ...state,
                totalItems: countMatches(games, newFilters),
                currentItemCount: 0,
                activeFilters: newFilters
            }
        case FILTERING_BY_TITLE:    
            // If empty, remove filter - if not, add it
            if (action.title.length === 0) {
                newFilters = newFilters.filter(s => s.key !== "selected_title")
            } else {
                newFilters.push({
                    key: "selected_title",
                    value: action.title
                })
            }
           
            return {
                ...state,
                totalItems: countMatches(games, newFilters),
                currentItemCount: 0,
                activeFilters: newFilters
            }
        case FILTERING_BY_PLATFORM:
            // Always clean up in platform filtering
            newFilters = newFilters.filter(s => s.key !== "selected_platform")
            if (action.platform.length !== 0) {
                newFilters.push({
                    key: "selected_platform",
                    value: action.platform
                })
            }

            return {
                ...state,
                totalItems: countMatches(games, newFilters),
                currentItemCount: 0,
                activeFilters: newFilters
            }
        default:
            return state
    }

}