import { combineReducers } from "redux"

import games from "./games";
import planning from "./planning"
import themeColor from "./themeColor";
import tests from "./tests";
import latestVideos from "./latestVideos";
import miscellaneous from "./miscellaneous"

const rootReducer = combineReducers({
    games,
    tests,
    planning,
    latestVideos,
    themeColor,
    miscellaneous
});

export default rootReducer;