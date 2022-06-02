export const FETCHING_REQUESTED = "LATEST_VIDEOS_REQUESTED";
export const FETCHING_OK = "LATEST_VIDEOS_FETCHING_OK";
export const FETCHING_FAILED = "LATEST_VIDEOS_FETCHING_FAILED";
export const CACHED_RESPONSE = "LATEST_VIDEOS_FETCHING_CACHED";

// rss url
// Because Youtube, I have to pass by a proxy
const RSS_YOUTUBE_BASE_PATH = "https://www.youtube.com/feeds/videos.xml?channel_id=";
const YOUTUBE_CHANNEL_ID = "UCG0N7IV-C43AM9psxslejCQ";
const FEED_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_YOUTUBE_BASE_PATH + YOUTUBE_CHANNEL_ID)}`;

// Youtube updates by default rss feed each 15 minutes
const YOUTUBE_REFRESH_TIME_IN_MINUTES = 15;

// rss parser
const { parse } = require('rss-to-json');

// to compute delay in minutes between two dates (d1 : previous / d2 : current)
const diff_minutes = (d1, d2) => Math.abs(
    Math.round(
        (d2.getTime() - d1.getTime()) / 1000
    )
);

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// param à la place du () du genre ({title, password})
export const get_latest_videos = () => {
    return (dispatch, getState) => {
        const {
            latestVideos: {
                items: previousItems,
                latestFetchedDate: previousFetchedDate
            }
        } = getState();

        const dateNow = new Date();
        const shouldRequest = [
            () => previousItems.length === 0,
            () => (previousFetchedDate && diff_minutes(previousFetchedDate, dateNow) >= YOUTUBE_REFRESH_TIME_IN_MINUTES)
        ].some(pred => pred() === true);

        if (shouldRequest){
            dispatch(fetchingStarted());
            parse(FEED_URL, {
                transformResponse: function (data) {
                    // needed for https://allorigins.win/ 
                    return JSON.parse(data)?.contents || "";
                }
            })
                .then(feed => feed.items
                    .map(entry => ({
                        ...entry,
                        title: decodeHtml(entry.title)
                    }))
                )
                .then(items => dispatch(fetchingFinished(items,dateNow)) )
                .catch(error => dispatch(fetchingFailed(error)) );
        } else {
            dispatch(fetchingCached(previousItems));
        }

    }
};

const fetchingStarted = () => ({
    type: FETCHING_REQUESTED
});

const fetchingFinished = (items,latestFetchedDate) => ({
    type: FETCHING_OK,
    items,
    latestFetchedDate
});

const fetchingCached = (items) => ({
    type: CACHED_RESPONSE,
    items
});

const fetchingFailed = (error) => ({
    type: FETCHING_FAILED,
    error
});