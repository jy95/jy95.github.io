import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({ from: vi.fn() }),
}));

import { makeStore } from './Store';
import { useAppDispatch, useAppSelector, useAppStore } from './hooks';

describe('typed redux hooks', () => {
    let store: ReturnType<typeof makeStore>;

    beforeEach(() => {
        store = makeStore();
    });

    function wrapper({ children }: { children: ReactNode }) {
        return <Provider store={store}>{children}</Provider>;
    }

    it('useAppSelector reads state from the nearest store', () => {
        const { result } = renderHook(
            () => useAppSelector((state) => state.games.activeFilters),
            { wrapper }
        );
        expect(result.current).toEqual([]);
    });

    it('useAppSelector reflects state after a dispatch', () => {
        store.dispatch({ type: 'games/filterByTitle', payload: 'zelda' });
        const { result } = renderHook(
            () => useAppSelector((state) => state.games.activeFilters),
            { wrapper }
        );
        expect(result.current).toEqual([{ key: 'selected_title', value: 'zelda' }]);
    });

    it('useAppDispatch returns a callable dispatch function bound to the store', () => {
        const { result } = renderHook(() => useAppDispatch(), { wrapper });
        expect(typeof result.current).toBe('function');
        result.current({ type: 'games/filterByTitle', payload: 'mario' });
        expect(store.getState().games.activeFilters).toEqual([
            { key: 'selected_title', value: 'mario' },
        ]);
    });

    it('useAppStore returns the exact store instance from context', () => {
        const { result } = renderHook(() => useAppStore(), { wrapper });
        expect(result.current).toBe(store);
    });
});
