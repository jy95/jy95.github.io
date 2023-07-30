import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { BasicVideo, BasicPlaylist, BasicGame, CardGame } from "./sharedDefintion";
import type { RootState } from "../Store"

export interface TestsState {
    /** @description error occurred ? */
    error: null | Error,
    /** @description data loading ? */
    loading: boolean,
    /** @description All available games in test */
    games: CardGame[],
}

const initialState : TestsState = {
    loading: false,
    error: null,
    games: []
}

const SIZES = [
    // Mobile view (small) : 1 entry per row 
    "(max-width: 600px) 100vw",
    // Mobile view : 2 entry per row 
    "(max-width: 600px) 100vw",
    // (Default size) : 4 entries per row 
    "25vw"
]

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
            const base_path = gamesData.coversRootPath + id;
            return Object.assign({}, game, {
                id,
                imagePath: `${ base_path }/${ game.coverFile ?? gamesData.defaultCoverFile }`,
                sizes: (game?.hasResponsiveImages || gamesData.defaultHasResponsiveImages) 
                    ? SIZES.join(", ")
                    : undefined,
                releaseDate: game.releaseDate
                    .split("/")
                    .reduce( (acc : number, curr : string, idx : number) => acc + (parseInt(curr) * Math.pow(100, idx)), 0),
                url: base_url,
                url_type: url_type,
                durationAsInt: (game.duration) 
                    ? Number(game.duration.replaceAll(":", ""))
                    : 0
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

export const selectTests = (state : RootState) => state.tests.games;

// Action creators are generated for each case reducer function
// export const {} = planningSlice.actions;
export default planningSlice.reducer;