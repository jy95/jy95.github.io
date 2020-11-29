import { combineReducers } from "redux"

import games from "./games";
import planning from "./planning"
import themeColor from "./themeColor";
import tests from "./tests";

const rootReducer = combineReducers({
    games,
    tests,
    planning,
    themeColor
});

export default rootReducer;