import { configureStore } from "@reduxjs/toolkit";

import games from "../services/gamesSlice";
import planning from "../services/planningSlice"
import themeColor from "../services/themeColorSlice";
import miscellaneous from "../services/miscellaneousSlice";
import latestVideos from "../services/latestVideosSlice";
import tests from "../services/testsSlice";
import series from "../services/seriesSlice";
import stats from "../services/statsSlice";

/* eslint-disable no-underscore-dangle */
const store = configureStore({
    reducer: {
        games,
        planning,
        themeColor,
        miscellaneous,
        latestVideos,
        tests,
        series,
        stats
    }
})
export default store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch