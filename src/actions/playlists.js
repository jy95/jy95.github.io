const { YouTube } = require('better-youtube-api');
const youtube = new YouTube("apiKey");
// l'id de ma chaine
const CHANNEL_ID ="UCG0N7IV-C43AM9psxslejCQ";

export const FETCHING_REQUESTED = "FETCHING_REQUESTED";
export const FETCHING_OK = "FETCHING_OK";
export const FETCHING_FAILED = "FETCHING_FAILED";

// param à la place du () du genre ({title, password})
export const get_playlists = ()  => {
    return (dispatch, getState) => {

        // pour plus tard
        // const { playlists } = getState();

        dispatch(fetchingStarted());

        youtube
            .getChannelPlaylists(CHANNEL_ID)
            .then( playlists => {
                dispatch(fetchingFinished(playlists));
            }).catch( err => {
                dispatch(fetchingFailed(err));
            })

    };
};

const fetchingStarted = () => ({
  type: FETCHING_REQUESTED
});

const fetchingFinished = (playlists) => ({
   type: FETCHING_OK,
   playlists
});

const fetchingFailed = (error) => ({
   type: FETCHING_FAILED,
   error
});