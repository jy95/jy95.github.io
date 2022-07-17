import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { BasicVideo, BasicPlaylist, BasicGame, CardGame } from "./sharedDefintion";

export interface TestsState {
    // error occurred ?
    error: null | Error,
    // data loading ?
    loading: boolean,
    // All available games in test
    games: CardGame[],
}

const initialState : TestsState = {
    loading: false,
    error: null,
    games: []
}

export const fetchTests = createAsyncThunk('tests/fetchGames', async () => {
    const gamesData = await import("../data/tests.json");

    // Build the object for component
    let games = (gamesData.games as BasicGame[])
        .map(game => {
            const url_type = ("playlistId" in game) ? "PLAYLIST" : "VIDEO";
            const id = (game as BasicPlaylist).playlistId ?? (game as BasicVideo).videoId;
            const base_url = (
                ("playlistId" in game)
                    ? "https://www.youtube.com/playlist?list=" 
                    :  "https://www.youtube.com/watch?v="
            ) + id ;
            return Object.assign({}, game, {
                id,
                imagesFolder: process.env.PUBLIC_URL + gamesData.coversRootPath + id,
                imagePath: process.env.PUBLIC_URL + gamesData.coversRootPath + id + "/" + (game.coverFile ?? gamesData.defaultCoverFile),
                releaseDate: game.releaseDate
                    .split("/")
                    .reduce( (acc : number, curr : string, idx : number) => acc + (parseInt(curr) * Math.pow(100, idx)), 0),
                url: base_url,
                url_type: url_type,
                durationAsInt: (game.duration) 
                    ? Number(game.duration.replaceAll(":", ""))
                    : 0,
                hasResponsiveImages: game?.hasResponsiveImages || gamesData.defaultHasResponsiveImages
            });
        }) as CardGame[];

        return {
            games
        }
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
                state.games = (payload as any).games as CardGame[];
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