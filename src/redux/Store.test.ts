import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        from: vi.fn(),
    }),
}));

import { makeStore } from './Store';
import { gamesAPI } from './services/gamesAPI';
import { planningAPI } from './services/planningAPI';
import { votesAPI } from './services/votesAPI';

describe('makeStore', () => {
    it('creates a fresh, independent store instance on every call', () => {
        expect(makeStore()).not.toBe(makeStore());
    });

    it('registers the games feature reducer under "games" with its initial state', () => {
        const state = makeStore().getState();
        expect(state.games).toEqual({ activeFilters: [] });
    });

    it('registers every RTK Query api reducer under its own reducerPath', () => {
        const state = makeStore().getState();
        expect(state[gamesAPI.reducerPath]).toBeDefined();
        expect(state[planningAPI.reducerPath]).toBeDefined();
        expect(state[votesAPI.reducerPath]).toBeDefined();
    });

    it('dispatching a gamesSlice action only touches that slice', () => {
        const store = makeStore();
        store.dispatch({ type: 'games/filterByTitle', payload: 'mario' });

        expect(store.getState().games.activeFilters).toEqual([{ key: 'selected_title', value: 'mario' }]);
        
        const votesState = store.getState()[votesAPI.reducerPath];
        expect(votesState.queries).toEqual({});
        expect(votesState.mutations).toEqual({});
    });
});