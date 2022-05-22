import { combineReducers } from "redux"

// @ts-ignore
import games from "./games.tsx";
// @ts-ignore
import series from "./series.tsx";
// @ts-ignore
import planning from "./planning.tsx"
// @ts-ignore
import themeColor from "./themeColor.tsx";
// @ts-ignore
import tests from "./tests.tsx";
// @ts-ignore
import latestVideos from "./latestVideos.tsx";
// @ts-ignore
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