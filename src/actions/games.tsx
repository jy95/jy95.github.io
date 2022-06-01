import gamesData from "../data/games.json";

export const FETCHING_REQUESTED = "GAMES_REQUESTED";
export const FETCHING_OK = "GAMES_FETCHING_OK";
export const FETCHING_FAILED = "GAMES_FETCHING_FAILED";
export const SCROLLING_FETCHING = "GAMES_SCROLLING_FETCHING";
export const SCROLLING_OK = "GAMES_SCROLLING_OK";
export const SORTING_GAMES = "SORTING_GAMES";
export const SORTING_ORDER_CHANGED = "SORTING_ORDER_CHANGED";
export const FILTERING_BY_GENRE = "FILTERING_BY_GENRE";
export const FILTERING_BY_TITLE = "FILTERING_BY_TITLE";
export const FILTERING_BY_PLATFORM = "FILTERING_BY_PLATFORM";

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
type possibleSortType = "name" | "releaseDate" | "duration";
type possibleOrdering = "ASC" | "DESC";
type sortStatesType = [possibleSortType, possibleOrdering][];
export const generate_sort_function = (sortStates : sortStatesType) => {
    return makeMultiCriteriaSort(
        sortStates.map( ([key, order]) => sortingFunctions[key](order))
    );
}

// Regex for duration
const DURATION_REGEX = /(\d+):(\d+):(\d+)/; 

// Needed in several sub functions
const all_games = async () => {

    // current date as integer (quicker comparaison)
    const currentDate = new Date();
    const integerDate = [
        currentDate.getFullYear() * 10000,
        (currentDate.getMonth() + 1) * 100,
        currentDate.getDate()
    ].reduce((acc, cur) => acc + cur, 0);

    // Build list of available games
    return gamesData
        .games
        // hide not yet public games on channel
        .filter(game => !game.hasOwnProperty("availableAt") || game.availableAt <= integerDate)
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
                "imagePath": process.env.PUBLIC_URL + gamesData.coversRootPath + id + "/" + (game.coverFile ?? gamesData.defaultCoverFile),
                "releaseDate": new Date(+parts[2], Number(parts[1]) -1, +parts[0]),
                "url": base_url,
                "url_type": url_type,
                "durationAsInt": parseInt((game.duration || "00:00:00").replace(DURATION_REGEX, "$1$2$3"))
            });
        });
}

// param à la place du () du genre ({title, password})
export const get_games = (pageSize = 24) => {
    return async (dispatch, getState) => {
        const {
            games: {
                initialLoad,
                sorters: {
                    currentSortFunction
                },
                filters: {
                    activeFilters: currentFilters
                }
            }
        } = getState();

        // Only load once
        if (initialLoad) {
            // start fetching
            dispatch(fetchingStarted());

            let games = await all_games();
            let currentGames = games
                // remove the ones that doesn't match filter criteria
                .filter(game => currentFilters.every(condition => condition.filterFunction(game)))
                // sort them in user preference
                .sort(currentSortFunction);

            dispatch(fetchingFinished({
                games: currentGames,
                totalItems: games.length,
                pageSize
            }));            
        }
    };
};

// Given field is the one that changed
export const sort_games = (field : possibleSortType) => {
    return (dispatch, getState) => {
        const { 
            games : {
                sorters: previousState
            }
        } = getState();
        
        // Invert previous state value for this field
        const newSortersState = previousState
            .map( ([key, currentOrder]) => {
                if (key === field) {
                    return [key, (currentOrder === "ASC") ? "DESC" : "ASC"]
                } else {
                    return [key, currentOrder];
                }
            })

        // Update state
        dispatch(sortingGames(newSortersState));
    };
};

export const change_sorting_order = (newSortingOrder : possibleSortType[]) => {
    return (dispatch, getState) => {
        const { 
            games : {
                sorters: previousState 
            }
        } = getState();
        
        // get current sorting order for field
        const previousStateOrder : {
            [key in possibleSortType]: possibleOrdering;
        } = previousState.reduce( (acc, [key, currentOrder]) => {
            acc[key] = currentOrder;
            return acc;
        }, {});

        const newStateOrder = newSortingOrder.map(field => [field, previousStateOrder[field]]);

        dispatch(sortCriteriaOrderChanger(newStateOrder))
    };
};

export const filter_games_by_genre = (genres) => {
    return (dispatch, getState) => {
        dispatch(filterGamesByGenres({genres}));
    }
}

export const filter_games_by_title = (title) => {
    return (dispatch, getState) => {
        dispatch(filterGamesByTitle({title}));
    }
}

export const filter_games_by_platform = (platform) => {
    return (dispatch, getState) => {
        dispatch(filterGamesByPlatform({platform}));
    }
}

export const fetch_scrolling_games = (pageSize = 24) => {
    return (dispatch, getState) => {
        dispatch(scrollingFetching({pageSize}));
        dispatch(scrollingFinished())
    }
}

const fetchingStarted = () => ({
    type: FETCHING_REQUESTED
});

const fetchingFinished = ({games, totalItems, pageSize}) => ({
    type: FETCHING_OK,
    games,
    totalItems,
    pageSize
});

// eslint-disable-next-line
const fetchingFailed = (error) => ({
    type: FETCHING_FAILED,
    error
});

const sortingGames = (newSortersState) => ({
    type: SORTING_GAMES,
    newSortersState
});

const sortCriteriaOrderChanger = (newSortersState) => ({
    type: SORTING_ORDER_CHANGED,
    newSortersState
});

const filterGamesByGenres = ({genres}) => ({
    type: FILTERING_BY_GENRE,
    genres
});

const filterGamesByTitle = ({title}) => ({
    type: FILTERING_BY_TITLE,
    title
});

const filterGamesByPlatform = ({platform}) => ({
    type: FILTERING_BY_PLATFORM,
    platform
});

const scrollingFetching = ({pageSize}) => ({
    type: SCROLLING_FETCHING,
    pageSize
})

// eslint-disable-next-line no-empty-pattern
const scrollingFinished = ({} = {}) => ({
    type: SCROLLING_OK
})