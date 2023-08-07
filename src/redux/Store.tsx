import { configureStore } from "@reduxjs/toolkit";

import games from "./features/gamesSlice";
import themeColor from "./features/themeColorSlice";
import miscellaneous from "./features/miscellaneousSlice";
import { gamesAPI } from "./services/gamesAPI";
import { planningAPI } from "./services/planningAPI";
import { seriesAPI } from "./services/seriesAPI";
import { statsAPI } from "./services/statsAPI";
import { testsAPI } from "./services/testsAPI";

/* eslint-disable no-underscore-dangle */
const store = configureStore({
    reducer: {
        // common reducers
        games,
        themeColor,
        miscellaneous,
        // API calls
        [gamesAPI.reducerPath]: gamesAPI.reducer,
        [planningAPI.reducerPath]: planningAPI.reducer,
        [seriesAPI.reducerPath]: seriesAPI.reducer,
        [statsAPI.reducerPath]: statsAPI.reducer,
        [testsAPI.reducerPath]: testsAPI.reducer,
    }
})
export default store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch