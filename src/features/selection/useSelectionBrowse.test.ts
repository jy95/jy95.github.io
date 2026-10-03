import { act, renderHook } from '@testing-library/react';
import { useSelectionBrowse } from './useSelectionBrowse';
import type { SelectionEntry } from './catalogue';

const navigation = vi.hoisted(() => ({ query: '', push: vi.fn(), replace: vi.fn() }));
vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(navigation.query),
    usePathname: () => '/selection',
    useRouter: () => navigation,
}));
const entries: SelectionEntry[] = Array.from({ length: 30 }, (_, index) => ({
    source: 'published', category: index % 2 ? 'dlcs' : 'games', selectionId: `${index}`,
    game: { id: `${index}`, title: `Game ${String(index).padStart(2, '0')}`, platform: index % 2,
        imagePath: '/cover.webp', url_type: 'VIDEO', url: 'https://youtube.com' },
}));
beforeEach(() => { navigation.query = ''; });

it('combines category, game filtering, and sorting', () => {
    const { result } = renderHook(() => useSelectionBrowse(entries));
    act(() => result.current.setKind('dlcs'));
    expect(result.current.visibleEntries.every(entry => entry.category === 'dlcs')).toBe(true);
    act(() => result.current.updateFilters({ platform: 1, sort: 'title_desc' }));
    expect(result.current.visibleEntries[0].selectionId).toBe('29');
    act(() => result.current.updateFilters({ title: 'Game 29' }));
    expect(result.current.visibleEntries[0].game.title).toBe('Game 29');
    act(() => result.current.updateFilters({ platform: 0 }));
    expect(result.current.visibleEntries).toEqual([]);
});

it('loads pages and resets immediately for entries, category, and game filters', () => {
    const { result, rerender } = renderHook(({ items }) => useSelectionBrowse(items), { initialProps: { items: entries } });
    expect(result.current.visibleEntries).toHaveLength(12);
    act(() => result.current.loadMore());
    expect(result.current.visibleEntries).toHaveLength(24);
    rerender({ items: [...entries] });
    expect(result.current.visibleEntries).toHaveLength(12);
    act(() => result.current.loadMore());
    act(() => result.current.setKind('games'));
    expect(result.current.visibleEntries).toHaveLength(12);
    act(() => result.current.loadMore());
    expect(result.current.visibleEntries).toHaveLength(15);
    expect(result.current.hasMore).toBe(false);
    act(() => result.current.updateFilters({ sort: 'title_desc' }));
    expect(result.current.visibleEntries).toHaveLength(12);
    expect(result.current.hasMore).toBe(true);
});

it('preserves the visible array and loaded page across unrelated renders', () => {
    const { result, rerender } = renderHook(() => useSelectionBrowse(entries));
    act(() => result.current.loadMore());
    const visible = result.current.visibleEntries;
    rerender();
    expect(result.current.visibleEntries).toBe(visible);
});
