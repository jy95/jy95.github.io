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

// for responsive pictures
const SIZES_WITDH = [
    {
        name: "small",
        srcSet: "150w",
        sizes: "(min-width: 1200px) 150px"
    },
    {
        name: "medium",
        srcSet: "200w",
        sizes: "(min-width: 900px) 200px"
    },
    {
        name: "big",
        srcSet: "250w",
        sizes: "250px"
    }
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
            const base_path = process.env.PUBLIC_URL + gamesData.coversRootPath + id;
            return Object.assign({}, game, {
                id,
                imagePath: `${ base_path }/${ game.coverFile ?? gamesData.defaultCoverFile }`,
                srcSet: (game?.hasResponsiveImages || gamesData.defaultHasResponsiveImages) 
                    ? SIZES_WITDH
                        .map( ({name, srcSet}) =>`${base_path}/cover@${name}.webp ${srcSet}`)
                        .join(",")
                    : undefined,
                sizes: (game?.hasResponsiveImages || gamesData.defaultHasResponsiveImages) 
                    ? SIZES_WITDH
                        .map( ({sizes}) =>`${sizes}`)
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

export const selectTests = createSelector(
    (state : RootState) => state.tests,
    (tests) => tests
);

// Action creators are generated for each case reducer function
// export const {} = planningSlice.actions;
export default planningSlice.reducer;