import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import GamesGalleryGrid from './PageClient';
import type { GameFilters } from '@/types/gamesFilters';

const navigation = vi.hoisted(() => ({ href: '/games', push: vi.fn(), replace: vi.fn() }));
const query = vi.hoisted(() => vi.fn());
const fetchNextPage = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
    usePathname: () => new URL(navigation.href, 'http://localhost').pathname,
    useSearchParams: () => new URLSearchParams(new URL(navigation.href, 'http://localhost').search),
    useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
}));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/redux/services/gamesAPI', () => ({ useGetGamesInfiniteQuery: query }));
vi.mock('@/features/games/components/CardGrid', () => ({
    CardGrid: ({ items }: { items: { title: string }[] }) => <div>{items.map(item => <span key={item.title}>{item.title}</span>)}</div>,
}));
vi.mock('./_client/GamesFilters', () => ({
    default: ({ filters }: { filters: GameFilters }) => <div>Filters: {filters.title}</div>,
}));

beforeEach(() => {
    navigation.href = '/games?title=Zelda&platform=6&genres=10&genres=2';
    navigation.push.mockReset().mockImplementation((href: string) => { navigation.href = href; });
    navigation.replace.mockReset().mockImplementation((href: string) => { navigation.href = href; });
    fetchNextPage.mockReset().mockResolvedValue(undefined);
    query.mockReset().mockImplementation(({ filters }: { filters: GameFilters }) => ({
        currentData: { pages: [{ items: [{ title: filters.title ?? 'All games' }] }] },
        hasNextPage: true,
        fetchNextPage,
        isFetching: false,
        isError: false,
    }));
});

it('queries URL filters and loads the next page for the current result', async () => {
    const { rerender } = render(<GamesGalleryGrid />);
    expect(query).toHaveBeenLastCalledWith({ filters: { title: 'Zelda', platform: 6, genres: [2, 10] }, pageSize: 12 });
    expect(screen.getByText('Filters: Zelda')).toBeInTheDocument();
    expect(new URL(navigation.href, 'http://localhost').searchParams.getAll('genres')).toEqual(['10', '2']);
    expect(navigation.push).not.toHaveBeenCalled();
    expect(navigation.replace).not.toHaveBeenCalled();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'loadMore' })); });
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    navigation.href = '/games?title=Mario&platform=1';
    rerender(<GamesGalleryGrid />);
    expect(query).toHaveBeenLastCalledWith({ filters: { title: 'Mario', platform: 1 }, pageSize: 12 });
    expect(screen.getByText('Mario')).toBeInTheDocument();
    expect(screen.queryByText('Zelda')).not.toBeInTheDocument();
});

it('uses currentData while retained data from previous filters is still available', () => {
    query.mockReturnValue({ data: { pages: [{ items: [{ title: 'Previous game' }] }] }, currentData: undefined, isFetching: true });
    render(<GamesGalleryGrid />);
    expect(screen.queryByText('Previous game')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
});

it('keeps pagination visible and retries initial errors', () => {
    const refetch = vi.fn();
    query.mockReturnValue({ isError: true, refetch, hasNextPage: false });
    render(<GamesGalleryGrid />);
    expect(screen.getByRole('button', { name: 'loadMore' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'retry' }));
    expect(refetch).toHaveBeenCalledOnce();
});

it('retains current pages without error feedback after a pagination failure', () => {
    query.mockReturnValue({ currentData: { pages: [{ items: [{ title: 'Current game' }] }] }, isError: true, hasNextPage: true, fetchNextPage });
    render(<GamesGalleryGrid />);
    expect(screen.getByText('Current game')).toBeInTheDocument();
    expect(screen.queryByText('generic')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'loadMore' }));
    expect(fetchNextPage).toHaveBeenCalledOnce();
});
