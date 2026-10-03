import { SELECTION_STORAGE_KEY } from './storageFormat';

export function isSelectionStorageEvent(event: StorageEvent): boolean {
    try {
        return event.storageArea === window.localStorage && (event.key === null || event.key === SELECTION_STORAGE_KEY);
    } catch { return false; }
}
