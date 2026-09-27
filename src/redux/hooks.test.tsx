import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({ from: vi.fn() }),
}));

import { makeStore } from './Store';
import { filterByPlatform } from './features/gamesSlice';
import { useAppDispatch, useAppSelector, useAppStore } from './hooks';

describe('typed redux hooks', () => {
    let store: ReturnType<typeof makeStore>;

    beforeEach(() => {
        store = makeStore();
    });

    function wrapperFor(providedStore: ReturnType<typeof makeStore>) {
        return function wrapper({ children }: { children: ReactNode }) {
            return <Provider store={providedStore}>{children}</Provider>;
        };
    }

    it('useAppSelector updates its mounted result when the store changes', () => {
        const { result } = renderHook(
            () => useAppSelector((state) => state.games.activeFilters.length),
            { wrapper: wrapperFor(store) }
        );
        expect(result.current).toBe(0);

        act(() => {
            store.dispatch(filterByPlatform(6));
        });
        expect(result.current).toBe(1);
    });

    it('useAppSelector subscribes to the store in its own provider', () => {
        const otherStore = makeStore();
        const selector = () => useAppSelector((state) => state.games.activeFilters.length);
        const first = renderHook(selector, { wrapper: wrapperFor(store) });
        const second = renderHook(selector, { wrapper: wrapperFor(otherStore) });

        act(() => {
            store.dispatch(filterByPlatform(6));
        });
        expect(first.result.current).toBe(1);
        expect(second.result.current).toBe(0);

        act(() => {
            otherStore.dispatch(filterByPlatform(1));
        });
        expect(first.result.current).toBe(1);
        expect(second.result.current).toBe(1);
    });

    it('useAppDispatch returns the dispatch function from its provider', () => {
        const { result } = renderHook(() => useAppDispatch(), {
            wrapper: wrapperFor(store),
        });
        expect(result.current).toBe(store.dispatch);
        act(() => {
            result.current(filterByPlatform(6));
        });
        expect(store.getState().games.activeFilters).toHaveLength(1);
    });

    it('useAppStore returns the exact store instance from context', () => {
        const { result } = renderHook(() => useAppStore(), {
            wrapper: wrapperFor(store),
        });
        expect(result.current).toBe(store);
    });
});
