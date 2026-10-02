import type { AppStore } from '@/redux/Store';
import { hydrateSelection, setSelectionStorageAvailable } from './selectionSlice';
import { parseStoredSelection, SELECTION_STORAGE_KEY } from './storageFormat';
import type { SelectionDocument } from './documentTypes';

export function hydrateSelectionStorage(store: AppStore): void {
    try {
        const stored = window.localStorage.getItem(SELECTION_STORAGE_KEY);
        const parsed = parseStoredSelection(stored);
        store.dispatch(hydrateSelection(parsed));
        // Migrate existing arrays immediately, without echoing external tab updates.
        if (stored !== null && Array.isArray(parsed)) window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(store.getState().selection.document));
    } catch {
        if (!store.getState().selection.hydrated) store.dispatch(hydrateSelection([]));
        store.dispatch(setSelectionStorageAvailable(false));
    }
}

export function writeSelectionStorage(store: AppStore, document: SelectionDocument): void {
    try {
        window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(document));
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
