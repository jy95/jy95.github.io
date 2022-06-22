import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// @ts-ignore
import { all_games } from "./gamesSlice.tsx";
// @ts-ignore
import type { EnhancedGame } from "./sharedDefintion.tsx";

type serieType = {
    name: string,
    items: EnhancedGame[]
};

interface SeriesState {
    // error occurred ?
    error: null | Error,
    // data loading ?
    loading: boolean,
    // Series
    series: serieType[]
}

const initialState : SeriesState = {
    series: [],
    loading: false,
    error: null
}

export const fetchSeries = createAsyncThunk('Series/fetchSeries', async () => {

    let games = await all_games();
    const seriesData = await import("../data/series.json");

    // Convert array to { "id": Game }
    let games_dictionary = games.reduce( (acc, game) => {
        acc[game.id] = game;
        return acc;
    }, {})

    const sortByNameASC = (a, b) => new Intl.Collator().compare(a.name, b.name);

    let series = seriesData
        .series
        .map(serie => {
            return {
                "name": serie.name,
                "items": serie
                    .games
                    .map( (gameId) => games_dictionary[gameId])
                    .filter(game => game !== undefined)
            }
        })
        .filter(serie => serie.items.length > 0)
        .sort(sortByNameASC);

    return {
        series: series
    }
});

const seriesSlice = createSlice({
    name: 'series',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchSeries.pending, (state : SeriesState, _) => {
                state.loading = true;
            })       
            .addCase(fetchSeries.fulfilled, (state : SeriesState, { payload }) => {
                state.loading = false;
                state.series = (payload as any).series as serieType[];
                state.error = null;
            })
            .addCase(fetchSeries.rejected, (state : SeriesState, { payload }) => {
                state.loading = false;
                state.series = [];
                state.error = payload as Error;
            });
    }
});

// Action creators are generated for each case reducer function
// export const {} = seriesSlice.actions;
export default seriesSlice.reducer;