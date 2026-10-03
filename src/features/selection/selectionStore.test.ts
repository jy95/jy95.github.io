import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
    SELECTION_STORAGE_KEY, addSelection, clearSelection,
    getSelectionSnapshot, subscribeSelection, toggleSelection,
} from './selectionStore';
import { SELECTION_CATEGORIES, emptySelection } from './selectionDocument';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());
const stored = () => JSON.parse(localStorage.getItem(SELECTION_STORAGE_KEY)!);

it('hydrates saved identifiers (even unresolved ones) without writing', () => {
    const saved = { ...emptySelection(), games: ['missing'], backlog: ['42'] };
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(saved));
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const stop = subscribeSelection(() => {});
    expect(getSelectionSnapshot()).toMatchObject({ document: saved, hydrated: true, storageAvailable: true });
    expect(write).not.toHaveBeenCalled();
    stop();
});

it.each(SELECTION_CATEGORIES)('toggles, persists and survives remount in %s', category => {
    expect(toggleSelection({ id: 'x', category })).toBe(true);
    expect(stored()[category]).toEqual(['x']);
    const stop = subscribeSelection(() => {});
    expect(getSelectionSnapshot().document[category]).toEqual(['x']);
    toggleSelection({ id: 'x', category });
    expect(stored()[category]).toEqual([]);
    stop();
});

it('adds without duplicates, clears, and notifies same-tab subscribers', () => {
    const listener = vi.fn();
    const stop = subscribeSelection(listener);
    addSelection({ ...emptySelection(), games: ['a', 'b'] });
    addSelection({ ...emptySelection(), games: ['b', 'c'], dlcs: ['d'] });
    expect(getSelectionSnapshot().document).toEqual({ ...emptySelection(), games: ['a', 'b', 'c'], dlcs: ['d'] });
    expect(listener).toHaveBeenCalled();
    clearSelection();
    expect(stored()).toEqual(emptySelection());
    stop();
});

it('keeps the snapshot reference stable when nothing changed', () => {
    const stop = subscribeSelection(() => {});
    const before = getSelectionSnapshot();
    clearSelection();
    expect(getSelectionSnapshot()).toBe(before);
    stop();
});

it('syncs from another tab, including clear, without echo writes', () => {
    const stop = subscribeSelection(() => {});
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const document = { ...emptySelection(), dlcs: ['d'] };
    window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: SELECTION_STORAGE_KEY, newValue: JSON.stringify(document) }));
    expect(getSelectionSnapshot().document).toEqual(document);
    window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: null }));
    expect(getSelectionSnapshot().document).toEqual(emptySelection());
    expect(write).not.toHaveBeenCalled();
    stop();
});

it('treats corrupt storage as empty', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, '{broken');
    const stop = subscribeSelection(() => {});
    expect(getSelectionSnapshot().document).toEqual(emptySelection());
    stop();
});

it('blocks mutation on read failure and keeps data on write failure', () => {
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
    write.mockRestore();
    expect(toggleSelection({ id: 'new', category: 'games' })).toBe(true);
    expect(getSelectionSnapshot().storageAvailable).toBe(true);
});