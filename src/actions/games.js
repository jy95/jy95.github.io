import gamesData from "../data/games.json";

export const FETCHING_REQUESTED = "GAMES_REQUESTED";
export const FETCHING_OK = "GAMES_FETCHING_OK";
export const FETCHING_FAILED = "GAMES_FETCHING_FAILED";

// param à la place du () du genre ({title, password})
export const get_games = () => {
    return (dispatch, getState) => {

        // pour plus tard
        // const { games } = getState();

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