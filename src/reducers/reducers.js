import { SOME_CONSTANT } from "../actions/actionTypes"

const initialState = {

}

export default function reducers(state = initialState, action) {

    switch (action.type) {
        case SOME_CONSTANT:
            return Object.assign({}, state, {
                "some_field": ""
            })
        default:
            return state
    }

}