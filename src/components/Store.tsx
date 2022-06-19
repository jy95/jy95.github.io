import { configureStore } from "@reduxjs/toolkit";

// @ts-ignore
import games from "../services/gamesSlice.tsx";
// @ts-ignore
import planning from "../services/planningSlice.tsx"
// @ts-ignore
import themeColor from "../services/themeColorSlice.tsx";
// @ts-ignore
import miscellaneous from "../services/miscellaneousSlice.tsx";
// @ts-ignore
import latestVideos from "../services/latestVideosSlice.tsx";
// @ts-ignore
import tests from "../services/testsSlice.tsx";
// @ts-ignore
import series from "../services/seriesSlice.tsx";

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