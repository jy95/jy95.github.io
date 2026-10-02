import { parseStoredSelection, SELECTION_STORAGE_KEY } from './storageFormat';
import { makeStore } from '@/redux/Store';
import { clearSelection, setSelectionCategories, toggleSelection } from './selectionSlice';
import { connectSelectionStorage } from './selectionPersistence';
import { emptySelection } from './schema';
beforeEach(() => { localStorage.clear(); });
afterEach(() => { vi.restoreAllMocks(); });

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
    expect(localStorage.getItem(SELECTION_STORAGE_KEY)).toBe(JSON.stringify(emptySelection()));
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
    expect(store.getState().selection).toMatchObject({ ids: ['game-a'], hydrated: true, storageAvailable: false });
    stop();
});

it.each(['broken', 'null', '{}', '42'])('handles corrupt storage: %s', value => {
    expect(parseStoredSelection(value)).toEqual([]);
});

it('migrates storage categories immediately and preserves unresolved selections', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, '["dlc-a","planned-a","backlog:42","missing"]');
    const store = makeStore();
    store.dispatch(setSelectionCategories({ 'dlc-a': 'dlcs', 'planned-a': 'planning' }));
    const stop = connectSelectionStorage(store);
    expect(JSON.parse(localStorage.getItem(SELECTION_STORAGE_KEY)!)).toEqual({ version: 2, games: [], backlog: ['42'], dlcs: ['dlc-a'], planning: ['planned-a'], legacyIds: ['missing'] });
    stop();
});
it('synchronizes categorized storage without echo writes', () => {
    const store = makeStore();
    const stop = connectSelectionStorage(store);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const document = { ...emptySelection(), dlcs: ['dlc-a'], backlog: ['42'] };
    window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: SELECTION_STORAGE_KEY, newValue: JSON.stringify(document) }));
    expect(store.getState().selection.document).toEqual(document);
    expect(write).not.toHaveBeenCalled();
    stop();
});

it('preserves migrated selections when writing storage fails', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, '["dlc-a"]');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    const store = makeStore();
    store.dispatch(setSelectionCategories({ 'dlc-a': 'dlcs' }));
    const stop = connectSelectionStorage(store);
    expect(store.getState().selection.document.dlcs).toEqual(['dlc-a']);
    expect(store.getState().selection.storageAvailable).toBe(false);
    stop();
});


it('persists a non-selection page toggle as legacy until the selection catalogue loads', () => {
    const store = makeStore();
    const stop = connectSelectionStorage(store);
    store.dispatch(toggleSelection('dlc-a'));
    expect(JSON.parse(localStorage.getItem(SELECTION_STORAGE_KEY)!)).toEqual({ ...emptySelection(), legacyIds: ['dlc-a'] });
    store.dispatch(setSelectionCategories({ 'dlc-a': 'dlcs' }));
    expect(store.getState().selection.document).toEqual({ ...emptySelection(), dlcs: ['dlc-a'] });
    expect(JSON.parse(localStorage.getItem(SELECTION_STORAGE_KEY)!)).toEqual({ ...emptySelection(), dlcs: ['dlc-a'] });
    stop();
});

it('does not persist invalid toggles or category updates with unchanged documents', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), games: ['game-a'] }));
    const store = makeStore();
    const stop = connectSelectionStorage(store);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    try {
        store.dispatch(toggleSelection('!!!'));
        store.dispatch(setSelectionCategories({ 'game-b': 'dlcs' }));
        expect(write).not.toHaveBeenCalled();
        store.dispatch(toggleSelection('game-b'));
        expect(write).toHaveBeenCalledTimes(1);
    } finally {
        stop();
    }
});
