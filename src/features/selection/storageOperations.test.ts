import { isSelectionStorageEvent } from './storageOperations';
import { SELECTION_STORAGE_KEY } from './storageFormat';
it('ignores unrelated keys and session storage', () => {
    expect(isSelectionStorageEvent(new StorageEvent('storage', { key: 'other', storageArea: localStorage }))).toBe(false);
    expect(isSelectionStorageEvent(new StorageEvent('storage', { key: SELECTION_STORAGE_KEY, storageArea: sessionStorage }))).toBe(false);
    expect(isSelectionStorageEvent(new StorageEvent('storage', { key: null, storageArea: localStorage }))).toBe(true);
});
