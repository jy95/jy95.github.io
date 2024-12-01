import { configureStore } from "@reduxjs/toolkit";

import games from "./features/gamesSlice";
import { gamesAPI } from "./services/gamesAPI";
import { planningAPI } from "./services/planningAPI";
import { seriesAPI } from "./services/seriesAPI";
import { statsAPI } from "./services/statsAPI";
import { testsAPI } from "./services/testsAPI";
import { backlogAPI } from "./services/backlogAPI";
import { platformsAPI } from "./services/platformsAPI"
import { genresAPI } from "./services/genresAPI";
import { dlcsAPI } from "./services/dlcsAPI";

export const makeStore = () => {
    return configureStore({
        reducer: {
            // common reducers
            games,
            // API calls
            [gamesAPI.reducerPath]: gamesAPI.reducer,
            [planningAPI.reducerPath]: planningAPI.reducer,
            [seriesAPI.reducerPath]: seriesAPI.reducer,
            [statsAPI.reducerPath]: statsAPI.reducer,
            [testsAPI.reducerPath]: testsAPI.reducer,
            [backlogAPI.reducerPath]: backlogAPI.reducer,
            [platformsAPI.reducerPath]: platformsAPI.reducer,
            [genresAPI.reducerPath]: genresAPI.reducer,
            [dlcsAPI.reducerPath]: dlcsAPI.reducer
        },
        // Adding the api middleware enables caching, invalidation, polling,
        // and other useful features of `rtk-query`.
        middleware: (getDefaultMiddleware) => getDefaultMiddleware()
            .concat(gamesAPI.middleware)
            .concat(planningAPI.middleware)
            .concat(seriesAPI.middleware)
            .concat(statsAPI.middleware)
            .concat(testsAPI.middleware)
            .concat(backlogAPI.middleware)
            .concat(platformsAPI.middleware)
            .concat(genresAPI.middleware)
            .concat(dlcsAPI.middleware),
    });
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']