import { configureStore } from "@reduxjs/toolkit";

// @ts-ignore
import games from "../services/gamesSlice";
// @ts-ignore
import planning from "../services/planningSlice"
// @ts-ignore
import themeColor from "../services/themeColorSlice";
// @ts-ignore
import miscellaneous from "../services/miscellaneousSlice";
// @ts-ignore
import latestVideos from "../services/latestVideosSlice";
// @ts-ignore
import tests from "../services/testsSlice";
// @ts-ignore
import series from "../services/seriesSlice";

/* eslint-disable no-underscore-dangle */
const store = configureStore({
    reducer: {
        games,
        planning,
        themeColor,
        miscellaneous,
        latestVideos,
        tests,
        series
    }
})
export default store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
/* eslint-enable */