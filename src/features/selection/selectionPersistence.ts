import type { AppStore } from '@/redux/Store';
import { hydrateSelection, parseStoredSelection, SELECTION_STORAGE_KEY, setSelectionStorageAvailable } from './selectionSlice';

/** Called after mount so server and first client render agree. */
export function connectSelectionStorage(store: AppStore) {
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
    let previous = store.getState().selection.document;
    let externalUpdate = false;
    const onStorage = (event: StorageEvent) => {
        try {
            if (event.storageArea !== window.localStorage || (event.key !== null && event.key !== SELECTION_STORAGE_KEY)) return;
        } catch { return; }
        externalUpdate = true;
        store.dispatch(hydrateSelection(parseStoredSelection(event.newValue)));
        previous = store.getState().selection.document;
        externalUpdate = false;
    };
    const stop = store.subscribe(() => {
        if (externalUpdate) return;
        const document = store.getState().selection.document;
        if (document === previous) return;
        previous = document;
        try {
            window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(document));
            store.dispatch(setSelectionStorageAvailable(true));
        } catch {
            store.dispatch(setSelectionStorageAvailable(false));
        }
    });
    window.addEventListener('storage', onStorage);
    return () => { stop(); window.removeEventListener('storage', onStorage); };
}
