import {
    FETCHING_FAILED,
    FETCHING_OK,
    FETCHING_REQUESTED
} 
// @ts-ignore
from "../actions/series.tsx"

const initialState = {
    series: [],
    error: null,
    loading: false
}

export default function series(state = initialState, action) {

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
                series: action.series,
                error: null
            };
        case FETCHING_FAILED:
            return {
                ...state,
                loading: false,
                series: [],
                error: action.error
            };

        default:
            return state
    }
}