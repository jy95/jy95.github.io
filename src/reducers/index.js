import { combineReducers } from "redux"

import games from "./games";
import planning from "./planning"
import themeColor from "./themeColor";
import tests from "./tests";
import latestVideos from "./latestVideos";

const rootReducer = combineReducers({
    games,
    tests,
    planning,
    latestVideos,
    themeColor
});

export default rootReducer;