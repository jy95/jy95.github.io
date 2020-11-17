export const SET_THEME_COLOR = "SET_THEME_COLOR";

export const setThemeColor = ({color, mode}) => {
    return (dispatch, getState) => {
        if (mode === "manual") {
            dispatch(manualSetThemeColor(color))
        } else {
            dispatch(autoSetThemeColor(color))
        }
    }
}

const manualSetThemeColor = (color) => ({
    type: SET_THEME_COLOR,
    color,
    mode: "manual"
});

const autoSetThemeColor = (color) => ({
    type: SET_THEME_COLOR,
    color,
    systemColor: color,
    mode: "auto"
})

