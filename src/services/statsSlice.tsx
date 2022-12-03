import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { Platform, Genre, BasicGame } from "./sharedDefintion";

type statsEntry = {
    /** @description  Number of games for this stat (including not yet available ones) */
    total: number,
    /** @description  Number of games for this stat (only available ones) */
    total_available: number,
    /** @description  Number of games for this stat (only unavailable ones) */
    total_unavailable: number    
}

// For extraneous properties in "general"
type statsGeneral = statsEntry & {
    // Info can be found in Youtube RSS feed
    "channel_start_date": string
}

type statsProperty = {
    /** @description  Stats about platforms covered */
    platforms: {
        [P in Platform]?: statsEntry
    },
    /** @description  Stats about genres covered */
    genres: {
        [G in Genre]?: statsEntry
    },
    /** @description  General stats */
    general: statsGeneral
};

export interface StatsState {
    /** @description  error occurred ? */
    error: null | Error,
    /** @description  data loading ? */
    loading: boolean,
    /** @description  All available stats of the channel */
    stats: statsProperty
}

const initialState: StatsState = {
    error: null,
    loading: false,
    stats: {
        platforms: {},
        genres: {},
        general: {
            total: 0,
            total_available: 0,
            total_unavailable: 0,
            // Info can be found in Youtube RSS feed
            channel_start_date: "2014-04-15T17:35:16+00:00"
        }
    }
};

export const fetchStats = createAsyncThunk('stats/fetchStats', async () => {

    const gamesData = await import("../data/games.json");

    // current date as integer (quicker comparaison)
    const currentDate = new Date();
    const integerDate = (currentDate.getFullYear() * 10000) + 
        ( (currentDate.getMonth() + 1) * 100 ) + 
        currentDate.getDate();

    let stats = (gamesData.games as BasicGame[])
        .reduce( (acc : statsProperty, game) => {

            let isAlreadyPublic = (game?.availableAt === undefined) || (game?.availableAt <= integerDate);

            // Update platform stats
            let updatedPlatform = acc.platforms[game.platform] || {
                total: 0,
                total_available: 0,
                total_unavailable: 0
            };

            updatedPlatform.total = updatedPlatform.total + 1;
            if (isAlreadyPublic) {
                updatedPlatform.total_available = updatedPlatform.total_available + 1;
            } else {
                updatedPlatform.total_unavailable = updatedPlatform.total_unavailable + 1;
            }
            acc.platforms[game.platform] = updatedPlatform;

            // Update genres stats
            game.genres.forEach( (genre) => {
                // Update specific genre
                let updatedGenre = acc.genres[genre] || {
                    total: 0,
                    total_available: 0,
                    total_unavailable: 0
                };
                updatedGenre.total = updatedGenre.total + 1;
                if (isAlreadyPublic) {
                    updatedGenre.total_available = updatedGenre.total_available + 1;
                } else {
                    updatedGenre.total_unavailable = updatedGenre.total_unavailable + 1;
                }

                acc.genres[genre] = updatedGenre;
            });

            // Update general stats
            acc.general.total = acc.general.total + 1;
            if (isAlreadyPublic) {
                acc.general.total_available = acc.general.total_available + 1;
            } else {
                acc.general.total_unavailable = acc.general.total_unavailable + 1;
            }

            return acc;
        }, {
            platforms: {},
            genres: {},
            general: {
                total: 0,
                total_available: 0,
                total_unavailable: 0,
                // Info can be found in Youtube RSS feed
                channel_start_date: "2014-04-15T17:35:16+00:00"
            }
        });

    return {
        stats: stats
    }
});


const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchStats.pending, (state : StatsState, _) => {
                state.loading = true;
            })
            .addCase(fetchStats.fulfilled, (state : StatsState, { payload }) => {
                state.loading = false;
                state.stats = (payload as any).stats;
                state.error = null;
            })
            .addCase(fetchStats.rejected, (state : StatsState, { payload }) => {
                state.loading = false;
                state.stats = {
                    platforms: {},
                    genres: {},
                    general: {
                        total: 0,
                        total_available: 0,
                        total_unavailable: 0,
                        // Info can be found in Youtube RSS feed
                        channel_start_date: "2014-04-15T17:35:16+00:00"
                    }
                }
                state.error = payload as Error;
            });
    },
});

export const selectStats = createSelector(
    (state : { stats : StatsState }) => state.stats,
    (stats) => {

        let reducerObject = (prop: { [x: string]: statsEntry}) => Object
            .entries(prop)
            .map( ([key, stats]) => ({
                key: key,
                total: (stats as statsEntry).total,
                total_available: (stats as statsEntry).total_available,
                total_unavailable: (stats as statsEntry).total_unavailable
            }))
            .sort( (a, b) => {
                // Sort by total first
                if (a.total > b.total) return -1;
                if (a.total < b.total) return 1;

                // Then sort by total available
                if (a.total_available > b.total_available) return -1;
                if (a.total_available < b.total_available) return 1;

                // Then sort by total not yet available
                if (a.total_unavailable > b.total_unavailable) return -1;
                if (a.total_unavailable < b.total_unavailable) return 1;                

                // Default case
                return 0;
            });

        return {
            loading: stats.loading,
            error: stats.error,
            stats: {
                general: stats.stats.general,
                genres: reducerObject(stats.stats.genres),
                platforms: reducerObject(stats.stats.platforms)
            }
        };
    }
);

// Action creators are generated for each case reducer function
// export const {} = statsSlice.actions;
export default statsSlice.reducer;