import {
    FETCHING_FAILED,
    FETCHING_OK,
    FETCHING_REQUESTED,
    CACHED_RESPONSE
} 
// @ts-ignore
from "../actions/latestVideos.tsx";

const initialState = {
    items: [],
    latestFetchedDate: undefined,
    loading: false,
    error: null
}

function mapRSSItemToGame(items) {
    return items
        .map(item => {
            const videoId = item.link.replace("https://www.youtube.com/watch?v=","");
            return {
                "videoId": videoId,
                "title": item.title,
                "url": item.link,
                "url_type": "VIDEO",
                "imagePath": "https://i.ytimg.com/vi_webp/" + videoId + "/0.webp",
            }
        });
}

export default function latestVideos(state = initialState, action) {
    switch (action.type) {
        case FETCHING_REQUESTED:
            return {
              ...state,
              loading: true
            };
        case FETCHING_OK:
            return {
                ...state,
                loading: false,
                items: mapRSSItemToGame(action.items),
                latestFetchedDate: action.latestFetchedDate,
                error: null
            };
        case CACHED_RESPONSE:
            return {
                ...state,
                loading: false,
                error: null
            }
        case FETCHING_FAILED:
            return {
                ...state,
                loading: false,
                items: [],
                error: action.error
            };
        default: 
            return state;
    }
}
