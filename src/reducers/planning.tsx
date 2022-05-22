import {
    FETCHING_OK,
    FETCHING_REQUESTED
} from "../actions/planning"

const initialState = {
    planning: [],
    error: null,
    loading: false
};

export default function planning(state = initialState, action) {

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
                planning: action.planning,
                error: null
            };
        default:
            return state
    }

}