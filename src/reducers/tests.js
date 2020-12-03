import {
    FETCHING_REQUESTED,
    FETCHING_OK
} from "../actions/tests"

const initialState = {
    games: []
};

export default function tests(state = initialState, action) {
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
        default:
            return state
    }
}