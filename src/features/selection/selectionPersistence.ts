import type { AppStore } from '@/redux/Store';
import { hydrateSelection, parseStoredSelection, SELECTION_STORAGE_KEY, setSelectionStorageAvailable } from './selectionSlice';

/** Called after mount so server and first client render agree. */
export function connectSelectionStorage(store: AppStore) {
    try {
        store.dispatch(hydrateSelection(parseStoredSelection(window.localStorage.getItem(SELECTION_STORAGE_KEY))));
    } catch {
        store.dispatch(hydrateSelection([]));
        store.dispatch(setSelectionStorageAvailable(false));
    }
    let previous = store.getState().selection.ids;
    let externalUpdate = false;
    const onStorage = (event: StorageEvent) => {
        if (event.storageArea !== window.localStorage || (event.key !== null && event.key !== SELECTION_STORAGE_KEY)) return;
        externalUpdate = true;
        store.dispatch(hydrateSelection(parseStoredSelection(event.newValue)));
        previous = store.getState().selection.ids;
        externalUpdate = false;
    };
    const stop = store.subscribe(() => {
        if (externalUpdate) return;
        const ids = store.getState().selection.ids;
        if (ids === previous) return;
        previous = ids;
        try {
            window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(ids));
            store.dispatch(setSelectionStorageAvailable(true));
        } catch {
            store.dispatch(setSelectionStorageAvailable(false));
        }
    });
    window.addEventListener('storage', onStorage);
    return () => { stop(); window.removeEventListener('storage', onStorage); };
}
