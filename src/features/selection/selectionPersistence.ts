import type { AppStore } from '@/redux/Store';
import { applyExternalSelection, hydrateSelectionStorage, isSelectionStorageEvent, writeSelectionStorage } from './storageOperations';

/** Called after mount so server and first client render agree. */
export function connectSelectionStorage(store: AppStore) {
    hydrateSelectionStorage(store);
    let previous = store.getState().selection.document;
    let externalUpdate = false;
    const onStorage = (event: StorageEvent) => {
        if (!isSelectionStorageEvent(event)) return;
        externalUpdate = true;
        try {
            applyExternalSelection(store, event.newValue);
            previous = store.getState().selection.document;
        } finally { externalUpdate = false; }
    };
    const stop = store.subscribe(() => {
        if (externalUpdate) return;
        const document = store.getState().selection.document;
        if (document === previous) return;
        previous = document;
        writeSelectionStorage(store, document);
    });
    window.addEventListener('storage', onStorage);
    return () => { stop(); window.removeEventListener('storage', onStorage); };
}
