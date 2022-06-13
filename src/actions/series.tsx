import seriesData from "../data/series.json";
import gamesData from "../data/games.json";

export const FETCHING_REQUESTED = "SERIES_REQUESTED";
export const FETCHING_OK = "SERIES_FETCHING_OK";
export const FETCHING_FAILED = "SERIES_FETCHING_FAILED";

// Regex for duration
const DURATION_REGEX = /(\d+):(\d+):(\d+)/;
const sortByNameASC = (a, b) => new Intl.Collator().compare(a.name, b.name);

// param à la place du () du genre ({title, password})
export const get_series = () => {
    return (dispatch, getState) => {
        const {
            series: {
                series: previousFetchedSeries
            }
        } = getState();

        if (previousFetchedSeries.length === 0) {
            dispatch(fetchingStarted());

            // current date as integer (quicker comparaison)
            const currentDate = new Date();
            const integerDate = [
                currentDate.getFullYear() * 10000,
                (currentDate.getMonth() + 1) * 100,
                currentDate.getDate()
            ].reduce((acc, cur) => acc + cur, 0);

            // Build the object for component
            let games = gamesData
                .games
                // hide not yet public games on channel
                .filter(game => !game.hasOwnProperty("availableAt") || game.availableAt <= integerDate)
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
                        "imagePath": process.env.PUBLIC_URL + gamesData.coversRootPath + id + "/" + (game.coverFile ?? gamesData.defaultCoverFile),
                        "releaseDate": new Date(+parts[2], Number(parts[1]) -1, +parts[0]),
                        "url": base_url,
                        "url_type": url_type,
                        "durationAsInt": parseInt((game.duration || "00:00:00").replace(DURATION_REGEX, "$1$2$3")),
                        "hasResponsiveImages": game?.hasResponsiveImages || gamesData.defaultHasResponsiveImages
                    });
                });
            
            // Convert array to { "id": Game }
            let games_dictionary = games.reduce( (acc, game) => {
                acc[game.id] = game;
                return acc;
            }, {})

            let series = seriesData
                .series
                .map(serie => {
                    return {
                        "name": serie.name,
                        "items": serie
                            .games
                            .map( (gameId) => games_dictionary[gameId])
                            .filter(game => game !== undefined)
                    }
                })
                .filter(serie => serie.items.length > 0)
                .sort(sortByNameASC);
                
            dispatch(fetchingFinished(series));
        }

    };
};

const fetchingStarted = () => ({
    type: FETCHING_REQUESTED
});

const fetchingFinished = (series) => ({
    type: FETCHING_OK,
    series
});

// eslint-disable-next-line
const fetchingFailed = (error) => ({
    type: FETCHING_FAILED,
    error
});