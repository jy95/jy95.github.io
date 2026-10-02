import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { makeStore } from '@/redux/Store';
import { hydrateSelection } from './selectionSlice';
import { hydrateSelectionStorage, isSelectionStorageEvent, writeSelectionStorage } from './storageOperations';
import { connectSelectionStorage } from './selectionPersistence';
import { SELECTION_STORAGE_KEY } from './storageFormat';
import { emptySelection } from './documentTypes';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

it.each([{ ids: [] }, { ids: ['saved'] }])('handles denied storage access during hydration with initial IDs $ids', ({ ids }) => {
    const store = makeStore();
    if (ids.length) store.dispatch(hydrateSelection(ids));
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new DOMException('denied', 'SecurityError'); });
    hydrateSelectionStorage(store);
    expect(store.getState().selection).toMatchObject({ ids, hydrated: true, storageAvailable: false });
});

it('handles denied storage access during writes and recovers when access is restored', () => {
    const store = makeStore();
    const document = { ...emptySelection(), games: ['a'] };
    store.dispatch(hydrateSelection(document));
    const access = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new DOMException('denied', 'SecurityError'); });
    writeSelectionStorage(store, document);
    expect(store.getState().selection.document).toEqual(document);
    expect(store.getState().selection.storageAvailable).toBe(false);
    access.mockRestore();
    writeSelectionStorage(store, document);
    expect(store.getState().selection.storageAvailable).toBe(true);
    expect(JSON.parse(localStorage.getItem(SELECTION_STORAGE_KEY)!)).toEqual(document);
});

it('preserves an already hydrated in-memory selection if storage reads fail', () => {
    const store = makeStore();
    store.dispatch(hydrateSelection(['saved']));
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    hydrateSelectionStorage(store);
    expect(store.getState().selection).toMatchObject({ ids: ['saved'], hydrated: true, storageAvailable: false });
});
it('reports write failure and recovery without losing the document', () => {
    const store = makeStore();
    const document = { ...emptySelection(), games: ['a'] };
    store.dispatch(hydrateSelection(document));
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    writeSelectionStorage(store, document);
    expect(store.getState().selection.document).toEqual(document);
    expect(store.getState().selection.storageAvailable).toBe(false);
    write.mockRestore();
    writeSelectionStorage(store, document);
    expect(store.getState().selection.storageAvailable).toBe(true);
    expect(JSON.parse(localStorage.getItem(SELECTION_STORAGE_KEY)!)).toEqual(document);
});
it('ignores unrelated keys and session storage and disconnects listeners and subscription', () => {
    expect(isSelectionStorageEvent(new StorageEvent('storage', { key: 'other', storageArea: localStorage }))).toBe(false);
    expect(isSelectionStorageEvent(new StorageEvent('storage', { key: SELECTION_STORAGE_KEY, storageArea: sessionStorage }))).toBe(false);
    expect(isSelectionStorageEvent(new StorageEvent('storage', { key: null, storageArea: localStorage }))).toBe(true);
    const store = makeStore();
    const disconnect = connectSelectionStorage(store);
    disconnect();
    window.dispatchEvent(new StorageEvent('storage', { key: SELECTION_STORAGE_KEY, storageArea: localStorage, newValue: '["external"]' }));
    expect(store.getState().selection.ids).toEqual([]);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    store.dispatch(hydrateSelection(['local']));
    expect(write).not.toHaveBeenCalled();
});
