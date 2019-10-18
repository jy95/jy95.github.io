import {
    FETCHING_FAILED,
    FETCHING_OK,
    FETCHING_REQUESTED
} from "../actions/playlists"

const initialState = {
    playlists: [],
    error: null,
    loading: false
};

export default function playlists(state = initialState, action) {

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
                playlists: action.playlists,
                error: null
            };
        case FETCHING_FAILED:
            return {
                ...state,
                loading: false,
                playlists: [],
                error: action.error
            };
        default:
            return state
    }

}