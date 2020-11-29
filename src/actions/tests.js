import gamesData from "../data/tests.json";

export const FETCHING_REQUESTED = "TESTS_REQUESTED";
export const FETCHING_OK = "TESTS_FETCHING_OK";

// Regex for duration
const DURATION_REGEX = /(\d+):(\d+):(\d+)/;

export const get_tests = () => {
    return (dispatch, getState) => {

        dispatch(fetchingStarted());

        // Build the object for component
        let games = gamesData
            .games
            .filter(game => game?.visible !== false) // not display not yet public games on channel
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
                    "url_type": url_type,
                    "durationAsInt": parseInt((game.duration || "00:00:00").replace(DURATION_REGEX, "$1$2$3"))
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