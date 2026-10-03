import { parseStoredSelection, SELECTION_STORAGE_KEY } from './storageFormat';
import { addSelection, clearSelection, getSelectionSnapshot, subscribeSelection, toggleSelection } from './selectionPersistence';
import { SELECTION_CATEGORIES, emptySelection } from './schema';
beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

it('reads saved identifiers before mounting or mutating and restores on remount without writes', () => {
    const document = { ...emptySelection(), games: ['missing'], backlog: ['42'] };
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(document));
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const stop = subscribeSelection(() => {});
    expect(getSelectionSnapshot().document).toEqual(document);
    expect(write).not.toHaveBeenCalled();
    stop();
    toggleSelection({ id: 'new', category: 'games' });
    const reload = subscribeSelection(() => {});
    expect(getSelectionSnapshot().document.games).toEqual(['missing', 'new']);
    addSelection({ ...emptySelection(), dlcs: ['expansion'] });
    expect(JSON.parse(localStorage.getItem(SELECTION_STORAGE_KEY)!)).toEqual(getSelectionSnapshot().document);
    clearSelection();
    expect(localStorage.getItem(SELECTION_STORAGE_KEY)).toBe(JSON.stringify(emptySelection()));
    reload();
});
it('syncs another tab and clearing without echo writes', () => {
    const stop = subscribeSelection(() => {});
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const document = { ...emptySelection(), dlcs: ['dlc-a'], backlog: ['42'] };
    window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: SELECTION_STORAGE_KEY, newValue: JSON.stringify(document) }));
    expect(getSelectionSnapshot().document).toEqual(document);
    window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: null }));
    expect(getSelectionSnapshot().ids).toEqual([]);
    expect(write).not.toHaveBeenCalled();
    stop();
});
it('blocks mutations on read failure and reports write failure without losing saved identifiers', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), games: ['saved'] }));
    const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    const write = vi.spyOn(Storage.prototype, 'setItem');
    expect(toggleSelection({ id: 'new', category: 'games' })).toBe(false);
    expect(write).not.toHaveBeenCalled();
    expect(getSelectionSnapshot().storageAvailable).toBe(false);
    read.mockRestore();
    write.mockImplementation(() => { throw new Error('quota'); });
    expect(toggleSelection({ id: 'new', category: 'games' })).toBe(false);
    expect(getSelectionSnapshot().document.games).toEqual(['saved']);
    expect(getSelectionSnapshot().storageAvailable).toBe(false);
    write.mockRestore();
    expect(toggleSelection({ id: 'new', category: 'games' })).toBe(true);
    expect(getSelectionSnapshot().storageAvailable).toBe(true);
});
it.each(['broken', 'null', '{}', '42'])('handles corrupt storage: %s', value => {
    expect(parseStoredSelection(value)).toEqual(emptySelection());
});
it.each(SELECTION_CATEGORIES)('persists arbitrary identifiers in %s', category => {
    const ids = ['', 'bad.id!?', '日本語 🎮', 'a'.repeat(256), 'backlog:42', '__proto__'];
    for (const id of ids) toggleSelection({ id, category });
    expect(JSON.parse(localStorage.getItem(SELECTION_STORAGE_KEY)!)).toEqual({ ...emptySelection(), [category]: ids });
});
