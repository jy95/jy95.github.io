import gamesList from "../data/games.json";

export const FETCHING_REQUESTED = "FETCHING_REQUESTED";
export const FETCHING_OK = "FETCHING_OK";
export const FETCHING_FAILED = "FETCHING_FAILED";

// param à la place du () du genre ({title, password})
export const get_games = () => {
    return (dispatch, getState) => {

        // pour plus tard
        // const { games } = getState();

        dispatch(fetchingStarted());

        // Build the object for
        let games = gamesList
            .map(game => Object.assign({}, game, {
                "imagePath": "covers/" + game.playlistId + "cover." // check extension
            }))

        dispatch(fetchingFinished(games));

    };
};

const fetchingStarted = () => ({
    type: FETCHING_REQUESTED
});

const fetchingFinished = (games) => ({
    type: FETCHING_OK,
    games
});

const fetchingFailed = (error) => ({
    type: FETCHING_FAILED,
    error
});