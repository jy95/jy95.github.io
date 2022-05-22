import { combineReducers } from "redux"

import games from "./games.tsx";
import series from "./series.tsx";
import planning from "./planning.tsx"
import themeColor from "./themeColor.tsx";
import tests from "./tests.tsx";
import latestVideos from "./latestVideos.tsx";
import miscellaneous from "./miscellaneous.tsx"

const rootReducer = combineReducers({
    games,
    series,
    tests,
    planning,
    latestVideos,
    themeColor,
    miscellaneous
});

export default rootReducer;