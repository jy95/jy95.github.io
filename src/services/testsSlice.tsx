import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { BasicVideo, BasicPlaylist, BasicGame, CardGame } from "./sharedDefintion";

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

// for responsive pictures
const SIZES_WITDH = {
    "small": "150w",
    "medium": "200w",
    "big": "250w"
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
            const base_path = process.env.PUBLIC_URL + gamesData.coversRootPath + id;
            return Object.assign({}, game, {
                id,
                imagePath: `${ base_path }/${ game.coverFile ?? gamesData.defaultCoverFile }`,
                srcSet: (game?.hasResponsiveImages || gamesData.defaultHasResponsiveImages) 
                    ? Object
                        .entries(SIZES_WITDH)
                        .map( ([size, param]) =>`${base_path}/cover@${size}.webp ${param}`)
                        .join(",")
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

// Action creators are generated for each case reducer function
// export const {} = planningSlice.actions;
export default planningSlice.reducer;