import {
    FETCHING_FAILED,
    FETCHING_OK
} from "../actions/playlists"

const initialState = {
    data: []
};

export default function playlists(state = initialState, action) {

    switch (action.type) {
        case FETCHING_OK:
            return {
                ...state,
                data: action.payload,
                got_errors: false
            };
        case FETCHING_FAILED:
            return {
                ...state,
                data: [],
                got_errors: true
            };
        default:
            return state
    }

}