import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        from: vi.fn(),
    }),
}));

import { makeStore } from './Store';
import { api } from './services/api';

describe('makeStore', () => {
    it('creates a fresh, independent store instance on every call', () => {
        expect(makeStore()).not.toBe(makeStore());
    });

    it('registers the games feature reducer under "games" with its initial state', () => {
        const state = makeStore().getState();
        expect(state.games).toEqual({ activeFilters: [] });
    });

    it('registers the shared RTK Query reducer under the shared reducerPath', () => {
        const state = makeStore().getState();
        expect(state[api.reducerPath]).toBeDefined();
    });

    it('uses one shared RTK Query cache for injected endpoints', () => {
        expect(api.reducerPath).toBe('api');
    });

    it('dispatching a gamesSlice action only touches that slice', () => {
        const store = makeStore();
        store.dispatch({ type: 'games/filterByTitle', payload: 'mario' });
        expect(store.getState().games.activeFilters).toEqual([{ key: 'selected_title', value: 'mario' }]);

        const apiState = store.getState()[api.reducerPath];
        expect(apiState.queries).toEqual({});
        expect(apiState.mutations).toEqual({});
    });
});
