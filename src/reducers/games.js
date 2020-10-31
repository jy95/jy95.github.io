import {
    FETCHING_FAILED,
    FETCHING_OK,
    FETCHING_REQUESTED
} from "../actions/games"

const initialState = {
    games: [],
    error: null,
    loading: false
};

export default function games(state = initialState, action) {

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
                games: action.games,
                error: null
            };
        case FETCHING_FAILED:
            return {
                ...state,
                loading: false,
                games: [],
                error: action.error
            };
        default:
            return state
    }

}