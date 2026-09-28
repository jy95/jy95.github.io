import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import GamesGalleryGrid from './page';
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
    default: ({ filters, onChange }: { filters: GameFilters; onChange: (changes: Partial<GameFilters>) => void }) => (
        <div>
            <input aria-label="Title" value={filters.title ?? ''} onChange={event => onChange({ title: event.target.value })} />
            <button onClick={() => onChange({ platform: 1 })}>Platform</button>
            <button onClick={() => onChange({ title: '', platform: undefined, genres: [] })}>Clear</button>
        </div>
    ),
}));

beforeEach(() => {
    navigation.href = '/games?title=Zelda&platform=6';
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

it('queries the shared URL, changes filters, and clears them from page controls', () => {
    const { rerender } = render(<GamesGalleryGrid />);
    expect(screen.getByLabelText('Title')).toHaveValue('Zelda');
    expect(query).toHaveBeenLastCalledWith({ filters: { title: 'Zelda', platform: 6 }, pageSize: 12 });
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Mario' } });
    rerender(<GamesGalleryGrid />);
    expect(query).toHaveBeenLastCalledWith({ filters: { title: 'Mario', platform: 6 }, pageSize: 12 });
    expect(screen.queryByText('Zelda')).not.toBeInTheDocument();
    expect(screen.getByText('Mario')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    rerender(<GamesGalleryGrid />);
    expect(query).toHaveBeenLastCalledWith({ filters: {}, pageSize: 12 });
    expect(screen.getByText('All games')).toBeInTheDocument();
    expect(new URL(navigation.href, 'http://localhost').search).toBe('');
});

it('loads the next page and uses navigation filters for a fresh result', async () => {
    const { rerender } = render(<GamesGalleryGrid />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'loadMore' })); });
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Platform' }));
    rerender(<GamesGalleryGrid />);
    expect(query).toHaveBeenLastCalledWith({ filters: { title: 'Zelda', platform: 1 }, pageSize: 12 });
    navigation.href = '/games?title=Zelda&platform=6';
    rerender(<GamesGalleryGrid />);
    expect(query).toHaveBeenLastCalledWith({ filters: { title: 'Zelda', platform: 6 }, pageSize: 12 });
});
