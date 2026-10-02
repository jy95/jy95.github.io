import { makeStore } from '@/redux/Store';
import { addSelection, clearSelection, hydrateSelection, parseStoredSelection, SELECTION_STORAGE_KEY, toggleSelection } from './selectionSlice';
import { connectSelectionStorage } from './selectionPersistence';
import { parseSharedSelection, selectionQuery } from './sharing';
import { loadSelectionCatalogue } from './catalogue';

beforeEach(() => { localStorage.clear(); });
afterEach(() => { vi.restoreAllMocks(); });

it('toggles, merges without duplicates, and clears game identifiers', () => {
    const store = makeStore();
    store.dispatch(hydrateSelection([]));
    store.dispatch(toggleSelection('game-a'));
    store.dispatch(addSelection(['game-a', 'game-b', 'backlog:42']));
    expect(store.getState().selection.ids).toEqual(['game-a', 'game-b', 'backlog:42']);
    store.dispatch(toggleSelection('game-a'));
    expect(store.getState().selection.ids).toEqual(['game-b', 'backlog:42']);
    store.dispatch(clearSelection());
    expect(store.getState().selection.ids).toEqual([]);
});

it('restores browser storage before subscribing and persists changes across new stores', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, '["game-a"]');
    const store = makeStore();
    expect(store.getState().selection.hydrated).toBe(false);
    const stop = connectSelectionStorage(store);
    expect(store.getState().selection.ids).toEqual(['game-a']);
    store.dispatch(toggleSelection('game-b'));
    stop();
    const reloaded = makeStore();
    const stopReloaded = connectSelectionStorage(reloaded);
    expect(reloaded.getState().selection.ids).toEqual(['game-a', 'game-b']);
    reloaded.dispatch(clearSelection());
    expect(localStorage.getItem(SELECTION_STORAGE_KEY)).toBe('[]');
    stopReloaded();
});

it('syncs another tab and storage clearing without echoing writes', () => {
    const store = makeStore();
    const stop = connectSelectionStorage(store);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: SELECTION_STORAGE_KEY, newValue: '["game-b"]' }));
    expect(store.getState().selection.ids).toEqual(['game-b']);
    expect(write).not.toHaveBeenCalled();
    window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: null }));
    expect(store.getState().selection.ids).toEqual([]);
    stop();
});

it('keeps the feature usable when browser storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    const store = makeStore();
    const stop = connectSelectionStorage(store);
    store.dispatch(toggleSelection('game-a'));
    expect(store.getState().selection).toEqual({ ids: ['game-a'], hydrated: true, storageAvailable: false });
    stop();
});

it.each(['broken', 'null', '{}', '42'])('handles corrupt storage: %s', value => {
    expect(parseStoredSelection(value)).toEqual([]);
});

it('round-trips shared identifiers, removes duplicates and rejects malformed identifiers', () => {
    const ids = ['game-a', 'PL_a-b', 'backlog:42'];
    expect(parseSharedSelection(new URLSearchParams(selectionQuery(ids)))).toEqual(ids);
    expect(parseSharedSelection(new URLSearchParams('games=game-a,game-a,!!!&games=backlog%3A42'))).toEqual(['game-a', 'backlog:42']);
    expect(parseSharedSelection(new URLSearchParams('games='))).toEqual([]);
    expect(parseSharedSelection(new URLSearchParams())).toBeNull();
});

it('resolves every existing game card from series and game tiers', async () => {
    const catalogue = await loadSelectionCatalogue();
    const ids = new Set(catalogue.map(entry => entry.selectionId));
    expect(ids.size).toBe(catalogue.length);
    const series = (await import('@/app/api/series/series.json')).default;
    const tiers = (await import('@/app/api/tier-lists/games/games.json')).default;
    const cards = [...series.flatMap(group => group.items).map(game => 'playlistId' in game ? game.playlistId : game.videoId), ...Object.values(tiers).flat().map(game => game.id)];
    expect(cards.filter(id => !id || !ids.has(id))).toEqual([]);
    expect(catalogue.some(entry => entry.source === 'backlog')).toBe(true);
    expect(catalogue.some(entry => entry.source === 'planning')).toBe(true);
});
