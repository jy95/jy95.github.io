import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// @ts-ignore
import { BasicGame, EnhancedGame } from "./sharedDefintion.tsx";

export interface TestsState {
    // error occurred ?
    error: null | Error,
    // data loading ?
    loading: boolean,
    // All available games in test
    games: EnhancedGame[],
}

const initialState : TestsState = {
    loading: false,
    error: null,
    games: []
}

export const fetchTests = createAsyncThunk('tests/fetchGames', async () => {
    const gamesData = await import("../data/tests.json");
    const DURATION_REGEX = /(\d+):(\d+):(\d+)/;

    // Build the object for component
    let games : EnhancedGame[] = (gamesData.games as BasicGame[])
        .map(game => {
            const parts = game.releaseDate.split("/");
            const id = game.playlistId ?? game.videoId;
            const base_url = (
                (game.playlistId) 
                    ? "https://www.youtube.com/playlist?list=" 
                    :  "https://www.youtube.com/watch?v="
            ) + id ;
            const url_type = (game.playlistId) ? "PLAYLIST" : "VIDEO";
            return Object.assign({}, game, {
                "imagesFolder": process.env.PUBLIC_URL + gamesData.coversRootPath + id,
                "imagePath": process.env.PUBLIC_URL + gamesData.coversRootPath + id + "/" + (game.coverFile ?? gamesData.defaultCoverFile),
                "releaseDate": new Date(+parts[2], Number(parts[1]) -1, +parts[0]),
                "url": base_url,
                "url_type": url_type,
                "durationAsInt": parseInt((game?.duration || "00:00:00").replace(DURATION_REGEX, "$1$2$3")),
                "hasResponsiveImages": game?.hasResponsiveImages || gamesData.defaultHasResponsiveImages
            });
        });
});

const planningSlice = createSlice({
    name: 'tests',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchTests.pending, (state : TestsState, _) => {
                state.loading = true;
            })       
            .addCase(fetchTests.fulfilled, (state : TestsState, { payload }) => {
                state.loading = false;
                state.games = (payload as any).games as TestsState[];
                state.error = null;
            })
            .addCase(fetchTests.rejected, (state : TestsState, { payload }) => {
                state.loading = false;
                state.games = [];
                state.error = payload as Error;
            });
    }
});

// Action creators are generated for each case reducer function
// export const {} = planningSlice.actions;
export default planningSlice.reducer;