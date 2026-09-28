import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import GamesGalleryGrid from './page';
import type { GameFilters } from '@/types/gamesFilters';

const query = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(window.location.search) }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/redux/services/gamesAPI', () => ({ useGetGamesInfiniteQuery: query }));
vi.mock('@/features/games/components/CardGrid', () => ({ CardGrid: () => <div>Results</div> }));
vi.mock('./_client/GamesFilters', () => ({
    default: ({ filters, onChange }: { filters: GameFilters; onChange: (changes: Partial<GameFilters>) => void }) => (
        <input aria-label="Title" value={filters.title ?? ''} onChange={event => onChange({ title: event.target.value })} />
    ),
}));

beforeEach(() => {
    window.history.replaceState(null, '', '/games?selected_title=Zelda&selected_platform=6');
    query.mockReset().mockReturnValue({ currentData: { pages: [{ items: [] }] }, isFetching: false });
});

it('queries the shared URL immediately and queries changed filters from page controls', () => {
    const { rerender } = render(<GamesGalleryGrid />);
    expect(screen.getByLabelText('Title')).toHaveValue('Zelda');
    expect(query).toHaveBeenLastCalledWith({ filters: { title: 'Zelda', platform: 6 }, pageSize: 12 });
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Mario' } });
    rerender(<GamesGalleryGrid />);
    expect(query).toHaveBeenLastCalledWith({ filters: { title: 'Mario', platform: 6 }, pageSize: 12 });
    expect(new URLSearchParams(window.location.search).get('selected_title')).toBe('Mario');
});
