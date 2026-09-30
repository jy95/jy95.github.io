import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { echoTranslations } from '@/test/mocks/nextIntl';
import SortSelect from './components/SortSelect';
import { useGamesFilters } from './useGamesFilters';

const responsive = vi.hoisted(() => ({ mobile: false }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => responsive.mobile }));
vi.mock('next-intl', () => echoTranslations());

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
    it('merges successive updates, keeps unrelated parameters, and clears filters', () => {
        navigation.href = '/fr/games?campaign=shared';
        const { result, rerender } = renderHook(useGamesFilters);

        act(() => result.current.updateFilters({ title: 'Mario & Luigi' }));
        act(() => result.current.updateFilters({ platform: 6 }));
        act(() => result.current.updateFilters({ genres: [10, 2, 10] }));
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

        act(() => result.current.updateFilters({ title: 'Mario' }));
        act(() => result.current.updateFilters({ platform: 6 }));

        // The router only reached the first request so far.
        navigation.href = navigation.replace.mock.calls[0][0];
        rerender();
        expect(result.current.filters).toEqual({ title: 'Mario', platform: 6 });

        act(() => result.current.updateFilters({ genres: [2] }));
        const final = new URL(navigation.push.mock.lastCall![0], 'http://localhost').searchParams;
        expect(final.get('title')).toBe('Mario');
        expect(final.get('platform')).toBe('6');
        expect(final.getAll('genres')).toEqual(['2']);
        expect(navigation.push.mock.calls[0][0]).toContain('platform=6');
    });

    it('drops pending changes when the URL changes to something we did not request', () => {
        navigation.push.mockImplementation(() => {});
        const { result, rerender } = renderHook(useGamesFilters);
        act(() => result.current.updateFilters({ platform: 6 }));
        expect(result.current.filters.platform).toBe(6);

        navigation.href = '/fr/games?platform=9';
        rerender();
        expect(result.current.filters.platform).toBe(9);
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

describe.each([false, true])('sort controls and URL (mobile: %s)', mobile => {
    it('preserves pending direction changes when selecting a field and follows browser navigation', () => {
        responsive.mobile = mobile;
        navigation.href = '/fr/games?title=Zelda&platform=6&genres=2&sort=duration_desc&campaign=shared';
        navigation.push.mockImplementation(() => {});
        function Controls() {
            const { filters, updateFilters } = useGamesFilters();
            return <SortSelect value={filters.sort} onChange={sort => updateFilters({ sort })} />;
        }
        const { rerender } = render(<Controls />);
        fireEvent.click(screen.getByRole('button', { name: 'gamesLibrary.sortDirection.asc' }));
        const first = navigation.push.mock.lastCall![0];
        expect(first).toContain('sort=duration_asc');
        const select = screen.getByRole('combobox', { name: 'gamesLibrary.sortForm.firstSort' });
        if (mobile) fireEvent.change(select, { target: { value: 'title' } });
        else {
            fireEvent.mouseDown(select);
            fireEvent.click(screen.getByRole('option', { name: 'gamesLibrary.sortLabels.name' }));
        }
        const last = navigation.push.mock.lastCall![0];
        const params = new URL(last, 'http://localhost').searchParams;
        expect(Object.fromEntries(params)).toEqual({ title: 'Zelda', platform: '6', genres: '2', sort: 'title_asc', campaign: 'shared' });
        navigation.href = first;
        rerender(<Controls />);
        if (mobile) expect(select).toHaveValue('title');
        else expect(select).toHaveTextContent('gamesLibrary.sortLabels.name');
        navigation.href = last;
        rerender(<Controls />);
        navigation.href = '/fr/games?sort=releaseDate_desc';
        rerender(<Controls />);
        if (mobile) expect(select).toHaveValue('releaseDate');
        else expect(select).toHaveTextContent('gamesLibrary.sortLabels.releaseDate');
        expect(screen.getByRole('button', { name: 'gamesLibrary.sortDirection.asc' })).toBeEnabled();
        expect(navigation.replace).not.toHaveBeenCalled();
    });
});
