import { useSyncExternalStore } from 'react';
import { subscribeSelection, getSelectionSnapshot, getSelectionServerSnapshot } from './selectionPersistence';
import type { SelectionCategory } from './documentTypes';

/** Whole-document subscription: re-renders on every selection change. Use for pages. */
export function usePersonalSelection() {
    return useSyncExternalStore(subscribeSelection, getSelectionSnapshot, getSelectionServerSnapshot);
}

/**
 * Per-item subscription: re-renders only when *this* identifier flips.
 * Use for list items (hundreds of bookmark buttons on the catalogue pages).
 */
export function useIsSelected(id: string, category: SelectionCategory) {
    return useSyncExternalStore(
        subscribeSelection,
        () => getSelectionSnapshot().document[category].includes(id),
        () => false,
    );
}

/** True once storage has been read and is writable. */
export function useSelectionWritable() {
    return useSyncExternalStore(
        subscribeSelection,
        () => getSelectionSnapshot().hydrated && getSelectionSnapshot().storageAvailable,
        () => false,
    );
}

