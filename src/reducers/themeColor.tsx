import {
    SET_THEME_COLOR
} from "../actions/themeColor.tsx"

const initialState = {
    currentColor: 'light',
    mode: 'manual',
    systemColor: 'light'
};

export default function themeColor(state = initialState, action) {

    switch (action.type) {
        case SET_THEME_COLOR:
            return {
                ...state,
                currentColor: action.color,
                mode: action.mode,
                systemColor: (action.mode === "auto") ? action.color : state.systemColor
            };
        default:
            return state
    }

}