export const FETCHING_REQUESTED = "TESTS_REQUESTED";
export const FETCHING_OK = "TESTS_FETCHING_OK";

// Regex for duration
const DURATION_REGEX = /(\d+):(\d+):(\d+)/;

export const get_tests = () => {
    return async (dispatch, getState) => {
        const {
            tests: {
                games: previousFetchedTests
            }
        } = getState();

        if (previousFetchedTests.length === 0) {

            dispatch(fetchingStarted());

            const gamesData = await import("../data/tests.json");

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
                        "imagesFolder": process.env.PUBLIC_URL + gamesData.coversRootPath + id,
                        "imagePath": process.env.PUBLIC_URL + gamesData.coversRootPath + id + "/" + (game.coverFile ?? gamesData.defaultCoverFile),
                        "releaseDate": new Date(+parts[2], Number(parts[1]) -1, +parts[0]),
                        "url": base_url,
                        "url_type": url_type,
                        "durationAsInt": parseInt((game?.duration || "00:00:00").replace(DURATION_REGEX, "$1$2$3")),
                        "hasResponsiveImages": game?.hasResponsiveImages || gamesData.defaultHasResponsiveImages
                    });
                });
    
            dispatch(fetchingFinished(games));
            
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