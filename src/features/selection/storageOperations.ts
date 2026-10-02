import type { AppStore } from '@/redux/Store';
import { hydrateSelection, setSelectionStorageAvailable } from './selectionSlice';
import { parseStoredSelection, SELECTION_STORAGE_KEY } from './storageFormat';
import type { SelectionDocument } from './documentTypes';

export function hydrateSelectionStorage(store: AppStore): void {
    try {
        const storage = window.localStorage;
        const stored = storage.getItem(SELECTION_STORAGE_KEY);
        const parsed = parseStoredSelection(stored);
        store.dispatch(hydrateSelection(parsed));

        // Migrate existing arrays immediately, without echoing external tab updates.
        if (stored !== null && Array.isArray(parsed)) {
            storage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(store.getState().selection.document));
        }
    } catch {
        const { hydrated } = store.getState().selection;
        if (!hydrated) store.dispatch(hydrateSelection([]));
        store.dispatch(setSelectionStorageAvailable(false));
    }
}

export function writeSelectionStorage(store: AppStore, document: SelectionDocument): void {
    try {
        const storage = window.localStorage;
        storage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(document));
        store.dispatch(setSelectionStorageAvailable(true));
    } catch {
        store.dispatch(setSelectionStorageAvailable(false));
    }
}

export function isSelectionStorageEvent(event: StorageEvent): boolean {
    try {
        return event.storageArea === window.localStorage && (event.key === null || event.key === SELECTION_STORAGE_KEY);
    } catch { return false; }
}

export function applyExternalSelection(store: AppStore, value: string | null): void {
    store.dispatch(hydrateSelection(parseStoredSelection(value)));
}
