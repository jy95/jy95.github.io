import { combineReducers } from "redux"

import games from "./games";
import planning from "./planning"
import themeColor from "./themeColor";

const rootReducer = combineReducers({
    games,
    planning,
    themeColor
});

export default rootReducer;