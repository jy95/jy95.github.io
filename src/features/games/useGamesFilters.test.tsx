import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGamesFilters } from './useGamesFilters';

const navigation = vi.hoisted(() => ({
    href: '/fr/games',
    push: vi.fn(),
    replace: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    usePathname: () => new URL(navigation.href, 'http://localhost').pathname,
    useSearchParams: () => new URLSearchParams(new URL(navigation.href, 'http://localhost').search),
    useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
}));

beforeEach(() => {
    navigation.href = '/fr/games';
    navigation.push.mockReset().mockImplementation((href: string) => { navigation.href = href; });
    navigation.replace.mockReset().mockImplementation((href: string) => { navigation.href = href; });
});

function currentParams() {
    return new URL(navigation.href, 'http://localhost').searchParams;
}

describe('URL game filters', () => {
    it('merges rapid updates, keeps unrelated parameters, and clears filters', () => {
        navigation.href = '/fr/games?campaign=shared';
        const { result, rerender } = renderHook(useGamesFilters);
        act(() => {
            result.current.updateFilters({ title: 'Mario & Luigi' });
            result.current.updateFilters({ platform: 6 });
            result.current.updateFilters({ genres: [10, 2, 10] });
        });
        rerender();
        expect(result.current.filters).toEqual({ title: 'Mario & Luigi', platform: 6, genres: [2, 10] });
        expect(navigation.replace).toHaveBeenCalledTimes(1);
        expect(navigation.push).toHaveBeenCalledTimes(2);
        expect(navigation.href).toMatch(/^\/fr\/games\?/);
        expect(currentParams().get('campaign')).toBe('shared');
        expect(currentParams().getAll('genres')).toEqual(['2', '10']);

        act(() => result.current.updateFilters({ title: '', platform: undefined, genres: [] }));
        rerender();
        expect(result.current.filters).toEqual({});
        expect(currentParams().toString()).toBe('campaign=shared');
    });

    it('uses the observed URL after back and forward navigation', () => {
        const { result, rerender } = renderHook(useGamesFilters);
        act(() => result.current.updateFilters({ platform: 1 }));
        const first = navigation.href;
        rerender();
        act(() => result.current.updateFilters({ platform: 6 }));
        const second = navigation.href;
        rerender();

        navigation.href = first;
        rerender();
        expect(result.current.filters.platform).toBe(1);
        navigation.href = second;
        rerender();
        expect(result.current.filters.platform).toBe(6);
        act(() => result.current.updateFilters({ genres: [2] }));
        expect(currentParams().get('platform')).toBe('6');
    });

    it('keeps pending changes when an earlier navigation resolves first', () => {
        navigation.push.mockImplementation(() => {});
        navigation.replace.mockImplementation(() => {});
        const { result, rerender } = renderHook(useGamesFilters);
        act(() => {
            result.current.updateFilters({ title: 'Mario' });
            result.current.updateFilters({ platform: 6 });
        });
        navigation.href = navigation.replace.mock.calls[0][0];
        rerender();
        act(() => result.current.updateFilters({ genres: [2] }));
        const final = new URL(navigation.push.mock.lastCall![0], 'http://localhost').searchParams;
        expect(final.get('title')).toBe('Mario');
        expect(final.get('platform')).toBe('6');
        expect(final.getAll('genres')).toEqual(['2']);
        expect(navigation.push.mock.calls[0][0]).toContain('platform=6');
    });

    it('shows a pending filter before the router updates its search params', () => {
        navigation.replace.mockImplementation(() => {});
        const { result } = renderHook(useGamesFilters);
        act(() => result.current.updateFilters({ title: 'Mario' }));
        expect(result.current.filters.title).toBe('Mario');
        expect(navigation.href).toBe('/fr/games');
    });

    it('does not navigate when an update leaves the query unchanged', () => {
        const { result } = renderHook(useGamesFilters);
        act(() => result.current.updateFilters({ title: '' }));
        expect(navigation.push).not.toHaveBeenCalled();
        expect(navigation.replace).not.toHaveBeenCalled();
    });
});
