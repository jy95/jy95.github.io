import gamesData from "../data/games.json";

export const FETCHING_REQUESTED = "GAMES_REQUESTED";
export const FETCHING_OK = "GAMES_FETCHING_OK";
export const FETCHING_FAILED = "GAMES_FETCHING_FAILED";
export const SORTING_GAMES = "SORTING_GAMES";
export const SORTING_ORDER_CHANGED = "SORTING_ORDER_CHANGED";

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

// Swap element position in array with its sibling (left or right)
// Exception cases are handled in change_sorting_order
function swapSiblingElements(arr, elementIndex , direction) {
    // elements to swap
    const firstElement = (direction === "up") ? arr[elementIndex]: arr[elementIndex + 1];
    const secondElement = (direction === "up") ? arr[elementIndex - 1] : arr[elementIndex];
    // indexes for slice call
    const firstSliceIndex = (direction === "up") ? elementIndex - 1 : elementIndex;
    const secondSliceIndex = elementIndex + ( (direction === "up") ? 1 : 2);
    // return new array
    return [ 
        ...arr.slice(0, firstSliceIndex), 
        firstElement, 
        secondElement, 
        ...arr.slice(secondSliceIndex) 
    ];
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
            previousState
                .keys
                .map(criteria => {
                    const sortFcts = previousState.functions[criteria];
                    const state = newStates[criteria];
                    return sortFcts[state];
                })
        );

        // Update state
        dispatch(sortingGames(newStates, sortFunction));
        
    };
};

export const change_sorting_order = (field, direction) => {
    return (dispatch, getState) => {
        const { 
            games : {
                sorters: previousState 
            }
        } = getState();

        // Get current position
        const currentIndex = previousState.keys.indexOf(field);

        // Some case shoud not possible
        const wrongCase = 
            currentIndex === -1 ||
            (currentIndex === 0 && direction === "up") ||
            (currentIndex === previousState.keys.length -1 && direction === "down")
        ;
        // if nothing wrong, apply change
        if (!wrongCase){
            const newSortOrder = swapSiblingElements(previousState.keys, currentIndex, direction);
            const sortFunction = makeMultiCriteriaSort(
                newSortOrder
                    .map(criteria => {
                        const sortFcts = previousState.functions[criteria];
                        const state = previousState.state[criteria];
                        return sortFcts[state];
                    })
            );

            dispatch(sortCriteriaOrderChanger(sortFunction, newSortOrder))
        }
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

const sortingGames = (newSortersState, sortFunction) => ({
    type: SORTING_GAMES,
    newSortersState,
    sortFunction
});

const sortCriteriaOrderChanger = (sortFunction, keys) => ({
    type: SORTING_ORDER_CHANGED,
    sortFunction,
    keys
});