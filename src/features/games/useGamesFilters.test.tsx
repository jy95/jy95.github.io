import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGamesFilters } from './useGamesFilters';

// Next updates this snapshot after history changes and popstate navigation.
vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(window.location.search),
}));

beforeEach(() => window.history.replaceState(null, '', '/fr/games'));

describe('URL game filters', () => {
    it('restores a shared URL on first render without rewriting it', () => {
        window.history.replaceState(null, '', '/fr/games?selected_title=Zelda&selected_platform=6&selected_genres=10&selected_genres=2');
        const { result } = renderHook(useGamesFilters);
        expect(result.current.filters).toEqual({ title: 'Zelda', platform: 6, genres: [2, 10] });
        expect(window.location.search).toContain('selected_genres=10&selected_genres=2');
    });

    it('merges rapid updates, preserves path, unrelated parameters and hash, and clears filters', () => {
        window.history.replaceState(null, '', '/fr/games?campaign=shared#library');
        const { result, rerender } = renderHook(useGamesFilters);
        act(() => {
            result.current.updateFilters({ title: 'Mario & Luigi' });
            result.current.updateFilters({ platform: 6 });
            result.current.updateFilters({ genres: [10, 2, 10] });
        });
        rerender();
        expect(result.current.filters).toEqual({ title: 'Mario & Luigi', platform: 6, genres: [2, 10] });
        expect(window.location.pathname).toBe('/fr/games');
        expect(window.location.hash).toBe('#library');
        expect(new URLSearchParams(window.location.search).get('campaign')).toBe('shared');
        act(() => result.current.updateFilters({ title: '', platform: undefined, genres: [] }));
        rerender();
        expect(result.current.filters).toEqual({});
        expect(window.location.search).toBe('?campaign=shared');
    });

    it('responds to browser back and forward', async () => {
        const { result, rerender } = renderHook(useGamesFilters);
        act(() => result.current.updateFilters({ platform: 1 }));
        act(() => result.current.updateFilters({ platform: 6 }));
        async function navigate(direction: 'back' | 'forward') {
            await act(async () => {
                const navigated = new Promise(resolve => window.addEventListener('popstate', resolve, { once: true }));
                window.history[direction]();
                await navigated;
            });
            rerender();
        }
        await navigate('back');
        expect(result.current.filters.platform).toBe(1);
        await navigate('forward');
        expect(result.current.filters.platform).toBe(6);
    });
});
