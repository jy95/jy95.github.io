import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { all_games } from "./gamesSlice";
import type { EnhancedGame } from "./sharedDefintion";

type serieType = {
    name: string,
    items: EnhancedGame[]
};

interface SeriesState {
    /** @description error occurred ? */
    error: null | Error,
    /** @description data loading ? */
    loading: boolean,
    /** @description Series */
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
    let games_dictionary = games.reduce( (acc : {[id: string]: EnhancedGame}, game : EnhancedGame) => {
        acc[game.id] = game;
        return acc;
    }, {})

    const sortByNameASC = (a : serieType, b : serieType) => new Intl.Collator().compare(a.name, b.name);

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
        .filter(serie => serie.items.length > 1)
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