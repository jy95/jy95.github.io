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
        expect(store.removeSelection({ category: 'games', id: 'new' })).toBe(false);
        expect(store.getSelectionSnapshot().invalid).toBe(true);
        expect(localStorage.getItem(store.SELECTION_STORAGE_KEY)).toBe(raw);
    }
    expect(store.clearSelection()).toBe(true);
    expect(store.getSelectionSnapshot().invalid).toBe(false);
});

it('removes idempotently even if a stale control repeats removal', () => {
    store.addSelection({ ...emptySelection(), games: ['ghost'], backlog: ['ghost'] });
    expect(store.removeSelection({ category: 'games', id: 'ghost' })).toBe(true);
    expect(store.removeSelection({ category: 'games', id: 'ghost' })).toBe(true);
    expect(store.getSelectionSnapshot().document).toEqual({ ...emptySelection(), backlog: ['ghost'] });
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
