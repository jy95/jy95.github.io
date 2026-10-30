import { emptySelection } from '@/domain/selection/operations';
import * as initialStore from './store';

let store: typeof initialStore;
let unsubscribe: (() => void) | undefined;
beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    store = await import('./store');
});
afterEach(() => { unsubscribe?.(); unsubscribe = undefined; vi.restoreAllMocks(); localStorage.clear(); });

it('reloads persisted identifiers and merges into a non-empty document per category', async () => {
    store.addSelection({ ...emptySelection(), games: ['saved', 'same'], planning: ['same'] });
    const incoming = { ...emptySelection(), games: ['same', 'missing', 'missing'], backlog: ['same', 'ghost'] };
    expect(store.addSelection(incoming)).toBe(true);
    const expected = { ...emptySelection(), games: ['saved', 'same', 'missing'], planning: ['same'], backlog: ['same', 'ghost'] };
    vi.resetModules();
    store = await import('./store');
    unsubscribe = store.subscribeSelection(vi.fn());
    expect(store.getSelectionSnapshot().document).toEqual(expected);
    expect(JSON.parse(localStorage.getItem(store.SELECTION_STORAGE_KEY)!)).toEqual(expected);
});

it('distinguishes absent storage from invalid data and requires explicit reset', () => {
    unsubscribe = store.subscribeSelection(vi.fn());
    expect(store.getSelectionSnapshot().invalid).toBe(false);
    for (const raw of ['broken', '{}', JSON.stringify({ ...emptySelection(), games: [1] })]) {
        localStorage.setItem(store.SELECTION_STORAGE_KEY, raw);
        expect(store.toggleSelection({ category: 'games', id: 'new' })).toBe(false);
        expect(store.addSelection(emptySelection())).toBe(false);
        expect(store.getSelectionSnapshot().invalid).toBe(true);
        expect(localStorage.getItem(store.SELECTION_STORAGE_KEY)).toBe(raw);
    }
    expect(store.clearSelection()).toBe(true);
    expect(store.getSelectionSnapshot().invalid).toBe(false);
});

it('keeps snapshot references stable across unchanged reads and mutations', () => {
    store.addSelection({ ...emptySelection(), games: ['missing'] });
    const saved = store.getSelectionSnapshot();
    const listener = vi.fn();
    unsubscribe = store.subscribeSelection(listener);
    expect(store.getSelectionSnapshot()).toBe(saved);
    expect(store.addSelection({ ...emptySelection(), games: ['missing'] })).toBe(true);
    window.dispatchEvent(new StorageEvent('storage', { key: store.SELECTION_STORAGE_KEY, storageArea: localStorage }));
    expect(store.getSelectionSnapshot()).toBe(saved);
    expect(listener).not.toHaveBeenCalled();
});

it.each(['getItem', 'setItem'] as const)('reports %s failures without publishing the attempted mutation', method => {
    store.addSelection({ ...emptySelection(), games: ['saved'] });
    vi.spyOn(Storage.prototype, method).mockImplementation(() => { throw new Error('blocked'); });
    expect(store.toggleSelection({ category: 'games', id: 'new' })).toBe(false);
    expect(store.getSelectionSnapshot()).toMatchObject({ storageAvailable: false, document: { games: ['saved'] } });
});

it('synchronizes supported storage events and ignores unrelated storage', () => {
    const listener = vi.fn();
    unsubscribe = store.subscribeSelection(listener);
    const saved = { ...emptySelection(), games: ['missing'] };
    localStorage.setItem(store.SELECTION_STORAGE_KEY, JSON.stringify(saved));
    window.dispatchEvent(new StorageEvent('storage', { key: 'other', storageArea: localStorage }));
    expect(store.getSelectionSnapshot().document).toEqual(emptySelection());
    window.dispatchEvent(new StorageEvent('storage', { key: store.SELECTION_STORAGE_KEY, storageArea: sessionStorage }));
    expect(store.getSelectionSnapshot().document).toEqual(emptySelection());
    window.dispatchEvent(new StorageEvent('storage', { key: store.SELECTION_STORAGE_KEY, storageArea: localStorage }));
    expect(store.getSelectionSnapshot().document).toEqual(saved);
    localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null, storageArea: localStorage }));
    expect(store.getSelectionSnapshot().document).toEqual(emptySelection());
    unsubscribe(); unsubscribe = undefined;
    listener.mockClear();
    window.dispatchEvent(new StorageEvent('storage', { key: null, storageArea: localStorage }));
    expect(listener).not.toHaveBeenCalled();
});

it('batches missing pairs against latest storage while preserving categories and new entries', () => {
    store.addSelection({ ...emptySelection(), games: ['ghost'], dlcs: ['ghost'] });
    localStorage.setItem(store.SELECTION_STORAGE_KEY, JSON.stringify({
        ...emptySelection(), games: ['ghost', 'new'], dlcs: ['ghost'], backlog: ['missing', 'saved'],
    }));
    expect(store.removeSelections([
        { category: 'games', selectionId: 'ghost' },
        { category: 'games', selectionId: 'ghost' },
        { category: 'backlog', selectionId: 'missing' },
    ])).toBe(true);
    const expected = { ...emptySelection(), games: ['new'], dlcs: ['ghost'], backlog: ['saved'] };
    expect(store.getSelectionSnapshot().document).toEqual(expected);
    expect(JSON.parse(localStorage.getItem(store.SELECTION_STORAGE_KEY)!)).toEqual(expected);
    expect(store.removeSelections([{ category: 'games', selectionId: 'ghost' }, { category: 'backlog', selectionId: 'missing' }])).toBe(true);
    expect(store.getSelectionSnapshot().document).toEqual(expected);
});

it('keeps snapshots stable for empty or already removed missing pairs', () => {
    store.addSelection({ ...emptySelection(), games: ['saved'] });
    const saved = store.getSelectionSnapshot();
    const listener = vi.fn();
    unsubscribe = store.subscribeSelection(listener);
    expect(store.removeSelections([])).toBe(true);
    expect(store.removeSelections([{ category: 'games', selectionId: 'gone' }])).toBe(true);
    expect(store.getSelectionSnapshot()).toBe(saved);
    expect(listener).not.toHaveBeenCalled();
    expect(store.getSelectionSnapshot().document.games).toEqual(['saved']);
});

it.each(['getItem', 'setItem'] as const)('preserves stored data when batch cleanup %s fails', method => {
    const document = { ...emptySelection(), games: ['ghost', 'saved'] };
    store.addSelection(document);
    vi.spyOn(Storage.prototype, method).mockImplementation(() => { throw new Error('blocked'); });
    expect(store.removeSelections([{ category: 'games', selectionId: 'ghost' }])).toBe(false);
    expect(store.getSelectionSnapshot()).toMatchObject({ document, storageAvailable: false });
});

it('does not overwrite invalid data during batch cleanup', () => {
    localStorage.setItem(store.SELECTION_STORAGE_KEY, '{}');
    const write = vi.spyOn(Storage.prototype, 'setItem');
    expect(store.removeSelections([{ category: 'games', selectionId: 'ghost' }])).toBe(false);
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(store.SELECTION_STORAGE_KEY)).toBe('{}');
});
