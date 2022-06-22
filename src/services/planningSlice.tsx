import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// @ts-ignore
import type { BasicGame } from "./sharedDefintion.tsx";

// For fetching games for planning
interface planningEntry extends BasicGame {
    status: "RECORDED" | "PENDING";
    endDate?: number
}

export interface PlanningState {
    // error occurred ?
    error: null | Error,
    // data loading ?
    loading: boolean,
    // All available games of the channel
    planning: planningEntry[],
}

const initialState : PlanningState = {
    loading: false,
    error: null,
    planning: []
}

export const fetchPlanning = createAsyncThunk('planning/fetchGames', async () => {
    // current date as integer (quicker comparaison)
    const currentDate = new Date();
    const integerDate = [
        currentDate.getFullYear() * 10000,
        (currentDate.getMonth() + 1) * 100,
        currentDate.getDate()
    ].reduce((acc, cur) => acc + cur, 0);
    const intergerDateRegex = /(?<year>\d{4,})(?<month>\d{2})(?<day>\d{2})/;

    // a scheduled game should only be displayed with these specific conditions
    const should_be_displayed = (elem, min, max) => elem <= max || elem <= min;
    const gamesData = await import("../data/games.json");

    const planningGames = (gamesData.games as BasicGame[])
        // only scheduled games - TODO add a property later for "on hold" entries
        // only active entries
        .filter(game => game.hasOwnProperty("availableAt") && should_be_displayed(integerDate, game.availableAt, game.endAt))
        .map(scheduledGame => {

            const common = {
                id: scheduledGame.playlistId ?? scheduledGame.videoId,
                title: scheduledGame.title,
                platform: scheduledGame.platform,
                status:  (scheduledGame.hasOwnProperty("endAt") ? "RECORDED" : "PENDING")
            };

            // optional date fields
            const optional = ([
                ["releaseDate", scheduledGame?.availableAt?.toString()],
                ["endDate", scheduledGame?.endAt?.toString()]
            ] as [string, string | undefined][] )
                .filter( field => !!field[1] && field[1].match(intergerDateRegex) )
                .reduce( (acc, curr) => {
                    const [key, value] = curr;
                    const { year, month, day } = (intergerDateRegex.exec(value as string) as any).groups;
                    acc[key] = new Date(+year, Number(month) - 1, +day).getTime();
                    return acc;
                }, {});
            
            return {
                ...common,
                ...optional
            }
        }) as planningEntry[];

        return {
            planning: planningGames
        }
});

const planningSlice = createSlice({
    name: 'planning',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchPlanning.pending, (state : PlanningState, _) => {
                state.loading = true;
            })       
            .addCase(fetchPlanning.fulfilled, (state : PlanningState, { payload }) => {
                state.loading = false;
                state.planning = (payload as any).planning as planningEntry[];
                state.error = null;
            })
            .addCase(fetchPlanning.rejected, (state : PlanningState, { payload }) => {
                state.loading = false;
                state.planning = [];
                state.error = payload as Error;
            });
    }
});

// Action creators are generated for each case reducer function
// export const {} = planningSlice.actions;
export default planningSlice.reducer;
