import gamesData from "../data/games.json";

export const FETCHING_REQUESTED = "GAMES_REQUESTED";
export const FETCHING_OK = "GAMES_FETCHING_OK";
export const FETCHING_FAILED = "GAMES_FETCHING_FAILED";
export const SORTING_GAMES = "SORTING_GAMES";

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

// param à la place du () du genre ({title, password})
export const get_games = () => {
    return (dispatch, getState) => {

        dispatch(fetchingStarted());

        // Build the object for component
        let games = gamesData
            .games
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
                    "imagePath": process.env.PUBLIC_URL + gamesData.coversRootPath + id + "/" + (game.coverFile ?? gamesData.defaultCoverFile),
                    "releaseDate": new Date(+parts[2], parts[1] -1, +parts[0]),
                    "url": base_url,
                    "url_type": url_type
                });
            });

        dispatch(fetchingFinished(games));

    };
};

// Given field is the one that changed
export const sort_games = (field) => {
    return (dispatch, getState) => {
        const { 
            games : {
                games,
                sorters: previousState 
            }
        } = getState();
        
        let newStates = previousState.state;

        // Invert previous state value for this field
        const oldValue = newStates[field];
        const newValue = (oldValue === "ASC") ? "DESC" : "ASC";
        newStates = {
            ...previousState.state,
            [field]: newValue
        }

        // Decide the sort algorithm now
        // Changed field should be the first criteria, other should be unchanged (following my simple order, from now)
        const sortFunction = makeMultiCriteriaSort(
            [field]
                .concat(
                    previousState.keys.filter(s => s !== field)
                )
                .map(criteria => {
                    const sortFcts = previousState.functions[criteria];
                    const state = newStates[criteria];
                    return sortFcts[state];
                })
        );

        // Sort result
        const sortedGames = games.sort(sortFunction);

        // Update state
        dispatch(sortingGames(sortedGames, newStates));
        
    };
};

const fetchingStarted = () => ({
    type: FETCHING_REQUESTED
});

const fetchingFinished = (games) => ({
    type: FETCHING_OK,
    games
});

// eslint-disable-next-line
const fetchingFailed = (error) => ({
    type: FETCHING_FAILED,
    error
});

const sortingGames = (games, newSortersState) => ({
    type: SORTING_GAMES,
    games,
    newSortersState
});