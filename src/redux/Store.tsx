import { configureStore } from "@reduxjs/toolkit";

import games from "./features/gamesSlice";
import { api } from "./services/api";

export const makeStore = () => {
    return configureStore({
        reducer: {
            games,
            [api.reducerPath]: api.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(api.middleware),
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
